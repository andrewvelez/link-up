/**
 * Bun entrypoint for the P2P chat demo.
 * by: Andrew Velez
 */

import { createHandler } from "./app.js";

const port = Number(Bun.env.PORT ?? 3000);
const handler = createHandler();

const server = Bun.serve({
  port,
  fetch: handler.fetch,
  websocket: handler.websocket,
});

console.log(`linkup-p2p-chat listening at ${server.url}`);
