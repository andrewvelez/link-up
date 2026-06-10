/**
 * Like ajax but also like htmz
 * by: Andrew Velez 2026
 */
"use strict";

document.addEventListener("click", async (event) => {
  const link = event.target.closest("a[data-swap]");
  if (!link) return;

  event.preventDefault();

  const url = new URL(link.href);

  document.querySelector(url.hash)?.replaceWith(
    ...new DOMParser().parseFromString(
      await (await fetch(url)).text(),
      "text/html",
    ).body.childNodes,
  );
});