/**
 * @author Andrew Velez
 * @license MIT
 * @description Tests authentication states and startup page selection.
 */
open BunTest

// Deliberately cross the JS boundary to test runtime rejection of invalid states.
external unsafeState: string => Authentication.state = "%identity"

test("authentication remains Unknown until implemented", async () => {
  let request = Http.request(
    "https://example.test/",
    {
      headers: Dict.fromArray([("Cookie", "session=unverified")]),
    },
  )
  expect(await Authentication.getAuthenticationState(request))->toBe(Authentication.Unknown)
})

[
  (Authentication.Unknown, "about.html"),
  (Authentication.Known, "home.html"),
  (Authentication.Authenticated, "home.html"),
]->Array.forEach(((state, page)) => {
  test("selects " ++ page ++ " for " ++ (state :> string), () => {
    expect(Routes.getStartPage(state))->toBe(page)
  })
})

test("rejects unsupported authentication states", () => {
  expect(() => Routes.getStartPage(unsafeState("invalid")))->toThrow(
    "Unsupported authentication state.",
  )
})
