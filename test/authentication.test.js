/**
 * @author Andrew Velez <andrewvelez@outlook.com>
 * @license MIT
 * @description Tests authentication state and startup page selection.
 */

import { afterEach, expect, mock, spyOn, test } from "bun:test";
import { generateKeyPairSync, sign } from "node:crypto";
import { AuthenticationState, getAuthenticationState, requireAuthentication } from "../src/server/authentication.js";

const originalKeys = [process.env.CLERK_SECRET_KEY, process.env.CLERK_PUBLISHABLE_KEY];
const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
const signingKey = { ...publicKey.export({ format: "jwk" }), kid: "link-up-test", alg: "RS256", use: "sig" };

function sessionToken(claims = {}) {
  const now = Math.floor(Date.now() / 1000);
  const encode = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");
  const content = `${encode({ alg: "RS256", kid: signingKey.kid, typ: "JWT" })}.${encode({
    iss: "https://clerk.example.test", sub: "user_test", sid: "sess_test",
    azp: "https://example.test", iat: now - 10, nbf: now - 10, exp: now + 60, ...claims,
  })}`;
  return `${content}.${sign("RSA-SHA256", Buffer.from(content), privateKey).toString("base64url")}`;
}

function clerkResponses(status = "active") {
  process.env.CLERK_SECRET_KEY = "sk_test_local_fixture";
  process.env.CLERK_PUBLISHABLE_KEY = `pk_test_${Buffer.from("clerk.example.test$").toString("base64")}`;
  return spyOn(globalThis, "fetch").mockImplementation(async (url) => {
    const path = new URL(url).pathname;
    if (path === "/v1/jwks") {
      return Response.json({ keys: [signingKey] });
    }
    if (path === "/v1/sessions/sess_test") {
      if (status === "offline") {
        throw new Error("Network unavailable");
      }
      return Response.json({ object: "session", id: "sess_test", user_id: "user_test", status }, { headers: { "Content-Type": "application/json" } });
    }
    throw new Error(`Unexpected Clerk request: ${path}`);
  });
}

afterEach(() => {
  mock.restore();
  for (const [index, name] of ["CLERK_SECRET_KEY", "CLERK_PUBLISHABLE_KEY"].entries()) {
    if (originalKeys[index] === undefined) {
      delete process.env[name];
    } else {
      process.env[name] = originalKeys[index];
    }
  }
});

test.each([
  ["active", "header"], ["active", "cookie"], ["revoked", "cookie"], ["ended", "header"], ["offline", "cookie"],
])("checks an online %s session from a %s", async (status, source) => {
  clerkResponses(status);
  const request = new Request("https://example.test/home.html", {
    headers: source === "header"
      ? { Authorization: `Bearer ${sessionToken()}` }
      : { Cookie: `__session=${sessionToken()}; __client_uat=1; __clerk_db_jwt=development_fixture` },
  });
  const state = status === "active" ? AuthenticationState.Authenticated : AuthenticationState.Known;
  expect(await getAuthenticationState(request)).toBe(state);
}, 15_000);

test.each([
  { exp: 1 },
  { azp: "https://other.test" },
])("rejects invalid session claims: %j", async (claims) => {
  const fetch = clerkResponses();
  const request = new Request("https://example.test/home.html", {
    headers: { Authorization: `Bearer ${sessionToken(claims)}` },
  });
  expect(await getAuthenticationState(request)).toBe(AuthenticationState.Known);
  expect(fetch.mock.calls.some(([url]) => new URL(url).pathname.includes("/sessions/"))).toBe(false);
});

test("rejects a forged token signature", async () => {
  const fetch = clerkResponses();
  const token = sessionToken();
  const signature = Buffer.alloc(256).toString("base64url");
  const request = new Request("https://example.test/home.html", {
    headers: { Authorization: `Bearer ${token.slice(0, token.lastIndexOf(".") + 1)}${signature}` },
  });
  expect(await getAuthenticationState(request)).toBe(AuthenticationState.Known);
  expect(fetch.mock.calls.some(([url]) => new URL(url).pathname.includes("/sessions/"))).toBe(false);
});

test("does not authorize an unverified Clerk cookie", async () => {
  clerkResponses();
  const request = new Request("https://example.test/home.html", { headers: { Cookie: "__session=unverified" } });
  expect(await getAuthenticationState(request)).toBe(AuthenticationState.Known);
});

test("requests without Clerk credentials remain Unknown", async () => {
  const request = new Request("https://example.test/", { headers: { Cookie: "session=unverified" } });
  expect(await getAuthenticationState(request)).toBe(AuthenticationState.Unknown);
});

test("redirects unauthorized requests before calling the protected handler", async () => {
  const handler = mock(() => new Response("Protected content"));
  const response = await requireAuthentication(handler)(new Request("https://example.test/home.html"));
  expect(response.status).toBe(302);
  expect(response.headers.get("Location")).toBe("/");
  expect(response.headers.get("Cache-Control")).toBe("no-store");
  expect(await response.text()).toBe("");
  expect(handler).not.toHaveBeenCalled();
});
