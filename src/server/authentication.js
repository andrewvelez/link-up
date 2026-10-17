/**
 * @author Andrew Velez
 * @license MIT
 * @description Defines the server authentication API.
 */

import { createClerkClient } from "@clerk/backend";

/** @typedef {"unknown" | "known" | "authenticated"} AuthenticationStateValue */

/**
 * Authentication states. Credential presence alone does not authorize a user.
 * Unknown has no credentials; Known has credentials without authorization;
 * Authenticated has a verified token and online authorization.
 * @type {{ Unknown: AuthenticationStateValue, Known: AuthenticationStateValue, Authenticated: AuthenticationStateValue }}
 */
export const AuthenticationState = Object.freeze({
  Unknown: "unknown",
  Known: "known",
  Authenticated: "authenticated",
});

/**
 * @description Verifies the request token and confirms its session is active online.
 * @param {Request} request The incoming request used to resolve authentication.
 * @returns {Promise<AuthenticationStateValue>} The current authentication state.
 */
export async function getAuthenticationState(request) {
  if (!request.headers.get("cookie")?.includes("__session") && !request.headers.has("authorization")) {
    return AuthenticationState.Unknown;
  }
  if (!process.env.CLERK_SECRET_KEY || !process.env.CLERK_PUBLISHABLE_KEY) {
    return AuthenticationState.Known;
  }
  try {
    const clerk = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
      publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
    });
    const authentication = await clerk.authenticateRequest(request, {
      authorizedParties: [new URL(request.url).origin],
    });
    if (authentication.isAuthenticated) {
      const session = await clerk.sessions.getSession(authentication.toAuth().sessionId);
      if (session.status === "active") {
        return AuthenticationState.Authenticated;
      }
    }
  } catch {
    // An unverifiable token or unavailable Clerk service cannot authorize the request.
  }
  return AuthenticationState.Known;
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
