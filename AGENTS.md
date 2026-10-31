# AGENTS.md

## Required Directives

- If the prompt is ambiguous, ask clarifying questions before responding.
- Always get approval for and show changes before applying changes.
- Diffs should be as small as possible to satisfy the prompt.
- You should be prepared to justify every line you change.
- Write code that is easy to read and maintain.

## Documentation

The docs folder has some artifacts that are historically left over.  These docs are more recent and authoritative.

design.md, locality-design.md, network-search-decisions.md, regional-search-recap.md

## Commands

* Install dependencies
  > `bun install`

* Bundle project for production deployment
  > `bun run build` **or** `bun build.js build`

* Build project and run all tests (tests are WIP)
  > `bun run test` **or** `bun build.js test`

* Build project and start local dev server
  > `bun run start` **or** `bun build.js start`
