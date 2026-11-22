# Link-up Implementation Roadmap

> **Early rough draft — not a final implementation outline.**
>
> Stories, acceptance criteria, dependencies, priorities, and estimates are
> provisional proposals based on overarching design goals, not approved
> implementation commitments.

This roadmap starts with a **text-only profile-search beta demo** and continues
through geographic discovery, searchable profiles, and rudimentary private
messaging for Version 1. Epics group related stories; they are not the execution
order. Technical enablers use the same acceptance and dependency rules as
user-facing stories. Reviewed against the current checkout on November 22, 2026.

Sources:

- [README and implementation status](../README.md)
- [Application overview](DESIGN.md)
- [Locality architecture](locality-design.md)
- [Network and search decisions](network-search-decisions.md)
- [Regional search architecture](regional-search-recap.md)

## Current baseline

Source inspection shows public Default and Profiles pages, a disabled login
component, sample profiles, an illustrative map, Map/Grid switching, and grid
column selection. None of these views searches stored profile data.

Application source is under `src/`, with page-specific Profiles files in
`src/profiles/` and regular-DOM components in `src/components/`. Shared browser
initialization is `src/appInit.js`; the executable host and routes are
`src/server.js` and `src/routes.js`. `dist/` is generated. Keep markup and styles
separate from component scripts, and keep feature logic outside shared listeners.

Workbox already precaches revisioned assets. Startup navigation checks the
network and falls back to cached `/`; Profiles uses the precache. The manifest
starts at `/`. Cached interface assets do not implement the planned blocking
offline overlay or permission to use features offline.

`bun run build`, `bun run start`, and `bun run deploy` bundle and then test;
`bun test` tests without bundling. Production bundling produces `dist/link-up`,
but automatic deployment is TODO. The host listens on `127.0.0.1` with an
assigned port, so access from a second device needs an explicit hosting setup.

Authentication, profile editing, application persistence, encryption, geographic
discovery, peer networking, search, messaging, and notifications are absent.
H3 and Dexie are installed, but neither implements those application features;
an installed dependency does not establish a persistence implementation.
granthdb, Orama, and Converse are not installed in the current package manifest.

DESIGN proposes granthdb with SQLite/WASM, OPFS, and an IndexedDB fallback, and
names Converse/XMPP as the planned messaging library. H3 is the geographic
direction; Orama remains the preferred search candidate pending integration
validation. Peer transport, replication, and shared-index mechanisms remain
open. Earlier planning documents do not turn those proposals into completed work.

## Story decision status

| Stories | Decision status |
| --- | --- |
| E1-S1 | Implement and validate the granthdb storage proposal from DESIGN, including its persistence fallback. |
| E3-S1 | Integrate the installed H3 library; geographic policy remains open. |
| E5-S6, E5-S1, E8-S1 | Evaluate the preferred Orama direction; beta text search and shared geographic snapshots are separate validation steps. |
| E10-S1, E10-S4 | Integrate planned Converse/XMPP; encryption, infrastructure, delivery, and persistence boundaries remain open. |
| All other stories | Speculative scope and implementation based on overarching design goals. |

## Delivery milestones and beta-first order

The requested early deliverable is a **beta demo**, not an MVP: a functional
text-only profile-search page inside the PWA, with a defined local profile-text
store and working search results. It needs no photos, location permission, H3
processing, regional builder, peer exchange, or messaging. Use synthetic demo
profiles; this milestone does not authorize publication of real profiles.

| Order | Story | Observable result |
| --- | --- | --- |
| 1 | [E1-S1](#e1-s1--create-profile-and-locality-data-structures-and-their-local-store) | Defined profile-text records and local store, distinct from the search index. |
| 2 | [E1-S2](#e1-s2--encrypt-and-reopen-authoritative-owner-records) | Encrypted owner records reopen through a local account unlock. |
| 3 | [E2-S1](#e2-s1--save-a-minimal-text-profile-locally) | Display name and bio can be edited, saved, and restored. |
| 4 | [E5-S6](#e5-s6--search-locally-stored-profile-text) | Text queries search persisted synthetic summaries without geographic prerequisites. |
| 5 | [E9-S4](#e9-s4--provide-the-text-only-profile-search-page) | PWA search controls render matching text profiles and empty/error states. |
| 6 | [E12-S1](#e12-s1--preserve-the-page-and-enforce-sustained-offline-behavior) | The demo observes DESIGN's network-required interaction policy. |
| **7** | [**E13-S5 — beta demo complete**](#e13-s5--verify-the-text-search-beta-demo) | The integrated search, persistence, and PWA flow passes verification. |

The old sequence required photo creation, location/locality processing, peer
networking, and regional snapshots before displaying searchable results. E5-S6
and E9-S4 now supply the earlier text-only flow; geographic search extends it
later. Existing story IDs remain stable even where a new story executes first.

There is no separate two-device prototype milestone. E13-S1 is retired and is
not a prerequisite for subsequent work. **MVP scope and its completion gate
remain to be agreed**; the beta demo does not define them.
The expected finish for the currently specified full Version 1 scope remains
**E13-S4**, after complete acceptance and release-readiness checks. A smaller
product MVP would need its own agreed user scope and acceptance gate before a
credible earlier finish can be marked.

## Story ordering and sprint composition

- Story IDs are stable references, not execution priority. Follow the beta-first
  order above, also used by the Speed Sprint; explicit dependencies determine what
  can start. Post-beta work follows the remaining dependency graph.
- **Requires** lists direct prerequisite stories. Their prerequisites also apply.
  Epic order alone does not impose a dependency on every story in an earlier epic.
- **Accept** defines the proposed scope of a story. A sprint selects whole stories
  and their unmet prerequisites; it does not silently narrow acceptance criteria.
- Beta stories deliver reusable text storage, search, and results. Later stories
  introduce location, configured peers, one regional builder, and complete
  snapshots before extending those capabilities for Version 1. Completing an
  early story does not complete its epic.
- Research, definitions, library evaluation, and architecture decisions are
  part of the implementation stories that need them. Set budgets before
  evaluation, record the results with the implementation, and resolve failed
  validation before completing the story. Early implementation choices do not settle
  launch architecture.
- [Speed Sprint](Speed_Sprint_Detailed.md) selects an ordered, dependency-complete subset.
  Its story definitions and acceptance criteria live here. No story below is
  marked complete by this planning exercise.

Human coding time estimates assume one experienced developer without AI assistance.
Human coding with AI estimates assume the same developer using AI assistance.
Both are person-hours.
They include implementation code, excluding research, testing,
and documentation. Prerequisites are assumed complete; their effort is not
counted again. Zero means no coding is specified, not zero total effort.
Ranges are planning judgments and may change as implementation resolves the architecture.

## Version 1 epics

Begin with the seven-story beta sequence above. Define locality as a separate
entity without requiring its resolution to search text. After beta verification,
add authenticated access, location/locality processing, geographic search,
regional distribution, and real discovery. Messaging follows working discovery.

E11 and E12 begin alongside the features they govern. Their final stories cover
integration across the completed Version 1 application.

### E1 — Create profile and locality data structures and encrypted storage

As a user, I want my authoritative data to remain encrypted on my device and
under my control.

#### E1-S1 — Create profile and locality data structures and their local store

As a user, I want my data kept separate from other accounts on this device.

- **Accept:** Create reusable profile and locality models in a versioned,
  account-scoped granthdb store. Validate the proposed SQLite/WASM, OPFS, and
  IndexedDB fallback path. Document profile-text records (stable ID, display
  name, bio, and revision), ownership, and the store API. Separate owner records,
  synthetic demo summaries, and rebuildable search indexes; define which store
  owns each record so the search engine never becomes the owner-data authority.
  Keep locality separate and optional for beta text search. Verify account
  isolation with non-sensitive fixtures; real owner data awaits E1-S2.
- **Requires:** None.
- **Human coding time:** 8–12 hours.
- **Human coding with AI:** 4–6 hours.

#### E1-S2 — Encrypt and reopen authoritative owner records

As a user, I want my profile and messages protected and available after reload.

- **Accept:** Encrypt owner records with account-scoped keys and reopen them
  after reload through a defined local unlock and key lifecycle. A local demo
  account is sufficient for beta; remote authentication belongs to E1-S6. Keep
  accounts isolated and show failures clearly without silently saving plaintext.
  Message-record support does not implement messaging. Device linking and
  identity recovery remain deferred.
- **Requires:** E1-S1.
- **Human coding time:** 16–24 hours.
- **Human coding with AI:** 10–16 hours.

#### E1-S3 — Preserve data through migrations and storage failures

As a returning user, I want upgrades and failed writes to preserve recoverable data.

- **Accept:** Verify that upgrades and storage failures preserve recoverable
  data. Clearly distinguish recoverable errors from data lost through browser
  eviction.
- **Requires:** E1-S2.
- **Human coding time:** 12–20 hours.
- **Human coding with AI:** 8–14 hours.

#### E1-S4 — Export user-owned data

As a user, I want a usable copy of the data I control.

- **Accept:** Provide a usable export of user-owned data. Explain how
  encryption keys and copies held by recipients are handled.
- **Requires:** E1-S3.
- **Human coding time:** 8–16 hours.
- **Human coding with AI:** 4–8 hours.

#### E1-S5 — Delete local data and initiate permitted withdrawals

As a user, I want to remove my local data and stop its continued publication.

- **Accept:** Delete local account data and initiate publication withdrawals.
  Explain what copies may remain elsewhere; network propagation belongs to
  E7-S6.
- **Requires:** E1-S3, E2-S4.
- **Human coding time:** 8–16 hours.
- **Human coding with AI:** 4–8 hours.

#### E1-S6 — Authenticate accounts and enforce feature access

As a user, I want sign-in to protect account actions and private data.

- **Accept:** Replace the disabled login placeholder with an agreed account
  creation, sign-in, sign-out, and local-unlock flow. Bind the authenticated
  identity to local encryption keys and later peer and messaging identities.
  Decide whether unauthenticated users may read opted-in discovery summaries;
  enforce authorization for publication, owner details, and messaging. Public
  shell/demo access grants no private-data access. Do not imply that the current
  email/password mockup establishes an authentication or recovery architecture.
- **Requires:** E1-S2.
- **Human coding time:** 12–24 hours.
- **Human coding with AI:** 6–14 hours.

### E2 — Create and maintain the user's profile

As a user, I want to create and update my profile and choose what others can see.

#### E2-S1 — Save a minimal text profile locally

As a user, I want to create and edit my display name and short bio.

- **Accept:** Let users edit and validate their display name and bio using the
  existing profile model. Save them encrypted locally and restore them after
  reload. New profiles remain excluded from search.
- **Requires:** E1-S2.
- **Human coding time:** 6–10 hours.
- **Human coding with AI:** 2–4 hours.

#### E2-S2 — Add one locally owned profile photo

As a user, I want to choose or replace the photo associated with my profile.

- **Accept:** Support one encrypted profile photo that survives reloads,
  enforcing suitable image limits. Keep the owner’s photo distinct from any
  version explicitly approved for discovery, and integrate photo consent with
  publication if E2-S3 is already implemented. Photos do not gate text search.
- **Requires:** E2-S1.
- **Human coding time:** 6–10 hours.
- **Human coding with AI:** 3–5 hours.

#### E2-S3 — Opt into publishing a permitted search summary

As a user, I want to explicitly choose whether my profile appears in discovery.

- **Accept:** Require explicit opt-in before preparing a permitted search
  summary. Keep private information out of distributed discovery data. Version
  outgoing updates and show whether saved changes await publication; network
  delivery belongs to E7. Text-only profiles may opt in without a photo.
- **Requires:** E2-S1.
- **Human coding time:** 8–12 hours.
- **Human coding with AI:** 4–6 hours.

#### E2-S4 — Withdraw a searchable profile

As a user, I want to stop publishing my profile without deleting my local copy.

- **Accept:** Stop publication on opt-out and issue a withdrawal that older
  updates cannot reverse. Show withdrawal progress and explain that recipient
  copies cannot be guaranteed erased.
- **Requires:** E2-S3.
- **Human coding time:** 6–10 hours.
- **Human coding with AI:** 3–5 hours.

#### E2-S5 — Support the remaining agreed profile fields

As a user, I want to edit the full Version 1 profile with field visibility controls.

- **Accept:** Implement any additional agreed Version 1 profile fields with
  appropriate privacy controls and encrypted persistence. Preserve existing
  profiles during upgrades and document when the minimal profile already
  suffices.
- **Requires:** E1-S3, E2-S4.
- **Human coding time:** 12–20 hours.
- **Human coding with AI:** 5–10 hours.

### E3 — Implement privacy-aware location and presence

As a user, I want discovery to follow my location while revealing only the
precision I permit.

#### E3-S1 — Obtain a private position and H3 membership

As a user, I want to grant location access and understand when it is unavailable.

- **Accept:** Obtain location permission and calculate H3 membership locally
  without exposing exact coordinates. Clearly show when a trustworthy position
  is unavailable.
- **Requires:** E2-S1.
- **Human coding time:** 4–8 hours.
- **Human coding with AI:** 2–4 hours.

#### E3-S2 — Derive city-level discovery locations

As a user, I want useful nearby discovery without disclosing my exact position.

- **Accept:** Derive city-level discovery locations from stored locality
  records. Keep exact coordinates encrypted and ensure shared information
  reveals no finer precision. Show unavailable when locality resolution is
  uncertain.
- **Requires:** E3-S1, E4-S2.
- **Human coding time:** 10–18 hours.
- **Human coding with AI:** 6–10 hours.

#### E3-S3 — Refresh active location and expire presence

As a user, I want meaningful movement reflected without stale presence or GPS jitter.

- **Accept:** Keep active location and presence current using initial bounded
  rules that suppress GPS jitter and expire stale information. Update locality
  membership as users move and revalidate expired locations before publishing
  again.
- **Requires:** E3-S2.
- **Human coding time:** 10–16 hours.
- **Human coding with AI:** 6–10 hours.

#### E3-S4 — Adapt updates to movement speed

As a traveling user, I want location updates that remain useful without excess traffic.

- **Accept:** Adapt location updates to movement speed while preserving the
  chosen disclosure precision. Measure freshness and update frequency under
  representative travel conditions.
- **Requires:** E3-S3.
- **Human coding time:** 8–12 hours.
- **Human coding with AI:** 4–7 hours.

#### E3-S5 — Support explicit precise-location disclosure

As a user, I want to choose the agreed precise mode and return to city-level privacy.

- **Accept:** Let users explicitly choose precise disclosure and return to
  city-level privacy. Replace finer shared records when precision is reduced,
  explain retained-copy limits, and calculate distances using the current
  disclosure.
- **Requires:** E3-S3, E7-S2.
- **Human coding time:** 10–18 hours.
- **Human coding with AI:** 6–10 hours.

### E4 — Build local locality reference data and resolution

As a user, I want useful locality names without depending on metered geographic
services.

#### E4-S1 — Prepare reference data for one test region

As a tester, I want a reproducible geographic dataset for the initial region.

- **Accept:** Prepare a compact, versioned geographic dataset for the test
  region from the specified government sources. Record its provenance and
  coverage, and load it into the local reference store without requiring
  runtime geographic services.
- **Requires:** E1-S2.
- **Human coding time:** 8–16 hours.
- **Human coding with AI:** 4–8 hours.

#### E4-S2 — Resolve and cache locality labels locally

As a user, I want my position labeled with the correct available locality.

- **Accept:** Resolve and cache locality labels using stored reference data.
  Support cells that cross locality boundaries and return stable locality
  references without external lookups.
- **Requires:** E4-S1, E3-S1.
- **Human coding time:** 12–24 hours.
- **Human coding with AI:** 7–14 hours.

#### E4-S3 — Extend and maintain partitioned U.S. reference data

As a user, I want locality resolution beyond the initial region.

- **Accept:** Automate regional reference-data preparation and maintenance
  across the U.S. Preserve owner data and keep essential locality resolution
  independent of optional government APIs.
- **Requires:** E4-S2, E1-S3.
- **Human coding time:** 20–36 hours.
- **Human coding with AI:** 10–20 hours.

### E5 — Implement local geographic and profile search

As a user, I want nearby, relevant profiles to appear quickly and remain
searchable while regional updates arrive.

#### E5-S1 — Search local summaries by text and radius

As a user, I want matching profiles ordered by approximate proximity.

- **Accept:** Extend E5-S6 text search with radius filtering using permitted
  discovery data. Validate Orama geographic integration and snapshot support
  against phone performance and transfer budgets set in advance. Verify realistic
  geographic and record-lifecycle cases. Order matches by disclosed distance with stable
  tie breaking, and resolve compatibility problems before distributed-index
  work.
- **Requires:** E5-S6, E2-S3, E3-S3.
- **Human coding time:** 10–20 hours.
- **Human coding with AI:** 6–12 hours.

#### E5-S2 — Include neighboring cells without duplicate profiles

As a user, I want nearby results to remain correct near region boundaries.

- **Accept:** Include nearby cells within the test region without showing
  duplicate profiles. Resolve overlapping records by identity and accepted
  version, and distinguish missing coverage from empty results.
- **Requires:** E5-S1.
- **Human coding time:** 8–16 hours.
- **Human coding with AI:** 4–8 hours.

#### E5-S3 — Apply agreed structured profile filters

As a user, I want to narrow nearby results using supported profile attributes.

- **Accept:** Integrate the agreed profile filters with geographic text
  search. Verify that combined filters remain correct, privacy-safe, and
  practical on loaded snapshots.
- **Requires:** E2-S5, E5-S2.
- **Human coding time:** 8–16 hours.
- **Human coding with AI:** 3–7 hours.

#### E5-S4 — Adapt discovery scope to user density

As a user, I want useful local results in both crowded and sparsely populated areas.

- **Accept:** Expand discovery according to population density using supported
  locality definitions. Respect geographic coverage and device limits without
  treating H3 boundaries as administrative boundaries. Verify useful results
  across representative regional conditions.
- **Requires:** E5-S2, E4-S3.
- **Human coding time:** 24–44 hours.
- **Human coding with AI:** 16–28 hours.

#### E5-S5 — Keep searching during background refresh

As a user, I want immediate available results with an honest view of freshness.

- **Accept:** Keep the usable index searchable during background refresh.
  Clearly communicate coverage and freshness, preserve valid data after failed
  refreshes, and exclude expired or withdrawn profiles.
- **Requires:** E5-S2, E8-S3.
- **Human coding time:** 10–18 hours.
- **Human coding with AI:** 6–10 hours.

#### E5-S6 — Search locally stored profile text

As a beta demonstrator, I want text queries to find matching stored profiles.

- **Accept:** Load a reproducible set of synthetic profile summaries into the
  E1-S1 local store and search their display names and bios. Evaluate Orama for
  this bounded text-search path without waiting for geographic or shared-index
  validation. Define matching, empty-query behavior, stable result ordering,
  and insert/update/delete handling. Reopen or rebuild the derived index from
  persisted summaries after reload. Keep private owner records out of search
  unless explicitly included in a local-only demo dataset. No publication or
  location is required. Persist owner-derived summaries or search artifacts
  encrypted; authorized queries may use decrypted data in memory. Resolve failed
  library validation before completing.
- **Requires:** E1-S2.
- **Human coding time:** 8–14 hours.
- **Human coding with AI:** 4–8 hours.

### E6 — Establish secure browser network connections

As a user, I want the app to find and connect to relevant peers automatically.

#### E6-S1 — Connect known peers securely

As a user, I want authorized exchanges with configured peers.

- **Accept:** Connect configured peers through a secure browser
  transport with the necessary supporting infrastructure. Authenticate
  account-bound peers and authorize their requests. Establish a reachable,
  secure hosting setup for browser networking; the current loopback-only host
  and production build command do not supply public hosting or TLS. Enforce a
  connection-privacy policy that addresses IP exposure, and measure capacity
  and operating costs.
- **Requires:** E1-S6, E5-S2, E11-S1, E11-S2.
- **Human coding time:** 28–52 hours.
- **Human coding with AI:** 18–36 hours.

#### E6-S2 — Recover known-peer connections within bounded limits

As a user, I want a brief interruption to recover without uncontrolled retries.

- **Accept:** Recover interrupted peer connections within defined resource
  limits. Show connection status and resume authorized work without presenting
  disconnected peers as currently present.
- **Requires:** E6-S1.
- **Human coding time:** 12–24 hours.
- **Human coding with AI:** 8–16 hours.

#### E6-S3 — Discover regional peers automatically

As a user, I want to enter the relevant network without manually configuring contacts.

- **Accept:** Implement automatic entry into the regional peer network,
  including recovery when an entry peer is unavailable. Measure capacity and
  infrastructure costs against the $0 launch target.
- **Requires:** E6-S2.
- **Human coding time:** 16–32 hours.
- **Human coding with AI:** 10–22 hours.

#### E6-S4 — Validate launch connection and relay coverage

As a user, I want connections to work across the supported network conditions.

- **Accept:** Complete launch connection coverage under the agreed privacy
  policy. Verify representative network conditions and infrastructure failures
  against measured operating budgets.
- **Requires:** E6-S3.
- **Human coding time:** 16–32 hours.
- **Human coding with AI:** 12–24 hours.

### E7 — Replicate regional discovery and profile summaries

As a user, I want nearby profiles to become available locally as I move.

#### E7-S1 — Deliver opted-in summaries to one regional builder

As a tester, I want my permitted profile and presence available to the test region.

- **Accept:** Deliver authenticated discovery summaries and city-level
  presence to the configured regional builder. Accept only authorized updates
  and exclude private owner information.
- **Requires:** E2-S3, E3-S3, E6-S1.
- **Human coding time:** 10–16 hours.
- **Human coding with AI:** 5–9 hours.

#### E7-S2 — Apply withdrawals, expiry, and record ordering

As a user, I want stale or withdrawn profiles removed from current discovery.

- **Accept:** Apply consistent record-lifecycle rules across recipients so
  stale updates cannot restore withdrawn profiles. Keep these rules aligned
  with publication and presence behavior, and acknowledge publication changes
  to the owner.
- **Requires:** E7-S1, E2-S4.
- **Human coding time:** 12–24 hours.
- **Human coding with AI:** 8–16 hours.

#### E7-S3 — Converge the test region after movement and reconnect

As a tester, I want current records to replace old locations after an interruption.

- **Accept:** Reconcile pending publication changes after reconnecting.
  Movement must replace previous regional membership without duplicating
  profiles, and stale presence requires an authorized refresh.
- **Requires:** E7-S2, E6-S2.
- **Human coding time:** 12–24 hours.
- **Human coding with AI:** 8–16 hours.

#### E7-S4 — Route and replicate only relevant regions

As a user, I want nearby data without receiving a global discovery dataset.

- **Accept:** Implement geographically scoped replication that follows users
  across regional boundaries and converges after reconnection. Evaluate
  Peerbit first against the documented alternatives, including artifact
  distribution. Preserve direct owner-detail retrieval and record whether a
  P2P database adds value within resource and launch-cost limits.
- **Requires:** E7-S3, E6-S3, E9-S2.
- **Human coding time:** 36–68 hours.
- **Human coding with AI:** 24–48 hours.

#### E7-S5 — Release unneeded regional subscriptions and caches

As a moving user, I want discovery to stay within device resource limits.

- **Accept:** Adjust regional subscriptions as discovery needs change. Release
  unneeded cached data under defined retention rules while preserving owner
  data and available searches.
- **Requires:** E7-S4, E5-S4.
- **Human coding time:** 12–24 hours.
- **Human coding with AI:** 7–14 hours.

#### E7-S6 — Complete backup, deletion, and reconnect propagation

As a user, I want remote copies to follow the same lifecycle as shared peer records.

- **Accept:** Implement permitted server backup and recovery without replacing
  local data authority. Propagate removals across supported replicas and
  verify convergence after network partitions. Document retention limits,
  backup coverage, and operating costs.
- **Requires:** E7-S4, E1-S5.
- **Human coding time:** 24–48 hours.
- **Human coding with AI:** 16–34 hours.

### E8 — Build and distribute shared regional search indexes

As a user, I want ready-to-search regional data with minimal indexing work on
my device.

#### E8-S1 — Build one complete regional snapshot

As a tester, I want a fixed builder to prepare the index my phone will search.

- **Accept:** Build a regional Orama snapshot containing only current,
  permitted discovery data. Include enough metadata to identify its coverage,
  compatibility, and update position.
- **Requires:** E5-S1, E7-S2.
- **Human coding time:** 10–16 hours.
- **Human coding with AI:** 5–9 hours.

#### E8-S2 — Load and retain a compatible shared snapshot

As a user, I want to search a downloaded index without constructing it myself.

- **Accept:** Validate and retain shared snapshots under a defined cache
  policy. Reject unusable artifacts while preserving a working copy, and
  verify phone resource use against the E5-S1 budgets.
- **Requires:** E8-S1, E1-S2.
- **Human coding time:** 12–24 hours.
- **Human coding with AI:** 7–14 hours.

#### E8-S3 — Refresh through complete replacement snapshots

As a user, I want regional updates while my current searches remain responsive.

- **Accept:** Refresh complete snapshots from the fixed builder so they
  reflect current regional records. Validate replacements before activation
  and preserve usable data when refreshes fail without presenting expired
  information as current.
- **Requires:** E8-S2, E7-S3.
- **Human coding time:** 12–24 hours.
- **Human coding with AI:** 7–14 hours.

#### E8-S4 — Implement the Version 1 index update format

As a user, I want updates that meet the validated device and transfer budgets.

- **Accept:** Choose and implement an index update strategy that works within
  device limits. Verify compatibility and reliable recovery when updates fail.
- **Requires:** E8-S3, E5-S3, E7-S4.
- **Human coding time:** 32–64 hours.
- **Human coding with AI:** 22–46 hours.

#### E8-S5 — Qualify and verify regional builders

As a user, I want shared indexes to come from authorized, verifiable builders.

- **Accept:** Establish how regional builders qualify and operate within
  measured resource and cost limits. Verify that their artifacts contain
  authorized discovery data; a trusted connection alone does not establish
  correctness.
- **Requires:** E8-S4.
- **Human coding time:** 24–48 hours.
- **Human coding with AI:** 18–36 hours.

#### E8-S6 — Continue indexing after builder failure or handoff

As a user, I want index availability without unnecessary full reconstruction.

- **Accept:** Preserve indexing through builder failure or handoff using
  compatible saved state. Keep a usable client index available when
  replacement builders or versions fail.
- **Requires:** E8-S5.
- **Human coding time:** 24–48 hours.
- **Human coding with AI:** 16–34 hours.

### E9 — Complete discovery and shared-profile workflows

As a user, I want to browse search results and open profiles shared with me.

#### E9-S1 — Display real nearby profiles

As a user, I want a discovery view backed by the downloaded regional index.

- **Accept:** Replace placeholder profiles with permitted discovery results
  and usable geographic search controls, extending the beta page from E9-S4.
  Explain result availability and freshness.
  Resolve the public Profiles access policy before exposing real data, and
  enforce account access and local blocking rules.
- **Requires:** E1-S6, E9-S4, E5-S5, E8-S3, E11-S1.
- **Human coding time:** 6–12 hours.
- **Human coding with AI:** 2–6 hours.

#### E9-S2 — Open details directly from an authorized owner

As a user, I want to view additional profile information shared with me.

- **Accept:** Retrieve detailed profiles directly from their owners with
  explicit sharing permission. Enforce access restrictions and show
  unavailable when an owner cannot be reached. Keep details out of shared
  indexes.
- **Requires:** E9-S1, E6-S1.
- **Human coding time:** 16–28 hours.
- **Human coding with AI:** 9–18 hours.

#### E9-S3 — Complete responsive and accessible application navigation

As a user, I want to move between discovery, profiles, controls, and conversations.

- **Accept:** Integrate Version 1 workflows into accessible navigation that
  works well on mobile. Preserve the stable `/` PWA start URL and integrate
  sign-in, profile editing, real Map/Grid discovery, conversations, and controls.
  Basic accessible beta navigation belongs to E9-S4; this story completes the
  broader application flow.
- **Requires:** E9-S2, E9-S5, E5-S3, E5-S4, E10-S3.
- **Human coding time:** 20–36 hours.
- **Human coding with AI:** 8–18 hours.

#### E9-S4 — Provide the text-only profile-search page

As a beta demonstrator, I want to search stored profile text inside the PWA.

- **Accept:** Replace sample-only results in the beta search view with E5-S6
  query results showing display name and bio. Provide a labeled search control,
  keyboard-accessible navigation to text-profile editing, and loading, empty,
  and failure states. Label synthetic data clearly; do not imply live nearby
  users or real presence. Keep map, location, photo, and sign-in placeholders
  from obstructing this text-only flow. Keep markup and styles separate from
  scripts and preserve the existing PWA entry and service-worker lifecycle.
- **Requires:** E5-S6, E2-S1.
- **Human coding time:** 6–12 hours.
- **Human coding with AI:** 3–6 hours.

#### E9-S5 — Render real discovery in Map and Grid views

As a user, I want Map and Grid to represent the same permitted discovery results.

- **Accept:** Replace the illustrative map with real permitted discovery areas
  and keep Map/Grid results, selection, and grid column controls consistent.
  Respect city-level or explicitly selected precise disclosure without deriving
  finer locations. Validate map rendering and tile/data supply against the $0
  operating target and provider terms; choosing a library alone is insufficient.
  This implements DESIGN's Map/Grid scope after the text-only beta.
- **Requires:** E9-S1.
- **Human coding time:** 16–32 hours.
- **Human coding with AI:** 8–18 hours.

### E10 — Implement rudimentary private messaging

As a user, I want to exchange private messages and retain my conversation history
locally.

#### E10-S1 — Send and receive encrypted one-to-one text

As a user, I want private text exchange with another authorized user.

- **Accept:** Enable private messaging between two discovered users through
  planned Converse/XMPP. Resolve server configuration, end-to-end encryption,
  key/identity binding, and integration with the peer layer; transport encryption
  alone does not establish private message content. Tie messaging access to
  authenticated local accounts and preserve encrypted conversation history
  across reloads. Resolve the granthdb/Converse persistence boundary here for
  basic exchanges; E10-S4 extends delivery and retention behavior.
- **Requires:** E9-S2, E11-S2.
- **Human coding time:** 32–60 hours.
- **Human coding with AI:** 20–42 hours.

#### E10-S2 — Retain and retry sender-held pending messages

As a user, I want failed sends to remain visible and recover after reconnection.

- **Accept:** Retain undelivered messages encrypted locally and clearly show
  delivery progress. Retry after reconnection without duplicating conversation
  entries across retries or reloads.
- **Requires:** E10-S1.
- **Human coding time:** 12–24 hours.
- **Human coding with AI:** 7–16 hours.

#### E10-S3 — Provide a conversation view

As a user, I want to open a contact, read local history, and send messages.

- **Accept:** Provide a conversation interface for reading local history and
  sending or retrying text messages. Use profile identities and clearly show
  messaging status. Richer messaging features remain excluded.
- **Requires:** E10-S2.
- **Human coding time:** 16–28 hours.
- **Human coding with AI:** 6–14 hours.

#### E10-S4 — Finalize Version 1 delivery and retention behavior

As a user, I want to know where undelivered messages and conversation copies remain.

- **Accept:** Decide whether delivery requires permitted intermediary storage.
  Implement the resulting retention policy and coordinate messaging persistence
  with granthdb while preserving local authority.
- **Requires:** E10-S2.
- **Human coding time:** 12–28 hours.
- **Human coding with AI:** 8–20 hours.

#### E10-S5 — Reconcile histories across delivery interruptions

As a user, I want consistent conversations after delayed, repeated, or reordered delivery.

- **Accept:** Verify consistent conversation history through delivery
  interruptions and retention boundaries. Preserve message identity and
  ordering without silent duplication or loss.
- **Requires:** E10-S3, E10-S4.
- **Human coding time:** 0 hours.
- **Human coding with AI:** 0 hours.

#### E10-S6 — Integrate supported platform notifications

As a user, I want incoming-message notifications where my browser or PWA supports them.

- **Accept:** Provide an explicit notification-permission flow and notify for
  messages received while the application can receive them, respecting blocking
  and private-content preferences. Handle denial and unsupported platforms.
  Document supported browser/installed-PWA behavior. Closed-app delivery and
  background push remain separate, unresolved scope rather than implied support.
- **Requires:** E10-S3, E11-S1.
- **Human coding time:** 8–16 hours.
- **Human coding with AI:** 4–8 hours.

### E11 — Complete blocking, reporting, and abuse controls

As a user, I want control over unwanted interactions and a way to report abuse.

#### E11-S1 — Store and apply a local block list

As a user, I want to block a user across discovery, profile access, and messaging.

- **Accept:** Save each account’s blocking preferences and provide shared
  checks that enforce them throughout discovery and messaging.
- **Requires:** E1-S2.
- **Human coding time:** 8–12 hours.
- **Human coding with AI:** 3–6 hours.

#### E11-S2 — Validate untrusted input at feature boundaries

As a user, I want peers unable to overwrite my data or exhaust my device trivially.

- **Accept:** Provide shared validation that protects feature boundaries
  from unauthorized or abusive input. Verify rejection with hostile fixtures,
  and require each feature to validate its transport before accepting
  untrusted traffic.
- **Requires:** E1-S2, E2-S3.
- **Human coding time:** 16–28 hours.
- **Human coding with AI:** 10–20 hours.

#### E11-S3 — Report abuse through an actionable moderation workflow

As a user, I want to report harmful interactions with control over shared evidence.

- **Accept:** Provide an actionable abuse-reporting workflow with consent over
  shared evidence and clear moderation responsibilities. Explain report
  progress and apply defined evidence-retention rules.
- **Requires:** E11-S1, E9-S2, E10-S3.
- **Human coding time:** 20–36 hours.
- **Human coding with AI:** 10–22 hours.

#### E11-S4 — Enforce limits across the Version 1 network

As a user, I want distributed features to respect authorization and device budgets.

- **Accept:** Enforce authorization and resource limits throughout the Version
  1 network. Verify that hostile traffic cannot bypass those controls.
- **Requires:** E11-S2, E7-S6, E8-S6, E6-S4, E10-S5.
- **Human coding time:** 24–40 hours.
- **Human coding with AI:** 16–30 hours.

### E12 — Complete connectivity and recovery behavior

As a returning user, I want clear connectivity states and reliable recovery
so that interruptions and application updates preserve my local data.

#### E12-S1 — Preserve the page and enforce sustained-offline behavior

As a user, I want brief interruptions tolerated and sustained loss clearly shown.

- **Accept:** Apply the network-required interaction policy consistently
  during startup and connection loss. Tolerate brief interruptions such as ten
  seconds, then show a shaded interaction-blocking overlay stating “The app is
  offline.” during sustained loss. Preserve the underlying page and remove the
  overlay automatically on reconnection. Define the timing and connectivity
  criteria; treat an unreachable owner separately from application connectivity.
- **Requires:** E1-S2.
- **Human coding time:** 10–18 hours.
- **Human coding with AI:** 4–9 hours.

#### E12-S2 — Apply application updates without corrupting local data

As a returning user, I want new app versions to preserve my profile and messages.

- **Accept:** Coordinate application updates with stored-data and index
  compatibility. Verify that failed or interrupted updates leave a recoverable
  application and data state.
- **Requires:** E12-S1, E1-S3, E8-S4.
- **Human coding time:** 16–28 hours.
- **Human coding with AI:** 10–20 hours.

#### E12-S3 — Recover all features after interruption

As a user, I want publication, discovery, and conversations to resume consistently.

- **Accept:** Restore consistent application state after reconnection. Verify
  that interruptions and updates preserve owner data.
- **Requires:** E12-S2, E7-S6, E8-S6, E10-S5.
- **Human coding time:** 20–36 hours.
- **Human coding with AI:** 14–26 hours.

#### E12-S4 — Explain unavailable storage and recovery limits

As a user, I want clear guidance when keys or local storage are unavailable.

- **Accept:** Explain local storage failures and unavailable keys with
  actionable guidance. Link to supported recovery procedures without promising
  recovery from disposable caches or deferred identity-recovery features.
- **Requires:** E12-S1, E1-S3, E1-S4.
- **Human coding time:** 8–12 hours.
- **Human coding with AI:** 3–6 hours.

### E13 — Validate and prepare the Version 1 release

As a user, I want a reliable installation and update path that preserves my data
and privacy.

E13-S1 is retired. There is no separate two-device prototype verification story.

#### E13-S2 — Establish central distribution and verified updates

As a user, I want an authentic install and a recoverable update path.

- **Accept:** Provide authentic central distribution and recoverable updates
  for the Bun executable and PWA. Verify the release artifact together with
  its manual deployment, public HTTPS hosting, and rollback procedure. Preserve
  the build/test failure gate; automatic deployment remains a separate choice.
- **Requires:** E13-S5, E12-S2.
- **Human coding time:** 16–28 hours.
- **Human coding with AI:** 8–16 hours.

#### E13-S3 — Verify complete Version 1 acceptance

As a user, I want the finished release to work on supported browsers and installed PWAs.

- **Accept:** Verify complete E1–E12 acceptance across supported environments.
  Resolve functional and privacy failures before preparing the release.
- **Requires:** Every remaining story in E1–E12, E13-S2.
- **Human coding time:** 0 hours.
- **Human coding with AI:** 0 hours.

#### E13-S4 — Confirm operating readiness and produce the release artifact

As a maintainer, I want a release whose capacity, costs, and recovery are understood.

- **Accept:** Confirm operating readiness against measured capacity and the $0
  launch plan. Resolve cost gaps, run `bun run deploy`, and retain `dist/link-up`
  only when production bundling and tests succeed. Deployment remains a separate
  action. This finishes the specified Version 1 scope, not an independently
  agreed smaller MVP.
- **Requires:** E13-S3.
- **Human coding time:** 0 hours.
- **Human coding with AI:** 0 hours.

#### E13-S5 — Verify the text-search beta demo

As a beta demonstrator, I want evidence that stored profile text can be searched
and displayed inside the PWA.

- **Accept:** Demonstrate text-profile editing, encrypted save and local unlock,
  and persistence across reloads. With reproducible synthetic summaries, verify
  name/bio queries, matching and nonmatching results, updates/deletions, and
  clear empty/error states on the PWA search page. Confirm that private records
  are not implicitly searchable and that sustained network loss blocks
  interaction without removing the current page. Run `bun run build` and record
  browser/PWA verification and any failures. No photo, geolocation, peer,
  regional snapshot, messaging, or second-device flow is required. This is the
  **beta demo completion gate**, not an MVP or release gate.
- **Requires:** E9-S4, E12-S1.
- **Human coding time:** 0 hours.
- **Human coding with AI:** 0 hours.

## Deferred and excluded capabilities

Anonymous participation in publication, private profile access, or messaging,
read receipts, and typing indicators remain excluded. Public shell and synthetic
beta browsing are supported; unauthenticated access to real opted-in summaries
must be decided in E1-S6 before E9-S1 exposes them.
Remote-region travel mode, advanced/background message delivery, attachments,
structured sharing, groups/events, public posts, shared places/check-ins,
audio/video, device linking/identity recovery, and ad delivery remain deferred
or uncommitted as recorded in the network and search decisions. They are not
implicit acceptance criteria for the stories above. Supported notifications for
messages received by an active application belong to E10-S6; that does not
promise background delivery.

## Unresolved issues

Operating costs and device resource requirements cannot yet be assessed reliably
because too many implementation details remain unknown. The implementation
stories establish and measure regional index loading and updates on phones,
builders, backups, relays, XMPP, and central distribution as those features
are built. Resolve each choice and its measured limits within the feature
that needs it, before completing its dependent launch work.
The $0 launch operating-cost target remains the goal.
MVP user scope and acceptance remain open. The beta is the immediate delivery
target; no separate prototype is scheduled between beta and the remaining
Version 1 feature work.

## Total coding estimates

- **Human coding time:** 826–1,532 hours (approximately 103.3–191.5 eight-hour workdays).
- **Human coding with AI:** 481–961 hours (approximately 60.1–120.1 eight-hour workdays).

The beta subset is 54–90 human coding hours, or 27–49 with AI, included in these
totals. E5-S1 and E9-S1 estimates cover their geographic extensions after the
beta text-search and results-page stories, without counting that base work twice.
