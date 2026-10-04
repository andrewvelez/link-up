/**
 * @author Andrew Velez
 * @license MIT
 * @description Child-process helpers that drain output and always stop test servers.
 */
type bytes
type decoder
type reader
type chunk = {done: bool, value: Nullable.t<bytes>}
type decodeOptions = {stream: bool}
type result = {stdout: string, stderr: string, exitCode: int}
@new external decoder: unit => decoder = "TextDecoder"
@send external decode: (decoder, bytes, decodeOptions) => string = "decode"
@send external reader: Http.stream => reader = "getReader"
@send external read: reader => promise<chunk> = "read"
@send external cancel: reader => promise<unit> = "cancel"

let run = async (directory, arguments) => {
  let child = BunRuntime.spawn(arguments, {cwd: directory, stdout: "pipe", stderr: "pipe"})
  let (stdout, stderr, exitCode) = await Promise.all3((
    Http.response(child.stdout, {})->Http.text,
    Http.response(child.stderr, {})->Http.text,
    child.exited,
  ))
  {stdout, stderr, exitCode}
}

let readServerUrl = async stream => {
  let decoder = decoder()
  let reader = reader(stream)
  let output = ref("")
  let url = ref(None)
  while url.contents->Option.isNone {
    let chunk = await read(reader)
    if chunk.done {
      panic("The server exited before startup:\n" ++ output.contents)
    }
    output := output.contents ++ decode(decoder, chunk.value->Nullable.getOrThrow, {stream: true})
    switch output.contents->String.split("Link-Up running at ")->Array.get(1) {
    | Some(address) => url := address->String.split("\n")->Array.get(0)
    | None => ()
    }
  }
  await cancel(reader)
  url.contents->Option.getOrThrow
}

let withServer = async (directory, arguments, callback) => {
  let child = BunRuntime.spawn(arguments, {cwd: directory, stdout: "pipe", stderr: "pipe"})
  let stderr = Http.response(child.stderr, {})->Http.text
  let stop = async () => {
    BunRuntime.kill(child)
    let _ = await Promise.all2((child.exited, stderr))
  }
  try {
    let url = await readServerUrl(child.stdout)
    await callback(url)
  } catch {
  | error =>
    await stop()
    throw(error)
  }
  await stop()
}
