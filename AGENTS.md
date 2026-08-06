# AGENTS.md


## Overview

- Ask clarifying questions before changing code unless the task is unambiguous.
- Keep responses pragmatic and concise.
- Do not make changes without first showing the intended diff and getting approval.
- The current design direction for the project is in `link-up/docs/DESIGN.md`.  All other docs may be out of date.
- Do not declare ~~editor configuration~~ **any file** valid from visual inspection. Identify the reported diagnostic, validate the relevant properties against the active extension/schema, and report what was actually verified. If the diagnostic is unavailable from the workspace, ask for its exact text without claiming validity.


## Build Commands

- Check everything is ready: `bun run --bun ./build.js ready`
- Run the tests: `bun run --bun ./build.js test`
- Build the application: `bun run --bun ./build.js build`
- Run the application in development: `bun run --bun ./build.js dev`


## Coding Style

- Use vanilla idiomatic modern JavaScript with JavaScript-focused JSDoc; do not introduce TypeScript.
- JSDoc annotations may only use real JavaScript/runtime types when they add useful checking.
- Prefer more idiomatic and smaller changesets.
- Every new file should contain a valid header comment with the MIT license tag, author name/year, and description.
- Regular code shouldn't be modified solely for tests unless there is a benefit for the regular code as well.

