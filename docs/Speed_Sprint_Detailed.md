# Speed Sprint

Demonstrate location, profile discovery, and private messaging on two devices,
including a phone, while keeping authoritative user data encrypted on-device.
This sprint is composed entirely of whole stories from [ROADMAP_Detailed.md](ROADMAP_Detailed.md).
That document owns each story's scope, acceptance criteria, and prerequisites.

## Execution rules

Execute the selected stories in the order below. Every direct and transitive
prerequisite is included earlier in the sequence. A story is complete only when
its roadmap acceptance criteria pass; headings below group work, not new tasks.
The final verification story establishes prototype completion, not Version 1 release.

Build profile data structures first, then their local store with locality as a
first-class entity. Save profiles, resolve locality and presence, and implement
local search before networking and regional distribution. Complete working
discovery before messaging. Research, definitions, library evaluation, and
decisions are part of the implementation story that needs them.

Use one test region, known peers, a fixed builder, city-level disclosure, and
complete Orama snapshots. Verify required library capabilities within the
implementation; resolve failed validation before completing that story.
Converse/XMPP retains sender-held undelivered text and encrypted local history.
Record the required signaling, relay, builder, and XMPP infrastructure and costs.

## Selected stories

| Order | Roadmap story |
| --- | --- |
| 1 | [E1-S1 — Create profile and locality data structures and their local store](ROADMAP_Detailed.md#e1-s1--create-profile-and-locality-data-structures-and-their-local-store) |
| 2 | [E1-S2 — Encrypt and reopen authoritative owner records](ROADMAP_Detailed.md#e1-s2--encrypt-and-reopen-authoritative-owner-records) |
| 3 | [E2-S1 — Save a minimal text profile locally](ROADMAP_Detailed.md#e2-s1--save-a-minimal-text-profile-locally) |
| 4 | [E2-S2 — Add one locally owned profile photo](ROADMAP_Detailed.md#e2-s2--add-one-locally-owned-profile-photo) |
| 5 | [E2-S3 — Opt into publishing a permitted search summary](ROADMAP_Detailed.md#e2-s3--opt-into-publishing-a-permitted-search-summary) |
| 6 | [E2-S4 — Withdraw a searchable profile](ROADMAP_Detailed.md#e2-s4--withdraw-a-searchable-profile) |
| 7 | [E3-S1 — Obtain a private position and H3 membership](ROADMAP_Detailed.md#e3-s1--obtain-a-private-position-and-h3-membership) |
| 8 | [E4-S1 — Prepare reference data for one test region](ROADMAP_Detailed.md#e4-s1--prepare-reference-data-for-one-test-region) |
| 9 | [E4-S2 — Resolve and cache locality labels locally](ROADMAP_Detailed.md#e4-s2--resolve-and-cache-locality-labels-locally) |
| 10 | [E3-S2 — Derive city-level discovery locations](ROADMAP_Detailed.md#e3-s2--derive-city-level-discovery-locations) |
| 11 | [E3-S3 — Refresh active location and expire presence](ROADMAP_Detailed.md#e3-s3--refresh-active-location-and-expire-presence) |
| 12 | [E5-S1 — Search local summaries by text and radius](ROADMAP_Detailed.md#e5-s1--search-local-summaries-by-text-and-radius) |
| 13 | [E5-S2 — Include neighboring cells without duplicate profiles](ROADMAP_Detailed.md#e5-s2--include-neighboring-cells-without-duplicate-profiles) |
| 14 | [E11-S1 — Store and apply a local block list](ROADMAP_Detailed.md#e11-s1--store-and-apply-a-local-block-list) |
| 15 | [E11-S2 — Validate untrusted input at prototype boundaries](ROADMAP_Detailed.md#e11-s2--validate-untrusted-input-at-prototype-boundaries) |
| 16 | [E12-S1 — Preserve the page and enforce sustained-offline behavior](ROADMAP_Detailed.md#e12-s1--preserve-the-page-and-enforce-sustained-offline-behavior) |
| 17 | [E6-S1 — Connect known peers securely](ROADMAP_Detailed.md#e6-s1--connect-known-peers-securely) |
| 18 | [E6-S2 — Recover known-peer connections within bounded limits](ROADMAP_Detailed.md#e6-s2--recover-known-peer-connections-within-bounded-limits) |
| 19 | [E7-S1 — Deliver opted-in summaries to one regional builder](ROADMAP_Detailed.md#e7-s1--deliver-opted-in-summaries-to-one-regional-builder) |
| 20 | [E7-S2 — Apply withdrawals, expiry, and record ordering](ROADMAP_Detailed.md#e7-s2--apply-withdrawals-expiry-and-record-ordering) |
| 21 | [E7-S3 — Converge the test region after movement and reconnect](ROADMAP_Detailed.md#e7-s3--converge-the-test-region-after-movement-and-reconnect) |
| 22 | [E8-S1 — Build one complete regional snapshot](ROADMAP_Detailed.md#e8-s1--build-one-complete-regional-snapshot) |
| 23 | [E8-S2 — Load and retain a compatible shared snapshot](ROADMAP_Detailed.md#e8-s2--load-and-retain-a-compatible-shared-snapshot) |
| 24 | [E8-S3 — Refresh through complete replacement snapshots](ROADMAP_Detailed.md#e8-s3--refresh-through-complete-replacement-snapshots) |
| 25 | [E5-S5 — Keep searching during background refresh](ROADMAP_Detailed.md#e5-s5--keep-searching-during-background-refresh) |
| 26 | [E9-S1 — Display real nearby profiles](ROADMAP_Detailed.md#e9-s1--display-real-nearby-profiles) |
| 27 | [E9-S2 — Open details directly from an authorized owner](ROADMAP_Detailed.md#e9-s2--open-details-directly-from-an-authorized-owner) |
| 28 | [E10-S1 — Send and receive encrypted one-to-one text](ROADMAP_Detailed.md#e10-s1--send-and-receive-encrypted-one-to-one-text) |
| 29 | [E10-S2 — Retain and retry sender-held pending messages](ROADMAP_Detailed.md#e10-s2--retain-and-retry-sender-held-pending-messages) |
| 30 | [E10-S3 — Provide a conversation view](ROADMAP_Detailed.md#e10-s3--provide-a-conversation-view) |
| 31 | [E13-S1 — Verify the complete two-device prototype](ROADMAP_Detailed.md#e13-s1--verify-the-complete-two-device-prototype) |

E5-S3 and E5-S4 are deliberately unselected: basic text/radius discovery and
background refresh do not require full profile filters or density adaptation.
The explicit dependencies in the roadmap permit this selection without partially
completing either story.

## Completion and follow-on work

The sprint is complete when all 31 selected stories meet their roadmap acceptance
criteria and E13-S1 records the two-device results, phone resource measurements,
infrastructure requirements/costs, and `bun run test` outcome. Failed criteria
remain incomplete and feed the affected roadmap decision or implementation story.

The remaining roadmap retains full profile fields, precise-location opt-in,
driving adaptation, nationwide reference data, density-adaptive discovery,
automatic peer entry, multi-region replication, backup/deletion propagation,
the selected launch index-update strategy, builder selection/failover,
reporting/moderation, full recovery, and release preparation. A map requires the
inclusion decision within E9-S3. These capabilities are not implied complete
by a working prototype.
