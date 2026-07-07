// @author Andrew Velez 2026

const appWindow = matchMedia("(display-mode: standalone), (display-mode: minimal-ui)");

function openAppWindow() {
  if (appWindow.matches) location.replace("/app");
}

openAppWindow();
appWindow.addEventListener("change", openAppWindow);

let installPrompt = null;

const installButton = document.querySelector("#install-button");
installButton.hidden = true;

window.addEventListener("beforeinstallprompt", event => {
    event.preventDefault();

    installPrompt = event;
    installButton.hidden = false;
});

installButton.addEventListener("click", async () => {
    if (!installPrompt) return;

    await installPrompt.prompt();

    const { outcome } = await installPrompt.userChoice;

    installPrompt = null;
    installButton.hidden = true;

    console.log(`Install prompt result: ${outcome}`);
});

window.addEventListener("appinstalled", () => {
    installPrompt = null;
    installButton.hidden = true;
});