# Link-up Implementation Roadmap

This roadmap covers the remaining Version 1 application: geographic discovery,
searchable profiles, and rudimentary private messaging. Deferred capabilities
are listed separately. Ordering reflects dependencies rather than estimates.

Sources:
- [Application overview](DESIGN.md)
- [Locality architecture](locality-design.md)
- [Network and search decisions](network-search-decisions.md)
- [Regional search architecture](regional-search-recap.md)

## Current baseline

Source inspection shows an existing PWA shell, Workbox precaching, Bun executable
build, Clerk authentication integration, and placeholder profile views. Local
persistence, encrypted user data, geographic discovery, peer networking, search,
and messaging remain to be implemented.

Some overview descriptions lag behind the source: authentication exists, and
Profiles is publicly accessible. Resolve access policy before exposing real data.

Dexie, H3, and Converse/XMPP are established directions. Orama is preferred but
awaits validation. Peer transport, replication, and shared-index mechanisms
remain open choices.

## Version 1 epics

E14 and E15 begin alongside the features they govern; their positions below mark
final integration and verification.

### E01 — Define identity, data ownership, and sharing contracts

As a user, I want clear control over my identity and shared information so that
using discovery and messaging preserves my data ownership.

- Define profile fields and distinguish owner-only details, searchable summaries,
  and minimal geographic discovery records.
- Decide how accounts relate to peer identities, encryption keys, and messaging
  identities; resolve authenticated access versus the public Profiles page.
- Define sharing permissions, blocking, location precision, retention, withdrawal,
  deletion, and connectivity rules consistent with DESIGN.md. Retained recipient
  copies cannot be guaranteed erased.

Complete when these contracts are documented and usable by the storage, network,
search, and messaging implementations.

### E02 — Validate local search and shared-index delivery

As a user, I want fast local searches without excessive downloads or repeated
index construction on my phone.

- Evaluate Orama using representative regional datasets and phones: snapshot
  loading, persistence, text search, structured filters, radius filtering,
  nearest-first ordering, and memory use.
- Verify transferable index changes separately from local document updates.
  Evaluate segment loading, overlap deduplication, and version compatibility.
- Select the search engine and update strategy from measured results. If efficient
  deltas are unavailable, explicitly resolve the tradeoff before dependent work.

Complete when the search architecture and acceptable resource budgets are
established. Depends on E01.

### E03 — Select the network and regional distribution architecture

As a user, I want reliable regional discovery without downloading a global
dataset or surrendering local authority.

- Evaluate Peerbit first, with the documented alternatives as comparisons; decide
  whether a P2P database is needed alongside the search engine.
- Prove browser connectivity, geographic scoping, reconnect convergence, and
  owner-only detailed-profile retrieval using the proposed distribution model.
- Resolve direct versus relay-only privacy, initial network entry, server backup,
  signaling, relay availability, and a launch infrastructure plan targeting $0.
- Validate two-user Converse/XMPP integration, including identity mapping, encryption,
  persistence, infrastructure costs, and whether messaging requires the peer layer.

Complete when an integration prototype demonstrates the chosen responsibilities,
privacy boundary, and operating assumptions. Depends on E01 and E02.

### E04 — Implement encrypted local storage and data lifecycle

As a user, I want my authoritative data to remain encrypted on my device and
under my control.

- Implement versioned Dexie storage for owner data and the local state required
  by the selected architecture. Separate authoritative data from disposable
  regional caches and reference data.
- Implement encryption, key creation and access, account isolation, migrations,
  and defined behavior for storage failures and browser eviction.
- Provide the agreed export and deletion controls; define retention and backup
  boundaries without making a remote copy authoritative.

Complete when local data survives restarts and migrations, respects account
boundaries, and can be exported or deleted as designed. Depends on E01.

### E05 — Create and maintain the user's profile

As a user, I want to create and update my profile and choose what others can see.

- Implement profile editing, validation, image storage, and visibility controls
  using the agreed fields.
- Save changes locally and derive only the permitted search summary and discovery
  data for later publication.
- Support profile withdrawal and clearly distinguish local changes from their
  network publication state.

Complete when profile management works locally and produces the records consumed
by regional distribution. Depends on E01 and E04.

### E06 — Implement privacy-aware location and presence

As a user, I want discovery to follow my location while revealing only the
precision I permit.

- Implement permission handling, H3 membership, and city-level versus precise
  location representations.
- Set and implement movement thresholds, jitter suppression, driving behavior,
  refresh intervals, and presence expiration.
- Handle denied or unavailable positioning, stale positions, and cell crossings
  without leaking finer location through records or search results.

Complete when location and presence produce bounded, privacy-compliant updates
across stationary, moving, and disconnected scenarios. Depends on E01 and E04.

### E07 — Build offline locality reference data and resolution

As a user, I want useful locality names without depending on metered geographic
services.

- Build a maintainable Census/Gazetteer/GNIS preparation pipeline and compact,
  versioned reference datasets, partitioned where necessary.
- Implement local coordinate-to-locality resolution and cached mappings, including
  ambiguous cells and locality boundaries.
- Define neighborhood and metro scope where used. Keep government API fallbacks
  optional and essential resolution independent of those services.

Complete when downloaded reference data supports locality resolution offline
and can be refreshed without disturbing user data. Depends on E04 and E06.

### E08 — Implement local geographic and profile search

As a user, I want nearby, relevant profiles to appear quickly and remain
searchable while regional updates arrive.

- Validate local search against representative datasets before integrating
  distributed indexes in E11.
- Implement text and profile filters, geographic radius filtering, nearest-first
  ordering, and deterministic ordering for equal-distance profiles.
- Implement density-adaptive discovery, neighboring-region expansion, and
  deduplication while respecting disclosed location precision.
- Search available local data immediately; incorporate incoming updates without
  blocking queries and indicate incomplete or stale coverage.

Complete when search meets the agreed phone resource budgets and behaves correctly
across dense, rural, boundary, and disconnected scenarios.
Depends on E02, E05, E06, and E07; integrates with E11.

### E09 — Establish secure browser network connections

As a user, I want the app to find and connect to relevant peers automatically.

- Implement the selected identities, network entry, peer discovery, secure
  connections, signaling, and relay behavior.
- Bind network actions to the authorization contracts and apply the chosen
  direct-connection privacy policy.
- Handle disconnects, retries, suspension, and reconnection within defined
  bandwidth and connection limits.

Complete when browser peers connect and reconnect across representative networks,
including the required relay paths. Depends on E03 and E04.

### E10 — Replicate regional discovery and profile summaries

As a user, I want nearby profiles to become available locally as I move.

- Implement region-to-peer routing and geographically scoped replication of
  presence, permitted location, and searchable profile summaries.
- Acquire neighboring regions where needed and release unnecessary subscriptions
  and cached data as discovery scope changes.
- Implement authorized updates, conflict resolution, expiration, withdrawals,
  deletion propagation, and the agreed server-backup behavior.

Complete when peers converge after disconnection and movement without replicating
owner-only details or requiring a global dataset. Depends on E05, E06, and E09.

### E11 — Build and distribute shared regional search indexes

As a user, I want ready-to-search regional data with minimal indexing work on
my device.

- Implement regional builders and the validated snapshot/update format, containing
  only data authorized for its recipients.
- Implement builder selection, verification, failover, and handoff that preserves
  compatible indexes and their recorded update positions.
- Support format compatibility, interrupted transfers, and recovery from invalid
  or incompatible artifacts while retaining a usable local index.

Complete when phones can obtain and update regional indexes and builder failure
does not require unnecessary reconstruction. Depends on E02 and E10.

### E12 — Complete discovery and shared-profile workflows

As a user, I want to browse search results and open profiles shared with me.

- Connect the profile views to real search results, filters, locality labels,
  presence, and appropriate empty, loading, and unavailable states.
- Retrieve detailed profiles directly from their owners under the sharing policy;
  implement the agreed behavior when an owner is unavailable.
- Complete responsive, accessible navigation between discovery, profiles, account
  controls, and conversations. Resolve map rendering and unmetered tile availability
  before committing a map implementation.

Complete when a user can discover another user and view the permitted profile
through the application. Depends on E08, E10, and E11.

### E13 — Implement rudimentary private messaging

As a user, I want to exchange private messages and retain my conversation history
locally.

- Integrate Converse/XMPP with application identity, connection infrastructure,
  encryption, and local message persistence.
- Resolve sender-held versus intermediary-held pending messages, retention, and
  reconciliation between Converse persistence and Dexie.
- Implement conversations, sending, receiving, visible pending/failure states,
  retries, duplicate handling, and eventual consistency after reconnection.

Complete when two users can exchange encrypted private messages and recover
consistent local histories after disconnects. Read receipts and typing indicators
remain excluded. Depends on E01, E03, and E04.

### E14 — Complete blocking, reporting, and abuse controls

As a user, I want control over unwanted interactions and a way to report abuse.

- Apply blocking across discovery, profile access, and messaging according to the
  agreed policy.
- Implement reporting and an actionable moderation workflow with explicit rules
  for evidence sharing and retention.
- Enforce authorization and resource limits on records, queries, transfers,
  connections, builders, and messaging.

Complete when controls work across relevant interactions and unauthorized or
malformed network input cannot bypass them. Develop alongside E01, E05, and E08–E13.

### E15 — Complete connectivity and recovery behavior

As a returning user, I want clear connectivity states and reliable recovery
so that interruptions and application updates preserve my local data.

- Integrate cached application startup with authentication and key access while
  enforcing the network-required interaction policy in DESIGN.md.
- Preserve page state during brief interruptions; block interaction with the
  offline overlay after sustained loss and resume automatically on reconnection.
- Implement safe application updates and storage migrations, reconnection
  reconciliation, and clear offline or unavailable states.

Complete when cached startup respects access policy and interruptions and updates
preserve authoritative data. Develop alongside E04–E13.
Depends on E04, E05, E08, and E13.

### E16 — Validate and prepare the Version 1 release

As a user, I want a reliable installation and update path that preserves my data
and privacy.

- Complete central distribution, download integrity, update verification,
  rollback/recovery arrangements, and required infrastructure configuration.
- Validate complete workflows on supported browsers and installed mobile PWAs,
  including permission failures, network loss, movement, stale data, upgrades,
  peer/builder failures, privacy boundaries, and accessibility.
- Verify measured phone and infrastructure limits, backup recovery, and the launch
  operating-cost plan. Run the required build-and-test workflow before deployment.

Complete when E01–E15 meet their acceptance criteria and the tested release
artifact and operating procedures are ready for deployment.

## Unresolved issues

Operating costs and device resource requirements cannot yet be assessed reliably
because too many implementation details remain unknown. A working prototype is
needed to evaluate regional index loading and updates on phones, along with the
infrastructure needed for builders, backups, relays, and central distribution.
Further decisions on these concerns are deferred until prototype results provide
evidence. The $0 launch operating-cost target remains the goal.
