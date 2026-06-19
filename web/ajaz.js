/**
 * Like ajax but also like htmz
 * by: Andrew Velez 2026
 */
"use strict";

document.addEventListener("click", async (event) => {
  if (!(event.target instanceof Element)) return;

  const link = event.target.closest("a[data-swap]");
  if (!(link instanceof HTMLAnchorElement)) return;

  event.preventDefault();

  const url = new URL(link.href);
  if (!url.hash) return;

  const target = document.querySelector(url.hash);
  if (!target) return;

  const response = await fetch(url);
  if (!response.ok) return;

  target.replaceWith(
    ...new DOMParser().parseFromString(
      await response.text(),
      "text/html",
    ).body.childNodes,
  );
});