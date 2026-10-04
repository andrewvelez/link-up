/**
 * @author Andrew Velez
 * @license MIT
 * @description Save and restore globals without losing their property descriptors.
 */
type globals
type descriptor
@val external globals: globals = "globalThis"
@scope("Object") @val
external descriptor: (globals, string) => option<descriptor> = "getOwnPropertyDescriptor"
@scope("Object") @val external define: (globals, string, descriptor) => unit = "defineProperty"
@set_index external set: (globals, string, 'value) => unit = ""
@val external remove: (globals, string) => unit = "Reflect.deleteProperty"
@val external console: unknown = "console"
@val external event: Browser.event = "undefined"
// Dynamic module paths let each browser test run a fresh initialization.
let importModule: string => promise<unit> = %raw("path => import(path)")
let restore = (name, original) => {
  switch original {
  | Some(value) => define(globals, name, value)
  | None => remove(globals, name)
  }
}
