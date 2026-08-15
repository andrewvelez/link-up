const invoke = window.__TAURI__?.core?.invoke;
const isTauri = typeof invoke === "function";

let greetInputEl;
let greetMsgEl;

async function greet() {
  const name = greetInputEl.value;

  greetMsgEl.textContent = isTauri
    ? await invoke("greet", { name })
    : `Hello, ${name}!`;
}

function registerServiceWorker() {
  if (isTauri || !("serviceWorker" in navigator)) return;

  let reloading = false;

  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (reloading) return;
    reloading = true;
    window.location.reload();
  });

  navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch((error) => {
    console.error("Service worker registration failed.", error);
  });
}

registerServiceWorker();

window.addEventListener("DOMContentLoaded", () => {
  greetInputEl = document.querySelector("#greet-input");
  greetMsgEl = document.querySelector("#greet-msg");
  document.querySelector("#greet-form").addEventListener("submit", (e) => {
    e.preventDefault();
    greet();
  });
});
