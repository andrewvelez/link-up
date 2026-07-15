/**
 * SPDX-FileCopyrightText: 2026 Andrew Velez
 * SPDX-License-Identifier: GPL-3.0-or-later
 * @author Andrew Velez
 * @summary temporary profile data source
 */

import { Profile } from "./profile.js";

const dummyProfiles = [
  new Profile("alex", "Alex", 28, "/images/linkup-background.png", "Coffee, hiking, and live music.", 33.7490, -84.3880),
  new Profile("marcus", "Marcus", 31, "/images/linkup-background.png", "Usually at the gym or trying a new restaurant.", 33.7537, -84.3863),
  new Profile("jordan", "Jordan", 26, "/images/linkup-background.png", "Dog person. Weekend traveler.", 33.7463, -84.3915),
  new Profile("devon", "Devon", 35, "/images/linkup-background.png", "Designer, runner, and amateur cook.", 33.7579, -84.3857),
  new Profile("chris", "Chris", 29, "/images/linkup-background.png", "Looking for good conversation and new adventures.", 33.7516, -84.3955),
  new Profile("miles", "Miles", 33, "/images/linkup-background.png", "Books, films, and quiet Sunday mornings.", 33.7439, -84.3824),
  new Profile("andre", "Andre", 27, "/images/linkup-background.png", "Always planning the next road trip.", 33.7604, -84.3892),
  new Profile("sam", "Sam", 30, "/images/linkup-background.png", "Music nerd and coffee enthusiast.", 33.7482, -84.3791),
  new Profile("leo", "Leo", 24, "/images/linkup-background.png", "Here to meet interesting people.", 33.7551, -84.3980),
  new Profile("nate", "Nate", 32, "/images/linkup-background.png", "Good food, better company.", 33.7416, -84.3871),
  new Profile("eli", "Eli", 29, "/images/linkup-background.png", "Photographer and occasional cyclist.", 33.7630, -84.3818),
  new Profile("cameron", "Cameron", 34, "/images/linkup-background.png", "Outdoors when the weather cooperates.", 33.7507, -84.4012),
  new Profile("jay", "Jay", 25, "/images/linkup-background.png", "Concerts, art, and late-night tacos.", 33.7451, -84.3769),
  new Profile("drew", "Drew", 36, "/images/linkup-background.png", "Keeping life simple.", 33.7586, -84.3938),
  new Profile("ryan", "Ryan", 28, "/images/linkup-background.png", "New in town and exploring the city.", 33.7389, -84.3904),
];

export function loadProfiles() {
  return dummyProfiles;
}
