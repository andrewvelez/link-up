import { expect, test } from "bun:test";
import { spawnSync } from "node:child_process";

test("the dev executable exits successfully", () => {
  const result = spawnSync("./dist/linkup", {
    timeout: 5_000,
  });

  expect(result.error).toBeUndefined();
  expect(result.status).toBe(0);
});
