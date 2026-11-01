# Link-up Implementation Roadmap

This roadmap covers the remaining Version 1 application: geographic discovery,
searchable profiles, and rudimentary private messaging. Each epic contains
individually selectable user stories in priority order. Technical enablers use
the same acceptance and dependency rules as user-facing stories.

Sources:

- [Application overview](DESIGN.md)
- [Locality architecture](locality-design.md)
- [Network and search decisions](network-search-decisions.md)
- [Regional search architecture](regional-search-recap.md)

## Current baseline

Source inspection shows an existing PWA shell, Workbox precaching, Bun executable
build, Clerk authentication integration, and placeholder profile views. H3
is an installed dependency; application persistence, encrypted user data,
geographic discovery, peer networking, search, and messaging remain to be implemented.

Some overview descriptions lag behind the source: authentication exists, and
Profiles is publicly accessible. Resolve access policy before exposing real data.

granthdb, H3, and Converse/XMPP are established directions. Orama is preferred but
awaits validation. Peer transport, replication, and shared-index mechanisms
remain open choices.

## Story ordering and sprint composition

- Story IDs are stable. Within each epic, lower-numbered stories have higher
  implementation priority; explicit dependencies determine what can start.
- **Requires** lists direct prerequisite stories. Their prerequisites also apply.
  Epic order alone does not impose a dependency on every story in an earlier epic.
- **Accept** defines the complete scope of a story. A sprint selects whole stories
  and their unmet prerequisites; it does not silently narrow acceptance criteria.
- Early stories deliver bounded, reusable capabilities: a test region, known
  peers, one builder, and complete snapshots. Later stories extend those
  capabilities for Version 1. Completing an early story does not complete its epic.
- Research, definitions, library evaluation, and architecture decisions are
  part of the implementation stories that need them. Set budgets before
  evaluation, record the results with the implementation, and resolve failed
  validation before completing the story. Prototype choices do not settle
  launch architecture.
- [Speed Sprint](Speed_Sprint_Detailed.md) selects an ordered, dependency-complete subset.
  Its story definitions and acceptance criteria live here. No story below is
  marked complete by this planning exercise.

Human coding time estimates assume one experienced developer without AI assistance.
Human coding with AI estimates assume the same developer using AI assistance.
Both are person-hours.
They include implementation and prototype code, excluding research, testing,
and documentation. Prerequisites are assumed complete; their effort is not
counted again. Zero means no coding is specified, not zero total effort.
Ranges are planning judgments and may change as implementation resolves the architecture.

## Version 1 epics

Begin with profile data structures, then their local store with locality as a
first-class entity. Create saved profiles and resolve their localities before
implementing local search, regional distribution, and discovery. Messaging
follows working discovery.

E11 and E12 begin alongside the features they govern. Their final stories cover
integration across the completed Version 1 application.

### E1 — Create profile and locality data structures and encrypted storage

As a user, I want my authoritative data to remain encrypted on my device and
under my control.

#### E1-S1 — Create profile and locality data structures and their local store

As a user, I want my data kept separate from other accounts on this device.

- **Accept:** Create reusable profile and locality models in a versioned,
  account-scoped granthdb store. Map Clerk identities to stable local accounts.
  Keep geographic concepts distinct and private owner data separate from
  supporting discovery data. Verify isolation with non-sensitive fixtures;
  real owner data awaits E1-S2.
- **Requires:** None.
- **Human coding time:** 8–12 hours.
- **Human coding with AI:** 4–6 hours.

#### E1-S2 — Encrypt and reopen authoritative owner records

As a user, I want my profile and messages protected and available after reload.

- **Accept:** Encrypt owner records with account-scoped keys and reopen them
  after reload or sign-in. Keep accounts isolated and show failures clearly
  without silently saving plaintext. Device linking and identity recovery
  remain deferred.
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
  version approved for discovery.
- **Requires:** E2-S1.
- **Human coding time:** 6–10 hours.
- **Human coding with AI:** 3–5 hours.

#### E2-S3 — Opt into publishing a permitted search summary

As a user, I want to explicitly choose whether my profile appears in discovery.

- **Accept:** Require explicit opt-in before preparing a permitted search
  summary. Keep private information out of distributed discovery data. Version
  outgoing updates and show whether saved changes await publication; network
  delivery belongs to E7.
- **Requires:** E2-S2.
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

- **Accept:** Keep active location and presence current using fixed prototype
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

### E4 — Build offline locality reference data and resolution

As a user, I want useful locality names without depending on metered geographic
services.

#### E4-S1 — Prepare reference data for one test region

As a tester, I want a reproducible geographic dataset for the prototype region.

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

As a user, I want locality resolution beyond the prototype region.

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

- **Accept:** Implement persistent local profile search using permitted
  discovery data. Evaluate Orama and complete snapshot support against phone
  performance and transfer budgets set in advance. Verify realistic geographic
  and record-lifecycle cases. Order matches by disclosed distance with stable
  tie breaking, and resolve compatibility problems before distributed-index
  work.
- **Requires:** E2-S3, E3-S3.
- **Human coding time:** 18–34 hours.
- **Human coding with AI:** 10–20 hours.

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

### E6 — Establish secure browser network connections

As a user, I want the app to find and connect to relevant peers automatically.

#### E6-S1 — Connect known peers securely

As a tester, I want authorized exchanges between configured test devices.

- **Accept:** Connect two configured devices through a secure browser
  transport with the necessary supporting infrastructure. Authenticate
  account-bound peers and authorize their requests. Enforce a prototype
  connection-privacy policy that addresses IP exposure, and measure capacity
  and operating costs.
- **Requires:** E5-S2, E11-S1, E11-S2.
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
  and usable search controls. Explain result availability and freshness.
  Resolve the public Profiles access policy before exposing real data, and
  enforce account access and local blocking rules.
- **Requires:** E5-S5, E8-S3, E11-S1.
- **Human coding time:** 12–24 hours.
- **Human coding with AI:** 5–12 hours.

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
  works well on mobile. Decide whether maps belong in this release; inclusion
  requires sustainable rendering and tile infrastructure with separately
  reviewable implementation stories.
- **Requires:** E9-S2, E5-S3, E5-S4, E10-S3.
- **Human coding time:** 20–36 hours.
- **Human coding with AI:** 8–18 hours.

### E10 — Implement rudimentary private messaging

As a user, I want to exchange private messages and retain my conversation history
locally.

#### E10-S1 — Send and receive encrypted one-to-one text

As a user, I want private text exchange with another authorized user.

- **Accept:** Enable private messaging between two discovered users through
  Converse/XMPP. Tie messaging access to their local accounts and preserve
  encrypted conversation history across reloads.
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
  Implement the resulting retention policy and coordinate Converse persistence
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

### E11 — Complete blocking, reporting, and abuse controls

As a user, I want control over unwanted interactions and a way to report abuse.

#### E11-S1 — Store and apply a local block list

As a user, I want to block a user across discovery, profile access, and messaging.

- **Accept:** Save each account’s blocking preferences and provide shared
  checks that enforce them throughout discovery and messaging.
- **Requires:** E1-S2.
- **Human coding time:** 8–12 hours.
- **Human coding with AI:** 3–6 hours.

#### E11-S2 — Validate untrusted input at prototype boundaries

As a user, I want peers unable to overwrite my data or exhaust my device trivially.

- **Accept:** Provide shared validation that protects prototype boundaries
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
  seconds, show the blocking offline overlay during sustained loss, and remove
  it automatically on reconnection. Treat an unreachable owner separately.
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

#### E13-S1 — Verify the complete two-device prototype

As a tester, I want evidence that location, discovery, and private messaging work together.

- **Accept:** Verify the complete discovery-to-messaging flow on two devices,
  including a phone. Exercise privacy boundaries and recovery under realistic
  use and failure conditions. Run `bun run test` and record measured operating
  requirements alongside failures and resulting architecture decisions.
- **Requires:** E9-S2, E10-S3, E11-S1, E11-S2, E12-S1.
- **Human coding time:** 0 hours.
- **Human coding with AI:** 0 hours.

#### E13-S2 — Establish central distribution and verified updates

As a user, I want an authentic install and a recoverable update path.

- **Accept:** Provide authentic central distribution and recoverable updates
  for the Bun executable and PWA. Verify the release artifact together with
  its deployment procedure.
- **Requires:** E13-S1, E12-S2.
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
  launch plan. Resolve cost gaps, run `bun run test`, and retain the passing
  artifact. Deployment remains a separate action.
- **Requires:** E13-S3.
- **Human coding time:** 0 hours.
- **Human coding with AI:** 0 hours.

## Deferred and excluded capabilities

Anonymous/guest entry, read receipts, and typing indicators remain excluded.
Remote-region travel mode, advanced/background message delivery, attachments,
structured sharing, groups/events, public posts, shared places/check-ins,
audio/video, device linking/identity recovery, and ad delivery remain deferred
or uncommitted as recorded in the network and search decisions. They are not
implicit acceptance criteria for the stories above.

## Unresolved issues

Operating costs and device resource requirements cannot yet be assessed reliably
because too many implementation details remain unknown. The implementation
stories establish and measure regional index loading and updates on phones,
builders, backups, relays, XMPP, and central distribution as those features
are built. Resolve each choice and its measured limits within the feature
that needs it, before completing its dependent launch work.
The $0 launch operating-cost target remains the goal.

## Total coding estimates

- **Human coding time:** 790–1,460 hours (approximately 98.8–182.5 eight-hour workdays).
- **Human coding with AI:** 463–921 hours (approximately 57.9–115.1 eight-hour workdays).
