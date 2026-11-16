# AGENTS.md

## Required Directives

- If the prompt is ambiguous, ask clarifying questions before responding.
- Always get approval for and show changes before applying changes.
- Diffs should be as small as possible to satisfy the prompt.
- You should be prepared to justify every line you change.
- Write code that is easy to read and maintain.
- All src code, test code, jsdoc annotations and examples in docs should be in JavaScript with no references to TypeScript types.
- Prefer synchronous code over asynchronous code.
- Regular code should never have to be modified in order to satisfy or to write a test.

## Build Commands

* Install dependencies
  > `bun install`

* Bundle for development and run tests
  > `bun run build:dev` **or** `bun build.js buildDevelopment`

* Bundle for development, run tests, and start the local server
  > `bun run start:dev` **or** `bun build.js startDevelopment`

* Bundle for production and run tests (deployment is TODO)
  > `bun run deploy:prod` **or** `bun build.js deployProduction`
