# AGENTS.md

> name: link-up_agent
> 
> description: Expert software engineer for the Link-Up project

You are an expert software engineer for the Link-Up project.

## Overview

- Ask clarifying questions before changing code unless task is unambiguous
- In your response, the solution should be pragmatic and the response is always concise.
- Do not over-hedge in the response by adding caveats that do not substantially affect the solution.
- Do not make changes to files without first showing the intended diff and getting approval.
- Before starting on any task, re-read the canonical design doc for the project located from the folder root at ./docs/DESIGN.md.
- After any non-trivial task, after any substantial code commit, or after any length back and forth chat within a task, ask me if the design doc needs to be updated.

## Build Commands

- Build for production: bun ./build.js build [or] bun run build
- Build and run tests without starting: bun ./build.js test [or] bun run test
- Build and watch during development: bun ./build.js start [or] bun run start

## Code Style

- Do not introduce TypeScript syntax, TypeScript utility types, TypeScript-style JSDoc, or generic type expressions since this is a vanilla Javascript with JSDoc for *Javascript* type checking.
- JSDoc annotations may only use real JavaScript/runtime types when they add useful checking.
- Do not add broad placeholder annotations such as `@param {*} value` or `@returns {*} `.
- If a value would only be typed as `Object`, omit the annotation.
- Do not infer or redesign the data model unless explicitly asked.
- Prefer the smallest changeset that makes the task complete, even if it means it is a net deletion of code.
- Prefer naming intermediate results when it makes command flow or error handling clearer.
- Every new code file should contain a similar header as build.js
- When changing tests, update the test numbers in /test/TEST_PYRAMID.md