# Network Requirements

This document summarizes the network requirements discussed for Link-up. It records accepted decisions, deferred features, and unresolved choices; it does not describe completed implementation. Related architecture is documented in [design.md](../design.md).

## Product and Operating Constraints

Link-up is intended to compete with Sniffies across its functionality over time. Version 1 has a narrower scope: geographic user discovery, searchable profile information, and rudimentary messaging.

The application is a browser-only, local-first PWA intended to run from cached application assets. Essential application logic and authoritative user data remain on the user's device.

Link-up targets $0 ongoing operating costs at launch, with any later costs small enough for limited ad revenue to cover. Limited ad spots are the only planned revenue source, but ad delivery is not required initially.

Eliminating every server is not a requirement. Shared connection infrastructure, a server backup, and central application distribution are acceptable within the cost and local-authority constraints.

## Discovery, Search, and Profile Data

Discovery uses a local-first P2P database with a server backup. The backup does not replace the user's authoritative local data.

Each node holds only the minimum geographic scope and user data needed for its discovery needs. Nodes are not required to replicate the entire global discovery database.

There are three levels of data:

| Level | Contents and source |
| --- | --- |
| Geographic discovery data | Minimal information needed to discover relevant users, potentially only a network identifier within a geographic index |
| Search-index profile data | Profile information needed to display and filter search results, supplied by the P2P search index |
| Detailed profile data | Retrieved from the profile owner's node itself |

Discovery and search-index data replicate across only the geographic scope needed by each node. Detailed profile information must come from its owner's node.

The P2P search system supplies presence, location disclosure, indexed profile information, and changes or withdrawals affecting those records. Its underlying database, replication, and indexing responsibilities remain to be assigned to specific libraries.

Location disclosure must respect the user's selected precision. Geographic indexing must not expose more precise information than the user permits.

The exact discovery fields, indexed profile fields, geographic region sizes, and replication rules remain undecided.

## Version 1 Messaging

Version 1 requires rudimentary messaging with eventual consistency. Most additional messaging features can wait until version 2. A library that supplies useful additional features is welcome.

Read receipts and typing indicators are explicitly excluded.

Advanced delivery behavior, background notifications, media transfer, and structured sharing are not individually committed launch requirements.

Eventual consistency does not yet specify whether messages remain queued on the sender's device or whether another node or server retains encrypted copies for later delivery. That delivery model remains unresolved.

design.md currently selects Converse/XMPP and local message history. This discussion has not replaced that selection. Its infrastructure, encryption, and integration with the P2P system remain unresolved. The existing requirement to keep user-owned data encrypted remains applicable.

## Supporting Network Capabilities

The following capabilities are considered likely necessary and remain in scope for evaluation:

- Automatic connection establishment, including signaling and NAT traversal where needed.
- Relay support when direct connections cannot be established.
- Blocking across relevant network interactions.
- Reporting and moderation.
- Abuse prevention and resource limits.

Direct connections versus relay-only operation remain an open privacy and cost decision.

## Central Application Distribution

Application downloads must come from a central server, with application download integrity as a requirement. Caching supports subsequent local operation.

The exact integrity-verification mechanism and delivery arrangements remain undecided.

## Excluded and Deferred Features

| Feature | Decision |
| --- | --- |
| Anonymous or guest entry | Excluded |
| Read receipts and typing indicators | Explicitly excluded |
| Browsing remote regions or travel mode | Deferred |
| Most messaging features beyond rudimentary eventual consistency | Can wait until version 2; useful library-provided features may be integrated |
| Groups and events | Deferred |
| Group messaging | Deferred |
| Regional public posts | Deferred |
| Shared place listings | Deferred |
| Place check-ins and activity counts | Deferred |
| Live audio/video | Deferred |
| Device linking and identity recovery | Deferred |
| Ad delivery and measurement | Deferred |

## Library and Transport Direction

No P2P database, search engine, or peer transport has been selected.

The discussion favors evaluating WebRTC directly or JavaScript libp2p over WebRTC. Direct browser connections could reduce dependence on relayed application traffic.

Iroh remains a possible alternative, but its browser implementation currently requires relays for all connections. Pear's installed runtime does not fit the browser-only requirement.

The database and search layer should be evaluated alongside its networking dependencies before committing to a transport.

## Outstanding Decisions

- Persistent identity and initial network-entry mechanisms were proposed but have not been explicitly affirmed.
- Select the P2P database and search libraries.
- Define discovery records, indexed profile fields, and geographic replication rules.
- Define synchronization, expiration, withdrawal, and conflict-resolution behavior.
- Define behavior when the owner of a detailed profile is unavailable.
- Resolve the minimum messaging delivery model and Converse/XMPP integration.
- Resolve direct-connection privacy and relay requirements.
- Identify infrastructure whose limits and costs fit the operating budget.
