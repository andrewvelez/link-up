# AGENTS.md


## Overview / Architecture

- Ask clarifying questions before changing code unless the task is unambiguous.
- Keep responses pragmatic and concise.
- Do not make changes without first showing the intended diff and getting approval.
- If necessary for a task, re-read the markdown design/roadmap docs in `link-up/docs/`.


## Build Commands

- Check everything is ready: `bun ./build.js ready`
- Run the tests: `bun ./build.js test`
- Build the application: `bun ./build.js build`
- Run the application in development: `bun ./build.js dev`


## Code Style

- Use vanilla JavaScript with JavaScript-focused JSDoc; do not introduce TypeScript.
- JSDoc annotations may only use real JavaScript/runtime types when they add useful checking.
- Do not add broad placeholder annotations such as `@param {*} value` or `@returns {*} `.
- Do not infer or redesign the data model unless explicitly asked.
- Prefer the smallest changeset that makes the task complete.
- Prefer naming intermediate results when it makes command flow or error handling clearer.
- Every new file should contain a valid header annotations with the MIT license tag, author name/year, and description.
- Do not add dependency injection to objects or other code tricks just to satsify tests. Regular code shouldn't be modified solely for tests unless their is a benefit for the regular code as well.
