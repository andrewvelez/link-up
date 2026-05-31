/**
 * App.js - main entrypoint
 * by: Andrew Velez 2026 All Rights Reserved 
 */

import { start } from "./api.js";

await start();

/**
 * Creates rendering window.
 * @param {{ url: string }} options
 */
function createWindow({ url }) {
  console.log("open WebView:", url);
}

createWindow({
  url: "http://127.0.0.1:4510"
});
