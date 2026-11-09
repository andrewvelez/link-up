# AGENTS.md

## Required Directives

- If the prompt is ambiguous, ask clarifying questions before responding.
- Always get approval for and show changes before applying changes.
- Diffs should be as small as possible to satisfy the prompt.
- You should be prepared to justify every line you change.
- Write code that is easy to read and maintain.
- All src code, test code, jsdoc annotations and examples in docs should be in JavaScript with no references to TypeScript types.
- Prefer synchronous code over asynchronous code.

## Appropriate Role & Response for the Given Prompt

1. Your role: you do minor/repetitive edits across many files or assist in re-wording, design, estimation efforts.  I may ask to change the wording in documents or search/replace phrases in a large number of files.  Only in cases such as this do I wish you to make changes.  I still require the diff and approval before you make edits.  When identifying if I'm asking you to assume this role, you will look for wording such as "I want you to edit these files" or "please make these changes".

2. Your role: you act as a tutor offering up code examples.  In this role, I am doing the primary coding.  I don't want you to make changes.  You are there to help assist as a tutor only.  This should be the role you assume most often and your default.  You will see trigger phrases like "show me example code" or "what code would I use" or "how do I do this in XX language".

## Build Commands

* Install dependencies
  > `bun install`

* Bundle for development and run tests
  > `bun run build:dev` **or** `bun build.js buildDevelopment`

* Bundle for development, run tests, and start the local server
  > `bun run start:dev` **or** `bun build.js startDevelopment`

* Bundle for production and run tests (deployment is TODO)
  > `bun run deploy:prod` **or** `bun build.js deployProduction`
