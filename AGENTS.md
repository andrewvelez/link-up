# AGENTS.md

## Hard Boundaries

- This is a JavaScript-only project.
- Do not introduce TypeScript syntax, TypeScript utility types, TypeScript-style JSDoc, or generic type expressions.
- JSDoc annotations may only use real JavaScript/runtime types when they add useful checking.
- Do not add broad placeholder annotations such as `@param {*} value` or `@returns {*} `.
- If a value would only be typed as `Object`, omit the annotation.
- Ask clarifying questions before changing code unless task is unambiguous.
- Do not infer or redesign the data model unless explicitly asked.
- Before making edits that affect JSDoc/typechecking behavior, build configuration, or model structure, summarize the intended diff and wait for approval.
- Unless necessary, always prefer synchronous APIs over asynchronous.
- Prefer deleting code when the task remains complete.
- Prefer the smallest changeset that makes the task complete.