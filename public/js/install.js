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
  const installPrompt = document.querySelector("#install-prompt");
  const installButton = document.querySelector("#install-button");
  const firefoxInstallInstructions = document.querySelector("#firefox-install-instructions");

  if (navigator.userAgent.includes("Firefox/") && navigator.userAgent.includes("Linux")) {
    firefoxInstallInstructions.hidden = false;
  }

  window.addEventListener("beforeinstallprompt", event => {
    event.preventDefault();

    installButton.addEventListener("click", async () => {
      await event.prompt();

      const { outcome } = await event.userChoice;

      installButton.hidden = true;

      console.log(`Install prompt result: ${outcome}`);
    }, { once: true });

    installButton.hidden = false;
    installPrompt.hidden = false;
  });

  window.addEventListener("appinstalled", () => {
    installPrompt.hidden = true;
    installButton.hidden = true;
  });
}

redirectAppWindow();
enableInstallButton();
