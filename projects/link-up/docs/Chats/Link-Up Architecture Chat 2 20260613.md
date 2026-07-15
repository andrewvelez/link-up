# Link-Up Architecture Chat 2 — 2026-06-13

## Context

LinkUp is a gay dating/social app intended to feel different from Grindr-style apps by keeping the core experience free, reducing hostile paywalls, and prioritizing real connection. Monetization should come from ancillary commerce, sponsorships, ads, events, and partnerships rather than restricting basic dating functionality.

The architecture is client-heavy and server-light, but not purely serverless. Servers or home authorities still handle identity, permissions, profile visibility, blocks, reports, abuse controls, exact-location protection, capability issuance, paid feature state, durable reconciliation, and fallback. Clients should handle as much local computation, caching, profile rendering, and authorized peer communication as practical.

Location is the core primitive. LinkUp uses density-adaptive geocells as social proximity units rather than fixed map tiles. Dense areas should use smaller geocells; rural areas should use larger ones. Discovery expands outward from the current geocell to adjacent geocells, then neighborhood, city, and metro.

Locality-centered design applies throughout discovery, rendezvous, caching, replicated storage, bandwidth sharing, abuse detection, routing hints, backup placement, and recovery. The storage rule is: **global addressability, local availability**.

Data is split into public, private, and internal categories. Public data means user-approved and shareable subject to audience rules, not globally visible. Private data means user-owned data the app may use but should not expose to other users. Internal data means operational/system state, split between static reference data like geodata and dynamic operational state like rendezvous, logs, moderation queues, replication cursors, and reconciliation state.

For storage, LinkUp may use an IPFS-like content-addressed replicated layer, but locality-aware rather than globally uniform. Static internal data is suitable for signed manifests and content hashes. Dynamic data should use append-only logs, signed checkpoints, replicated backups, and authoritative reconciliation. Nodes may carry, cache, relay, or restore data, but they do not define truth.

For transport, WebRTC/RTCDataChannel is the practical peer transport for authorized app data and media, with signaling over WebSocket, HTTPS, XMPP, or Matrix as needed. TURN-only relay can be used for privacy-sensitive modes. WebRTC should not be used as unrestricted broadcast. Peer-floated state should use signed, scoped, expiring, audience-encrypted envelopes/capabilities and append-only signed events. Truth comes from signatures, capabilities, expiry, audience encryption, and reconciliation.

## New Constraint Discussed

The new architectural constraint is that all transferred data will be encrypted, and a user's profile will only be publicly visible while the user chooses for it to be visible, defaulting to when they are actively using the app.

When the user is not using the app, their profile should not appear on the network. This means profiles do not need to be part of ephemeral distributed storage, and other nodes do not need to pass around anyone else's profile data.

The model is closer to a Craigslist-style ad that is only visible while the user is online.

The exception is explicit profile saving. Another user may request permission to save a profile, and the profile owner must approve that request. Once approved, the requesting user may cache that profile on their own side.

## Legal and Risk Analysis

This constraint meaningfully reduces risk.

The main benefit is that LinkUp avoids becoming a general-purpose distributed profile-hosting network. If profiles are only discoverable while the user is online, and random third-party nodes do not relay or cache them, the app reduces breach risk, scraping risk, moderation scope, data retention problems, and ambiguity over who is responsible for stored copies.

However, this does not eliminate legal risk. It changes the shape of the risk.

Encryption does not make the service legally invisible. If LinkUp operates identity, discovery, signaling, moderation, reports, paid state, blocks, or abuse systems, then LinkUp is still operating a user-to-user service. Metadata, location-derived presence, profile visibility, complaints, saved-profile grants, and abuse reports can all become legally relevant or regulated data, even when message or profile contents are encrypted.

The Craigslist analogy is useful but limited. A live profile is still user-generated content distributed through the service while it is visible. It is more temporary, less cached, and more user-controlled, but it is still publication to other users.

The explicit profile-saving request is a strong design choice. It should be treated as a first-class capability: scoped, expiring, revocable, signed, and auditable.

Revocation should be framed honestly. The app can stop future access, future syncing, or future updates, but it cannot make another user forget what they saw, delete screenshots, or delete exported data outside the app.

## Where the Constraint Helps Most

The design supports data minimization. LinkUp is not collecting or retaining more profile data than needed for active use.

It reduces hosting liability surface. If peers are not storing strangers' profiles and the server is not maintaining a searchable profile archive, there is less user content sitting around to moderate, breach, subpoena, or accidentally expose.

It makes encryption more credible. If profile transfer is encrypted, profile saving is consent-gated, and profile availability is tied to live presence, the architecture is easier to defend as privacy-by-design rather than as a large centralized gay-location/profile database.

## Where the Constraint Does Not Fully Solve the Problem

LinkUp still needs abuse reporting, blocking, moderation, and law-enforcement response paths.

LinkUp still needs jurisdiction-specific online-safety compliance depending on where it operates.

LinkUp still has sensitive-data risk because a gay dating app with proximity discovery inherently processes sensitive inferences, including sexual orientation, social graph, location patterns, and possibly sexual or health-related information depending on profile and chat content.

Exact-location protection, anti-scraping controls, rate limits, fake-user detection, metadata minimization, consent handling, and abuse controls remain necessary.

## Practical Architectural Rule

The stronger design rule is:

> Profiles are live presence objects, not replicated content.

Saved profiles should be explicit user-to-user grants, not network storage.

Other peers may help route sessions, but they should not carry stranger profiles.

Servers or home authorities should retain only the minimum durable state needed for identity, consent, safety, abuse handling, and reconciliation.

## Competitive Positioning

It is likely that many dating apps satisfy the visible checklist version of compliance: privacy policy, consent screens, report/block tools, data deletion flow, safety language, and basic moderation.

That is not the same as designing the system around the privacy threat model of a queer proximity app.

Many companies treat compliance as a way to avoid major liability rather than as a full product architecture. LinkUp can differentiate by making privacy part of the architecture itself rather than something bolted on afterward.

The suggested positioning is not: other apps are probably loose, so LinkUp can be loose too.

The better positioning is:

> Most dating apps bolt privacy onto a surveillance-heavy product model. LinkUp makes privacy part of the product architecture itself.

A concise product/legal story for LinkUp is:

> LinkUp collects less, stores less, replicates less, exposes less, and makes sharing explicit.

That gives LinkUp a cleaner legal story, a safer technical design, and a stronger product identity than most dating apps.
