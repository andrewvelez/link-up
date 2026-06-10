/**
 * app.js - client side javascript leveraging a service worker for the PWA
 * by: Andrew Velez 2026
 */
"use strict";

const serviceWorker = document.querySelector("#service-worker");

if ("serviceWorker" in navigator && serviceWorker instanceof HTMLLinkElement) {
  window.addEventListener("load", async () => {
    try {
      await navigator.serviceWorker.register(serviceWorker.href);
    } catch (error) {
      console.error("Service worker registration failed:", error);
    }
  });
}
