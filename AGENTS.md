# AGENTS.md

## Required Directives

- Always get approval for and show changes before applying changes.
- Diffs should be as small as possible to satisfy the prompt.
- Fewer lines of code changed is the preference.
- You should be prepared to justify every line you change in the strictest sense possible.
- You have full responsibility and accountability for the code you change.  If you broke it, you fix it.
- Do not reiterate the directives to me as I know them already.

## Commands

* Install dependencies
  > `bun install`

* Bundle project for production deployment
  > `bun run build`

* Build project and run all tests (tests are WIP)
  > `bun run test`

* Build project and start local dev server
  > `bun run start`

* Compile ReScript only
  > `bun run res:build`

* Watch ReScript source changes
  > `bun run res:watch`

* Format ReScript source
  > `bun run res:format`

Application code, build tooling, and tests are authored in ReScript. Generated
`.res.js` files and `dist/` are build output; edit the `.res` sources instead.
