/**
 * app.js - client side javascript leveraging a service worker for the PWA
 * by: Andrew Velez 2026
 */

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js");
}