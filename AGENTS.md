# AGENTS.md

## Required Directives

- If needed, ask clarifying questions regarding the prompt before responding.
- Show a minimal diff for approval if asked to change code; otherwise, show code in the response.
- Write code that prioritizes correctness, readability and maintainability over conciseness and speed.
- This project is JavaScript with no TypeScript; that includes JSDoc annotations.
- Code shouldn't be changed to make a test work, but code may be refactored in hindsight if necessary.

## Coding Style

- We should not put markup (html) within js files. At a minimum, web components should have markup/styles separated from scripting.
- Keep each web component and its markup, script, and component-specific styles in its own folder under `src/components/`.
- Web components use the regular DOM; do not use Shadow DOM.

## Build Commands

* Install dependencies
  > `bun install`

* Bundle for development and run tests
  > `bun run build`

* Bundle for development, run tests, and start the local server
  > `bun run start`

* Bundle for production and run tests (deployment is TODO)
  > `bun run deploy`
