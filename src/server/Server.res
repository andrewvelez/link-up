/**
 * @author Andrew Velez
 * @license MIT
 * @description Serve the embedded Link-Up PWA from source or the standalone executable.
 */
let server = BunRuntime.serve({hostname: "127.0.0.1", port: 0, routes: Routes.routes})
Console.log("Link-Up running at " ++ Http.href(server.url))
