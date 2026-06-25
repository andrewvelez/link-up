# AGENTS.md

## Hard Boundaries

- This is a JavaScript-only project.
- Do not introduce TypeScript syntax, TypeScript utility types, TypeScript-style JSDoc, or generic type expressions.
- JSDoc annotations may only use real JavaScript/runtime types when they add useful checking.
- Do not add broad placeholder annotations such as `@param {*} value` or `@returns {*} `.
- If a value would only be typed as `Object`, omit the annotation.
- Ask clarifying questions before changing code unless task is unambiguous.
- Do not infer or redesign the data model unless explicitly asked.
- Unless necessary, always prefer synchronous APIs over asynchronous.
- Prefer deleting code when the task remains complete.
- Prefer the smallest changeset that makes the task complete.
- Do not over-hedge. Give the direct practical answer first; add caveats only when they materially affect the task.
- Prefer naming intermediate results when it makes command flow or error handling clearer.
- Do not make changes to files without first showing the intended diff and getting approval.