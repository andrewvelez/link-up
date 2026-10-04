/**
 * @author Andrew Velez
 * @license MIT
 * @description Bun build, embedded file, process, and HTTP server bindings.
 */
type file

type buildOptions = {
  entrypoints: array<string>,
  outdir?: string,
  naming?: {entry?: string, asset?: string},
  target?: string,
  minify?: bool,
  compile?: {outfile: string},
}
type buildResult = {success: bool, logs: array<unknown>}
type spawnOptions = {cwd?: string, stdout: string, stderr: string}
type child = {exited: promise<int>, stdout: Http.stream, stderr: Http.stream}
type handler = Http.request => promise<Http.response>
type methods = {@as("GET") get: handler, @as("HEAD") head: handler}
@unboxed type route = Methods(methods) | Handler(handler)
type serverOptions = {hostname: string, port: int, routes: Dict.t<route>}
type server = {url: Http.url}

@scope("Bun") @val external file: string => file = "file"
@scope("Bun") @val external build: buildOptions => promise<buildResult> = "build"
@scope("Bun") @val external spawn: (array<string>, spawnOptions) => child = "spawn"
@scope("Bun") @val external serve: serverOptions => server = "serve"
@send external kill: child => unit = "kill"
