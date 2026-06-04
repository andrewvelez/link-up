/**
 * @typedef {object} State
 * @property {Array<object>} users
 */

/** @type {State} */
const state = {
  users: []
};

export async function start() {
  Bun.serve({
    port: 4510,

    fetch(req, server) {
      const url = new URL(req.url);

      if (url.pathname === "/") {
        return Bun.file("./web/index.html");
      }

      if (url.pathname === "/app.js") {
        return new Response(Bun.file("./src/app.js"), {
          headers: {
            "content-type": "application/javascript"
          }
        });
      }

      if (url.pathname === "/app.css") {
        return new Response(Bun.file("./web/app.css"), {
          headers: {
            "content-type": "text/css"
          }
        });
      }

      if (url.pathname === "/ws") {
        if (server.upgrade(req)) {
          return;
        }
      }

      return new Response("Not found", {
        status: 404
      });
    },

    websocket: {
      open(ws) {
        ws.send(JSON.stringify({
          type: "init",
          state
        }));
      },

      message(ws, message) {
        console.log("ws:", message);
      }
    }
  });

  console.log("API listening on http://127.0.0.1:4510");
}
