/**
 * @author Andrew Velez <andrewvelez@outlook.com>
 * @license MIT
 * @description Tests authentication state and startup page selection.
 */

import { expect, test } from "bun:test";
import { AuthenticationState, getAuthenticationState } from "../src/server/authentication.js";
import { getStartPage } from "../src/server/routes.js";

test("authentication remains Unknown until implemented", async () => {
  const request = new Request("https://example.test/", { headers: { Cookie: "session=unverified" } });
  expect(await getAuthenticationState(request)).toBe(AuthenticationState.Unknown);
});

test.each([
  [AuthenticationState.Unknown, "about.html"],
  [AuthenticationState.Known, "home.html"],
  [AuthenticationState.Authenticated, "home.html"],
])("selects the startup page for %s", (state, page) => {
  expect(getStartPage(state)).toBe(page);
});

test("rejects unsupported authentication states", () => {
  expect(() => getStartPage("invalid")).toThrow("Unsupported authentication state.");
});
