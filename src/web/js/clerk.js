/**
 * @author Andrew Velez
 * @license MIT
 * @description Initializes Clerk sign-in, sign-up, and account controls.
 */

import { Clerk } from "@clerk/clerk-js";

const signIn = document.querySelector("#clerk-sign-in");
const account = document.querySelector("#clerk-account");

async function initializeClerk() {
  const response = await fetch("/auth/config", { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Unable to load authentication configuration.");
  }
  const { publishableKey } = await response.json();
  if (!publishableKey) {
    throw new Error("Clerk is not configured.");
  }
  const domain = atob(publishableKey.split("_")[2]).slice(0, -1);
  await new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://${domain}/npm/@clerk/ui@1/dist/ui.browser.js`;
    script.async = true;
    script.crossOrigin = "anonymous";
    script.onload = resolve;
    script.onerror = () => reject(new Error("Unable to load authentication controls."));
    document.head.appendChild(script);
  });
  const clerk = new Clerk(publishableKey);
  await clerk.load({
    ui: { ClerkUI: window.__internal_ClerkUICtor },
    signInForceRedirectUrl: "/profiles.html",
    signUpForceRedirectUrl: "/profiles.html",
    afterSignOutUrl: "/",
  });
  if (clerk.user) {
    if (signIn) {
      window.location.replace("/profiles.html");
    } else if (account) {
      account.replaceChildren();
      clerk.mountUserButton(account);
    }
  } else if (signIn) {
    signIn.replaceChildren();
    clerk.mountSignIn(signIn, { routing: "hash" });
  }
}

initializeClerk().catch((error) => {
  console.error("Unable to initialize authentication.", error);
  if (signIn) {
    signIn.textContent = "Sign-in is unavailable. Please check your connection and try again.";
  }
});
