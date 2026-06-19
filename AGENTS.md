# AGENTS.md

## Hard Boundaries

- This is a JavaScript-only project.
- Do not introduce TypeScript syntax, TypeScript utility types, TypeScript-style JSDoc, or generic type expressions.
- JSDoc annotations may only use real JavaScript/runtime types when they add useful checking.
- Do not add broad placeholder annotations such as `@param {*} value` or `@returns {*} `.
- If a value would only be typed as `Object`, omit the annotation.
- Ask clarifying questions before changing model/data-shape code.
- Do not infer or redesign the data model unless explicitly asked.
- Before making edits that affect typing, build configuration, or model structure, summarize the intended diff and wait for approval.
- The best changeset is the one with the least lines of code, and negative lines of code are even preferred over small changesets.