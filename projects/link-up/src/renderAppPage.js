/**
 * SPDX-FileCopyrightText: 2026 Andrew Velez
 * SPDX-License-Identifier: GPL-3.0-or-later
 * @author Andrew Velez
 * @summary application page rendering
 */

import { Profile } from "./profile.js";
import { loadProfiles } from "./profileSource.js";

export async function renderAppPage() {
  const appHtml = await Bun.file("./public/app.html").text();
  const profiles = loadProfiles();
  const profileGrid = profiles.map(renderProfile).join("");

  return appHtml.replace("{{PROFILE_GRID}}", profileGrid);
}

/** @param {Profile} profile */
function renderProfile(profile) {
  const displayName = escapeHtml(profile.displayName);
  const photoUrl = escapeHtml(profile.photoUrl);
  const profileDescription = escapeHtml(profile.profileDescription);

  return `
    <article class="profile-card" data-profile-id="${escapeHtml(profile.id)}">
      <img src="${photoUrl}" alt="${displayName}">
      <div class="profile-summary">
        <h2>${displayName}, ${profile.age}</h2>
        <p>${profileDescription}</p>
      </div>
    </article>`;
}

/** @param {string} value */
function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
