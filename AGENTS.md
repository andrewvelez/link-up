# AGENTS.md

## Overview / Architecture

- Ask clarifying questions before changing code unless the task is unambiguous.
- Keep responses pragmatic and concise.
- Do not make changes without first showing the intended diff and getting approval.
- If necessary for a task, re-read the markdown design/roadmap docs in `linkup2/docs/`.

## Build Commands

- Install dependencies: `vp install`
- Check formatting and linting: `vp check`
- Build the SPA for production: `vp build`
- Run the SPA during development: `vp dev`
- Run the Tauri application during development: `vp run tauri dev`

## Code Style

- Use vanilla JavaScript with JavaScript-focused JSDoc; do not introduce TypeScript.
- JSDoc annotations may only use real JavaScript/runtime types when they add useful checking.
- Do not add broad placeholder annotations such as `@param {*} value` or `@returns {*} `.
- Do not infer or redesign the data model unless explicitly asked.
- Prefer the smallest changeset that makes the task complete.
- Prefer naming intermediate results when it makes command flow or error handling clearer.
- Every new code file should contain a similar header as `src/main.js`.
