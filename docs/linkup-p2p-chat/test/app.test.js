/**
 * Basic HTTP app tests.
 * by: Andrew Velez
 */

import { describe, expect, test } from "bun:test";
import { mkdtemp, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { createHandler } from "../src/app.js";

describe("createHandler", () => {
  test("serves index and fragments", async () => {
    const root = await mkdtemp(join(tmpdir(), "linkup-p2p-chat-"));
    const publicDir = join(root, "public");
    const fragmentDir = join(root, "fragments");
    await mkdir(publicDir);
    await mkdir(fragmentDir);
    await writeFile(join(publicDir, "index.html"), "<main>index</main>");
    await writeFile(join(fragmentDir, "chat.html"), "<link-up-chat></link-up-chat>");

    const handler = createHandler({ publicDir, fragmentDir });
    const index = await handler.fetch(new Request("http://localhost/"), undefined);
    const fragment = await handler.fetch(new Request("http://localhost/fragments/chat.html"), undefined);

    expect(await index?.text()).toBe("<main>index</main>");
    expect(await fragment?.text()).toBe("<link-up-chat></link-up-chat>");
  });

  test("rejects path traversal", async () => {
    const root = await mkdtemp(join(tmpdir(), "linkup-p2p-chat-"));
    const publicDir = join(root, "public");
    const fragmentDir = join(root, "fragments");
    await mkdir(publicDir);
    await mkdir(fragmentDir);

    const handler = createHandler({ publicDir, fragmentDir });
    const response = await handler.fetch(new Request("http://localhost/..%2Fsecret.txt"), undefined);

    expect(response?.status).toBe(404);
  });
});
