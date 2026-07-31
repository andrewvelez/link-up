/**
 * SPDX-License-Identifier: MIT
 * Copyright (c) 2026 Andrew Velez
 * Cucumber configuration for Link-Up behavior tests.
 */

export default {
  paths: ["features/**/*.feature"],
  import: ["features/step_definitions/**/*.js"],
  format: ["progress"],
  strict: true,
};
