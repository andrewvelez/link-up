/**
 * @author Andrew Velez
 * @license MIT
 * @description Initializes Link-up pages with standard browser APIs.
 *
 * Scope: shared listener setup and service-worker registration.
 * Keep feature logic, persistence, networking, and page-specific behavior in
 * separate modules; call their initialization functions here when needed.
 */

const shareButton = document.querySelector("#share-button");

function shareLinkUp() {
  navigator.share({
    title: "Link-up",
    text: "Take a look at Link-up.",
    url: window.location.href.split("#")[0],
  }).catch((error) => {
    if (error.name !== "AbortError") {
      console.error("Unable to share Link-up.", error);
    }
  });
}

function registerServiceWorker() {
  navigator.serviceWorker.register("./sw.js").catch((error) => {
    console.error("Service-worker registration failed.", error);
  });
}

function addAppListeners() {
  if (shareButton && typeof navigator.share === "function") {
    shareButton.hidden = false;
    shareButton.addEventListener("click", shareLinkUp);
  }

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", registerServiceWorker, { once: true });
  }
}

addAppListeners();
