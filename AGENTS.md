# AGENTS.md

## Hard Boundaries

- Do not introduce TypeScript syntax, TypeScript utility types, TypeScript-style JSDoc, or generic type expressions since this is a vanilla Javascript with JSDoc for *Javascript* type checking.
- JSDoc annotations may only use real JavaScript/runtime types when they add useful checking.
- Do not add broad placeholder annotations such as `@param {*} value` or `@returns {*} `.
- If a value would only be typed as `Object`, omit the annotation.
- Ask clarifying questions before changing code unless task is unambiguous.
- In your response, the solution should be pragmatic and the response is always concise.
- Do not infer or redesign the data model unless explicitly asked.
- Prefer the smallest changeset that makes the task complete, even if it means it is a net deletion of code.
- Do not over-hedge in the response by adding caveats that do not substantially affect the solution.
- Prefer naming intermediate results when it makes command flow or error handling clearer.
- Do not make changes to files without first showing the intended diff and getting approval.
- Never forget that this app is not a server-client web application and shouldn't be treated that way.
