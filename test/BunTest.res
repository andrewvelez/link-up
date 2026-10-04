/**
 * @author Andrew Velez
 * @license MIT
 * @description Minimal typed bindings to Bun's test runner and assertions.
 */
type expectation<'a>
type spy
type implementation = unit => unit
@module("bun:test") external test: (string, unit => 'result, ~timeout: int=?) => unit = "test"
@module("bun:test") external afterEach: (unit => unit) => unit = "afterEach"
@module("bun:test") external expect: 'a => expectation<'a> = "expect"
@send external toBe: (expectation<'a>, 'a) => unit = "toBe"
@send external toEqual: (expectation<'a>, 'a) => unit = "toEqual"
@send external toContain: (expectation<'a>, string) => unit = "toContain"
@send external toThrow: (expectation<'a>, string) => unit = "toThrow"
@send external toHaveBeenCalledTimes: (expectation<'a>, int) => unit = "toHaveBeenCalledTimes"
@send external toHaveBeenCalledWith: (expectation<'a>, 'args) => unit = "toHaveBeenCalledWith"
@get external negate: expectation<'a> => expectation<'a> = "not"
@module("bun:test") external mock: 'fn => 'fn = "mock"
@module("bun:test") @scope("mock")
external mockModule: (string, unit => 'exports) => unit = "module"
@module("bun:test") @scope("mock") external restore: unit => unit = "restore"
@module("bun:test") @scope("mock") external clear: unit => unit = "clearAllMocks"
@module("bun:test") external spyOn: ('object, string) => spy = "spyOn"
@send external mockImplementation: (spy, implementation) => unit = "mockImplementation"
@send
external toHaveBeenCalledWith2: (expectation<'a>, 'first, 'second) => unit = "toHaveBeenCalledWith"
