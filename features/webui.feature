# SPDX-License-Identifier: MIT
# Copyright (c) 2026 Andrew Velez
# Specifies creation of a WebUI for a Link-Up web page.

Feature: Create a WebUI

  Scenario: A user opens a page
    Given a user has a page to open
    When they request a WebUI for the page
    Then a WebUI is created for the page
