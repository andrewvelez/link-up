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
  const installButton = document.querySelector("#install-button");

  window.addEventListener("beforeinstallprompt", event => {
    event.preventDefault();

    installButton.addEventListener("click", async () => {
      await event.prompt();

      const { outcome } = await event.userChoice;

      installButton.hidden = true;

      console.log(`Install prompt result: ${outcome}`);
    }, { once: true });

    installButton.hidden = false;
  });

  window.addEventListener("appinstalled", () => {
    installButton.hidden = true;
  });
}

redirectAppWindow();
enableInstallButton();
