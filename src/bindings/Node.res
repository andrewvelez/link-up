/**
 * @author Andrew Velez
 * @license MIT
 * @description Node-compatible filesystem, path, and process APIs provided by Bun.
 */
type copyOptions = {recursive: bool, filter?: (string, string) => bool}
type removeOptions = {recursive?: bool, force: bool}
@module("node:fs") external copy: (string, string, copyOptions) => unit = "cpSync"
@module("node:fs") external remove: (string, removeOptions) => unit = "rmSync"
@module("node:fs") external exists: string => bool = "existsSync"
@module("node:fs") external mkdir: string => unit = "mkdirSync"
@module("node:fs") external temporaryDirectory: string => string = "mkdtempSync"
@module("node:fs") external read: (string, @as("utf8") _) => string = "readFileSync"
@module("node:fs") external write: (string, string) => unit = "writeFileSync"
@module("node:fs") external symlink: (string, string, @as("dir") _) => unit = "symlinkSync"
@module("node:path") external join: (string, string) => string = "join"
@module("node:path") external dirname: string => string = "dirname"
@module("node:os") external tmpdir: unit => string = "tmpdir"
@scope("process") @val external argv: array<string> = "argv"
@scope("process") @val external executable: string = "execPath"
@scope("process") @val external chdir: string => unit = "chdir"
type process = {mutable exitCode: int}
@val external process: process = "process"
@module("node:fs") external readDirectory: string => array<string> = "readdirSync"

// Parsing as a classic script catches accidental module exports in the worker.
type script
@module("node:vm") @new external classicScript: string => script = "Script"
