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

/**
 * @description Applies authentication to a protected request handler.
 * @param {(request: Request) => Response | Promise<Response>} handler The protected handler.
 * @returns {(request: Request) => Promise<Response>} The authenticated handler.
 */
export function requireAuthentication(handler) {
  return async (request) => {
    const state = await getAuthenticationState(request);
    if (state !== AuthenticationState.Authenticated) {
      return new Response(null, {
        status: 302,
        headers: { Location: "/", "Cache-Control": "no-store" },
      });
    }
    const response = await handler(request);
    response.headers.set("Cache-Control", "no-store");
    return response;
  };
}
