// assets.js
import indexHtml from "../web/index.html";
import appJs from "../web/app.js";
import swJs from "../web/sw.js";
import stylesCss from "../web/styles.css";
import manifestJson from "../web/manifest.json";

export const assets = {
  "/": indexHtml,
  "/index.html": indexHtml,
  "/app.js": appJs,
  "/sw.js": swJs,
  "/styles.css": stylesCss,
  "/manifest.json": JSON.stringify(manifestJson),
};