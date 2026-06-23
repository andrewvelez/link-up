/**
 * registerServiceWorker.js - register the service worker
 * by: Andrew Velez 2026
 */

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js");
}
