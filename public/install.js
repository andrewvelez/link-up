// @author Andrew Velez 2026

function redirectAppWindow() {
  const appWindow = matchMedia("(display-mode: standalone), (display-mode: minimal-ui)");

  function openAppWindow() {
    if (appWindow.matches) location.replace("/app");
  }

  openAppWindow();
  appWindow.addEventListener("change", openAppWindow);
}

function enableInstallButton() {
  let installPrompt = null;
  const installButton = document.querySelector("#install-button");

  function hideInstallButton() {
    installPrompt = null;
    installButton.hidden = true;
  }

  hideInstallButton();

  window.addEventListener("beforeinstallprompt", event => {
    event.preventDefault();

    installPrompt = event;
    installButton.hidden = false;
  });

  installButton.addEventListener("click", async () => {
    if (!installPrompt) return;

    await installPrompt.prompt();

    const { outcome } = await installPrompt.userChoice;

    hideInstallButton();

    console.log(`Install prompt result: ${outcome}`);
  });

  window.addEventListener("appinstalled", hideInstallButton);
}

redirectAppWindow();
enableInstallButton();