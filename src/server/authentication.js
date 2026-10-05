/**
 * @author Andrew Velez
 * @license MIT
 * @description Defines the server authentication API.
 */

/** @typedef {"unknown" | "known" | "authenticated"} AuthenticationStateValue */

/**
 * Proposed authentication states. Cookie presence alone does not authorize a user.
 * Unknown has no authentication cookie; Known has a cookie without authorization;
 * Authenticated has a cookie and online authorization.
 * @type {{ Unknown: AuthenticationStateValue, Known: AuthenticationStateValue, Authenticated: AuthenticationStateValue }}
 */
export const AuthenticationState = Object.freeze({
  Unknown: "unknown",
  Known: "known",
  Authenticated: "authenticated",
});

/**
 * @description Returns Unknown until authentication is implemented.
 * @param {Request} request The incoming request used to resolve authentication.
 * @returns {Promise<AuthenticationStateValue>} The current authentication state.
 */
export async function getAuthenticationState(request) {
  return AuthenticationState.Unknown;
}
