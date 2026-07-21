/**
 * SPDX-FileCopyrightText: 2026 Andrew Velez
 * SPDX-License-Identifier: GPL-3.0-or-later
 * @author Andrew Velez
 * @summary tests on profile rendering
 */

import { describe, expect, test } from "bun:test";
import { Profile } from "../../src/profile.js";
import { renderAppPage } from "../../src/renderAppPage.js";

describe("profile rendering", () => {
  test("renders profiles into the application shell", async () => {
    const html = await renderAppPage([
      new Profile("alex", "Alex", 28, "/alex.png", "Nearby", 0, 0),
    ]);

    expect(html).toContain('data-profile-id="alex"');
    expect(html).toContain("<h2>Alex, 28</h2>");
    expect(html).not.toContain("{{PROFILE_GRID}}");
  });

  test("escapes profile text and attributes", async () => {
    const html = await renderAppPage([
      new Profile(
        'profile\" onclick=\"alert(1)',
        "<Alex>",
        28,
        'javascript:\"unsafe',
        "Coffee & music",
        0,
        0,
      ),
    ]);

    expect(html).toContain("&lt;Alex&gt;");
    expect(html).toContain("Coffee &amp; music");
    expect(html).toContain("profile&quot;");
    expect(html).not.toContain("<Alex>");
  });
});
