import { $ } from "bun";

await $`mkdir -p dist`;
await $`cp -r web dist/web`;

console.log("build complete");
