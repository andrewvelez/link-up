/**
 * SPDX-FileCopyrightText: 2026 Andrew Velez
 * SPDX-License-Identifier: GPL-3.0-or-later
 * @author Andrew Velez
 * @summary profile business object
 */

export class Profile {
  /**
   * @param {string} id
   * @param {string} displayName
   * @param {number} age
   * @param {string} photoUrl
   * @param {string} profileDescription
   * @param {number} latitude
   * @param {number} longitude
   */
  constructor(
    id,
    displayName,
    age,
    photoUrl,
    profileDescription,
    latitude,
    longitude,
  ) {
    this.id = id;
    this.displayName = displayName;
    this.age = age;
    this.photoUrl = photoUrl;
    this.profileDescription = profileDescription;
    this.latitude = latitude;
    this.longitude = longitude;
  }
}
