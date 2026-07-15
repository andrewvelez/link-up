# Link-Up Architecture Chat 1

## Context Provided

Link-Up is a gay dating/social app intended to feel different from Grindr-style apps. The core experience should be free, less hostile around paywalls, and focused on real connection. Monetization should come from ancillary commerce, sponsorships, ads, events, partnerships, and similar sources rather than restricting basic dating functionality.

Architecturally, Link-Up should be client-heavy and server-light. It is not purely serverless for ideological reasons; servers or home authorities still handle identity, permissions, profile visibility, blocks, reports, abuse controls, exact-location protection, capability issuance, paid feature state, durable reconciliation, and fallback. Clients should do as much as practical, especially local computation, caching, profile rendering, and authorized peer communication.

Location is the core primitive. Link-Up uses density-adaptive geocells: social proximity units rather than fixed map tiles. Dense areas should have smaller geocells, rural areas larger ones. Discovery expands from current geocell to adjacent geocells, then neighborhood, city, and metro.

Locality-centered design applies across discovery, rendezvous, caching, replicated storage, bandwidth sharing, abuse detection, routing hints, backup placement, and recovery. The storage rule is: global addressability, local availability.

Data is split into public, private, and internal. Public means user-approved/shareable subject to audience rules, not globally visible. Private means user-owned data the app may use but should not expose. Internal means operational or system state, split between static reference data and dynamic operational state.

Transport should use WebRTC/RTCDataChannel for authorized peer data and media, with signaling over WebSocket, HTTPS, XMPP, Matrix, or similar. TURN-only relay can be used for privacy-sensitive modes. WebRTC should not become unrestricted broadcast. Peer-floated state should use signed, scoped, expiring, audience-encrypted envelopes/capabilities and append-only signed events.

## Initial Implementation Assumptions

The only fixed implementation detail is that the frontend will use JavaScript/Bun.js with JSDoc type checking. Htmx will be used instead of React. Backend code can be JavaScript or Go. The general app boundary is:

```text
Frontend-Web <--> Backend RESTful APIs
```

## First Proposed MVP Shape

The first proposed outline treated the MVP as a mostly centralized authoritative app:

```text
Frontend-Web -> Backend API -> Database/Object Storage
```

The frontend would handle htmx rendering, local browser behavior, location permission, profile grid, chat UI, and light caching. The backend would own identity, profiles, discovery, geocell assignment, blocks, reports, messages, and permissions. Postgres and object storage would be used first. WebRTC, content-addressed storage, signed capabilities, and locality-aware replication would be left as later extension points.

This was rejected as too conventional because it did not prove the key MVP thesis.

## Corrected MVP Thesis

The MVP is not just “can we build a dating app?”

The MVP is:

> Can a viable web app be achieved at low running cost, excluding development time, so the app can be free to users, where users are not the product but are instead part of the running engine of the app?

This changes the MVP. The app must prove that normal operation becomes cheaper as users participate.

The backend should not be the full app engine. It should be the authority, referee, rendezvous point, and fallback. Active browser clients should provide meaningful runtime work such as local caching, peer delivery, nearby discovery assistance, profile/media transfer, and eventually message/media transport.

## Revised MVP Architecture

The revised MVP has three conceptual layers:

```text
Web Client / Browser Node
Authority Backend
Fallback Backend
```

The web client is not just UI. It is a temporary app node while open. It renders the product, handles location, caches nearby profile/media data, opens WebRTC peer sessions, exchanges signed public profile envelopes, transfers content-addressed blobs, and attempts peer-to-peer delivery.

The authority backend owns identity, login, profile permissions, blocks, reports, geocell membership, capability issuance, abuse controls, and reconciliation.

The fallback backend handles offline users, failed peer connections, NAT/TURN failure, moderation holds, stale data, recovery, and server mailbox delivery when peer delivery fails.

The important MVP loop is:

1. User opens Link-Up.
2. Backend authenticates the user.
3. Backend assigns a signed, expiring geocell capability.
4. Backend returns a small seed set of nearby authorized peers and minimal metadata.
5. Browser connects to nearby peers over WebRTC.
6. Nearby clients exchange signed, audience-limited profile cards and cached photo blobs.
7. Backend remains authoritative for validity, visibility, blocks, expiry, and revocation.
8. Messaging attempts peer-to-peer first.
9. Failed peer delivery falls back to server mailbox delivery.

## Core Project Outline

```text
linkup/
  apps/
    web/
    api/
    rendezvous/
    worker/
    admin/
  packages/
    shared/
    client-node/
    crypto/
  db/
    migrations/
    seeds/
  infra/
    local/
    deploy/
  docs/
    design.md
    cost-model.md
    p2p-mvp.md
```

## apps/web

The user-facing htmx web app.

```text
apps/web/
  src/
    pages/
      login/
      onboarding/
      nearby/
      profile/
      chat/
      settings/
    fragments/
      profile-card/
      nearby-grid/
      chat-message/
      error-box/
    public/
      app.js
      p2p-node.js
      location.js
      cache.js
      htmx.js
    styles/
  package.json
```

Responsibilities:

- Render the user-facing product.
- Handle login, onboarding, nearby grid, profile pages, chat, and settings.
- Ask for location.
- Start the browser-side node runtime.
- Participate in local caching, peer profile exchange, peer media/blob transfer, and peer message delivery when possible.

## packages/client-node

The browser-side runtime that proves the low-cost/server-light thesis.

```text
packages/client-node/
  src/
    node.js
    peer-session.js
    peer-discovery.js
    profile-envelope-cache.js
    blob-cache.js
    message-delivery.js
    capability-store.js
    metrics.js
```

Responsibilities:

- Manage the active browser as a temporary Link-Up node.
- Store signed geocell capabilities.
- Connect to nearby peers through rendezvous signaling.
- Exchange signed profile envelopes.
- Share cached profile/media blobs.
- Attempt peer-to-peer message delivery.
- Report bandwidth/cost-saving metrics back to the backend.

This is one of the most important MVP components because it proves users can be part of the app’s running engine.

## apps/api

The authority backend.

```text
apps/api/
  src/
    main.js
    routes/
      auth.js
      profiles.js
      location.js
      discovery.js
      capabilities.js
      blocks.js
      reports.js
      conversations.js
      messages.js
      metrics.js
    services/
      auth-service.js
      profile-service.js
      geocell-service.js
      capability-service.js
      permission-service.js
      moderation-service.js
      reconciliation-service.js
    db/
      client.js
```

Responsibilities:

- Own truth.
- Handle accounts and sessions.
- Own profile visibility and permission checks.
- Enforce block rules.
- Handle reports and moderation state.
- Assign geocells.
- Issue capabilities.
- Sign public profile envelopes.
- Provide message fallback.
- Reconcile peer-floated state.

The API should authorize, validate, reconcile, and provide fallback. It should not do all app work when active clients can safely handle some of it.

## apps/rendezvous

The WebRTC signaling service.

```text
apps/rendezvous/
  src/
    main.js
    routes/
      signal.js
    services/
      peer-registry.js
      geocell-room.js
      signaling-service.js
      turn-policy.js
```

Responsibilities:

- Let authorized clients join geocell rooms.
- Return a small number of nearby peer candidates.
- Exchange WebRTC offers, answers, and ICE candidates.
- Apply TURN policy where needed.

It should not decide truth. It does not own profile visibility, block status, or messaging permission. It should ask or verify against the authority backend.

For MVP implementation, this may physically live inside `apps/api`, but it should remain conceptually separate.

## apps/worker

Background jobs.

```text
apps/worker/
  src/
    main.js
    jobs/
      expire-locations.js
      expire-capabilities.js
      recompute-geocells.js
      cleanup-stale-peer-sessions.js
      reconcile-messages.js
      moderation-notifications.js
      metrics-rollup.js
```

Responsibilities:

- Expire stale location records.
- Expire old capabilities.
- Recompute geocell density data.
- Clean stale peer sessions.
- Reconcile failed peer message delivery.
- Trigger moderation notifications.
- Roll up cost and peer-work metrics.

## apps/admin

Minimal moderation and operational UI.

```text
apps/admin/
  src/
    pages/
      reports/
      users/
      profiles/
      metrics/
    actions/
      suspend-user.js
      hide-profile.js
      resolve-report.js
```

Responsibilities:

- Review reports.
- Hide profiles.
- Suspend users.
- Inspect abuse cases.
- View peer-runtime and cost-saving metrics.

The metrics page is part of the MVP because the MVP is partly a cost thesis.

Important metrics include:

- Backend bandwidth avoided.
- Peer-delivered blobs.
- Peer-delivered messages.
- Fallback rate.
- TURN usage.
- Active peers per geocell.
- Backend cost per active user.

## packages/shared

Shared constants, JSDoc types, API shapes, and validation helpers.

```text
packages/shared/
  src/
    types.js
    constants.js
    api-shapes.js
    validation.js
    geocell.js
    errors.js
```

Good shared types include:

```text
UserId
ProfileId
GeocellId
CapabilityGrant
PublicProfileEnvelope
ContentBlob
PeerSession
MessageEnvelope
DeliveryReceipt
```

## packages/crypto

Small crypto/signature utilities.

```text
packages/crypto/
  src/
    signing.js
    verify.js
    hashes.js
    envelope.js
    capability.js
```

Responsibilities:

- Sign public profile envelopes.
- Verify signed envelopes.
- Hash blobs.
- Verify blob integrity.
- Validate expiring capabilities.

For MVP, the server can sign most things. A full user-owned key model can come later.

## db

Postgres migrations and seeds.

```text
db/
  migrations/
    001_users.sql
    002_profiles.sql
    003_locations_geocells.sql
    004_capabilities.sql
    005_profile_envelopes.sql
    006_blobs.sql
    007_peer_sessions.sql
    008_conversations_messages.sql
    009_blocks_reports.sql
    010_metrics.sql
  seeds/
    dev-users.sql
    dev-geocells.sql
```

Core tables:

```text
users
sessions
profiles
profile_photos
public_profile_envelopes
content_blobs
locations
geocells
geocell_memberships
capability_grants
peer_sessions
conversations
conversation_members
messages
message_delivery_attempts
blocks
reports
moderation_actions
node_metrics
cost_metrics
```

The most important MVP tables are:

```text
public_profile_envelopes
content_blobs
capability_grants
peer_sessions
node_metrics
```

These are the tables that prove the app is not merely centralized.

## infra

Keep infrastructure boring.

```text
infra/
  local/
    docker-compose.yml
  deploy/
    api.service
    rendezvous.service
    worker.service
    caddy.conf
```

Minimum services:

- Postgres.
- Object storage, probably S3-compatible storage or MinIO locally.
- API service.
- Rendezvous service.
- Worker service.
- Caddy or nginx.

Redis may be useful later, but should be skipped until clearly needed.

## docs

```text
docs/
  design.md
  p2p-mvp.md
  data-model.md
  threat-model.md
  cost-model.md
  moderation.md
```

`design.md` explains how the app fits together.

`p2p-mvp.md` defines what browsers are allowed to carry, cache, and deliver.

`cost-model.md` defines the proof target.

A good proof statement:

```text
The MVP is successful if active browser nodes can handle a meaningful percentage of nearby profile/card/blob/message delivery while the backend remains authoritative and abuse-safe.
```

## Critical MVP Object

The most important object is the signed public profile envelope.

It should contain:

- Profile fields safe to share.
- Content hashes for photos.
- Visibility scope.
- Owner or server signature.
- Expiry.
- Version.
- Audience/geocell constraints.

Clients may carry it, cache it, and share it with authorized nearby peers. Clients may not modify it or decide who is allowed to see it.

## MVP Success Path

The practical first milestone is:

1. User signs up.
2. User creates a profile.
3. Backend signs the public profile envelope.
4. User enters a geocell.
5. Browser receives a geocell capability.
6. Browser connects to peers through rendezvous.
7. Nearby profiles load partly from backend and partly from peer cache.
8. Photos/blobs fetch by content hash.
9. Messages try P2P first.
10. Failed messages fall back to backend.
11. Admin can block/report/suspend.
12. Metrics show how much work avoided the backend.

## Final Architectural Position

The MVP should not be a conventional centralized dating app. It should test whether a web app can safely shift runtime work onto active users while keeping users protected and backend costs low.

The backend remains authoritative. Users do not become the product. Active users become part of the runtime substrate.

The concise architecture is:

```text
Centralize truth.
Distribute carrying, caching, and delivery.
Measure whether that actually lowers cost.
```
