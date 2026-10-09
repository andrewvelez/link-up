/**
 * @author Andrew Velez <andrewvelez@outlook.com>
 * @license MIT
 * @description Tests authentication state and startup page selection.
 */

import { expect, mock, test } from "bun:test";
import { AuthenticationState, getAuthenticationState, requireAuthentication } from "../src/server/authentication.js";

test("authentication remains Unknown until implemented", async () => {
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
