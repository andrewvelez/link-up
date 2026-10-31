# Network and Search Decisions

Updated: October 30, 2026.

This document consolidates [Network Requirements.md](archived/Network%20Requirements.md), [regional-search-recap.md](regional-search-recap.md), and the subsequent library evaluation. It distinguishes requirements, preferred directions, proposals, and unresolved choices. It does not describe completed implementation.

## Product and Operating Constraints

Link-up is intended to compete with Sniffies across its functionality over time. Version 1 focuses on geographic discovery, searchable profile information, and rudimentary messaging.

The application is a browser-only, local-first PWA intended to run from cached assets. Essential application logic and authoritative user data remain on the user's device. design.md selects Dexie over IndexedDB for local application storage.

Link-up targets $0 ongoing operating costs at launch, with any later costs small enough for limited ad revenue to cover. Limited ad spots are the only planned revenue source, but ad delivery is deferred.

Eliminating every server is not required. A server backup, shared connection infrastructure, and central application distribution are acceptable. Their costs must fit the operating constraint, and remote systems must not replace local data authority.

## Discovery and Profile Data

Discovery uses a local-first P2P database with a server backup. Each node holds only the minimum geographic scope and user data needed for its discovery needs.

| Data level | Contents and source |
| --- | --- |
| Geographic discovery data | Minimal information needed to discover relevant users, potentially only a network identifier within a geographic index |
| Search-index profile data | Profile information needed to display and filter search results, supplied by the P2P search index |
| Detailed profile data | Retrieved directly from the profile owner's node |

Discovery and search-index data replicate only across the geographic scope needed by each node. Detailed profiles remain on their owners' nodes. Behavior when an owner's node is unavailable remains undecided.

The P2P search system must supply presence, permitted location information, indexed profile information, and changes or withdrawals affecting those records. The database, indexing, distribution, and application responsibilities still need to be assigned to libraries.

Only information intended for the recipient may enter a distributed document or index. Omitting a field from searchable indexes does not establish that the underlying document will not replicate.

User-owned data must remain encrypted as required by design.md. Authorized local searching may operate on decrypted data. Shared indexes can reveal information about the records they describe and require corresponding access controls. Withdrawal cannot guarantee erasure of copies independently retained by recipients.

## Geographic Scope and Local Search

H3 is the existing geographic indexing direction. The network should narrow the dataset to relevant regions before local searching.

Geographic routing and local geographic filtering are separate responsibilities. A directory could map an H3 region to peers serving it. An ordinary Kademlia DHT does not preserve geographic proximity merely because H3 identifiers are used as keys.

Nodes may need neighboring regions near boundaries. Geographic replication scope must adapt to movement or changing search needs without requiring a global copy of discovery records.

The earlier search discussion prioritized fast local results over immediate freshness. Search should use available regional data while updates and missing regions arrive in the background.

The earlier geographic query model measured distance between the viewer's geocell center and profile geocell centers. Profiles in the same cell would need a secondary ordering rule. Geographic radius filtering and nearest-first ordering remain distinct capabilities.

Location disclosure must respect the user's selected precision. design.md describes city-level and precise-location modes; the discovery/index schema must not expose greater precision than the user permits.

Exact regions, H3 resolutions, search radius behavior, record fields, and expiry rules remain undecided. Earlier city-centered region examples were illustrative, not fixed boundaries.

## Shared Regional Indexes

The earlier design separates index construction from search execution:

1. A regional builder constructs and maintains a searchable index.
2. Peers distribute compatible saved copies.
3. Phones load those copies and search locally.
4. Updates arrive without blocking searches against the available copy.

The purpose is to avoid every phone independently constructing substantially the same regional index. Loading an index still consumes bandwidth, memory, and processing time.

Smaller regional segments could reduce transfer size. Overlapping segments require deduplication by profile identifier. Segment composition and merging remain unverified.

Earlier builder proposals favored stable nodes with sustained uptime, spare resources, external power, unmetered networking, and regional data. One active builder with standbys was proposed; a pool of up to ten was illustrative. Mandatory rotation was not considered necessary.

The intended lifecycle is an initial full build followed by incremental updates. A successor builder should continue from a compatible index and recorded update position. Index-format compatibility and indexing rules must be handled across software versions.

Builder selection, verification, failover, handoff, and transferable index updates remain unresolved. These earlier proposals must be reconciled with the current minimum-geographic-scope requirement.

## Orama Search Direction

Orama is the current preferred local search candidate. The earlier recap explicitly left final selection open pending shared-index validation.

The embedded JavaScript library supports browser execution, retained documents, full-text search, typed fields, structured filters, and geographic search. Its open-source library is Apache-2.0 licensed and does not require the hosted Orama service for local search.

Orama can serve as the searchable store for distributed profile summaries. A separate database should be added only for responsibilities that Orama and the distribution layer do not provide.

Orama's save/load implementation includes documents, indexes, internal document identifiers, sorting state, pinning state, and language. This provides a foundation for complete regional snapshots; application-level compatibility and persistence handling still need validation.

Three capabilities must be distinguished:

- Loading a complete prebuilt index.
- Updating local documents and rebuilding their affected index entries.
- Applying transferred index changes without re-indexing changed documents locally.

Save/load support is verified in source. Efficient transferable index deltas have not been verified. Nearest-first behavior, snapshot loading costs, memory use, and performance on representative phones remain unmeasured.

Orama does not by itself supply the regional P2P distribution, replication coordination, or owner-node profile retrieval required by the application.

Sources: [Orama repository](https://github.com/oramasearch/orama), [serialization implementation](https://github.com/oramasearch/orama/blob/main/packages/orama/src/methods/serialization.ts).

## Networking and Database Candidates

No peer transport or P2P database has been selected. Library assessments below are based on documentation and source review, not integration tests or benchmarks.

JavaScript libp2p remains the leading networking candidate. Its peer identities, secure connections, discovery mechanisms, publish/subscribe messaging, and browser WebRTC support could supply reusable network functions.

Direct WebRTC remains an alternative if a selected database already supplies sufficient replication and connection handling. Signaling and relay infrastructure still require an explicit deployment and cost plan.

Iroh's current browser implementation relays all connections, increasing dependence on relay capacity. Pear requires an installed runtime and does not meet the browser-only requirement.

| Candidate | Documented strengths | Remaining questions for Link-up |
| --- | --- | --- |
| Peerbit | Built on libp2p; browser WebRTC; searchable distributed documents; sharding and configurable replication ranges | Mapping replication to geographic scope, browser resource use, and whether it can distribute Orama artifacts without redundant indexing |
| RxDB | Browser-local structured queries; free Dexie storage adapter; WebRTC replication and backend synchronization | Geographic document scoping through the P2P plugin, paid-feature dependencies, and duplication of Orama's search responsibilities |
| OrbitDB | Browser/Node support; eventual consistency; libp2p synchronization through Helia/IPFS | Geographic partitioning and efficient search need additional design; basic document queries iterate records |

Peerbit is the first replication candidate to investigate, with RxDB as a comparison and OrbitDB as another option. Restoring Orama to the architecture reduces the importance of their built-in search features.

Peerbit's query authorization does not by itself establish confidentiality against replication or direct block access.

RxDB's geographic partial-sync documentation primarily describes scoped server replication. Equivalent document-level geographic scoping through its standard WebRTC plugin has not been verified. A shared topic selects peers, not necessarily a subset of their documents.

RxDB currently lists a free limit of 13 open collections, with full-text search and WebCrypto encryption among paid features. Its free structured querying and Dexie adapter remain relevant, but regional partitioning must account for the collection limit.

A persistent server peer is a possible way to retain replicated data. Backup coverage, recovery, retention, and operational cost remain application decisions.

Sources: [libp2p browser connectivity](https://docs.libp2p.io/guides/webrtc-browser-connectivity/), [Peerbit](https://github.com/dao-xyz/peerbit), [Peerbit document store](https://github.com/dao-xyz/peerbit/tree/master/packages/programs/data/document/document), [RxDB WebRTC](https://rxdb.info/replication-webrtc.html), [RxDB partial sync](https://rxdb.info/partial-sync.html), [RxDB licensing/features](https://rxdb.info/premium/), [OrbitDB](https://github.com/orbitdb/orbitdb), [Iroh browser limitations](https://docs.iroh.computer/languages/wasm-browser).

## Messaging and Supporting Capabilities

Version 1 requires rudimentary messaging with eventual consistency. Useful library-provided features are welcome, but most additional messaging functionality can wait until version 2.

design.md currently selects Converse/XMPP and local message history. That selection has not been replaced. Its relationship to the P2P layer, encryption, and delivery infrastructure remains unresolved.

Eventual consistency does not decide whether messages remain on the sender's device until reconnection or are retained by another node/server for later delivery.

The following supporting capabilities are likely necessary and remain in scope for evaluation:

- Automatic connection establishment, including signaling and NAT traversal where needed.
- Relay support when direct connections fail.
- Blocking across relevant interactions.
- Reporting and moderation.
- Abuse prevention and resource limits.

Direct connections versus relay-only operation remains a privacy and cost decision. Persistent identity and initial network-entry mechanisms were proposed but have not been explicitly affirmed.

## Excluded and Deferred Features

| Feature | Status |
| --- | --- |
| Anonymous or guest entry | Excluded |
| Read receipts and typing indicators | Explicitly excluded |
| Remote-region browsing or travel mode | Deferred |
| Advanced message delivery, background notifications, attachments, and structured sharing | Not individually committed launch requirements |
| Groups, events, and group messaging | Deferred |
| Regional public posts | Deferred |
| Shared place listings, check-ins, and activity counts | Deferred |
| Live audio/video | Deferred |
| Device linking and identity recovery | Deferred |
| Ad delivery and measurement | Deferred |

## Application Distribution

Application downloads must come from a central server, with download integrity as a requirement. Caching supports subsequent local operation.

Central hosting alone does not specify the integrity-verification mechanism. Distribution, update, verification, and recovery arrangements remain undecided.

## Next Validation Work

- Define minimal discovery records and the separate indexed profile summary.
- Define geographic replication units and behavior when users cross boundaries.
- Verify Orama snapshot loading, nearest-first searching, persistence, and phone resource use.
- Establish whether shared index deltas can be applied without repeated document indexing.
- Determine whether a P2P database is needed alongside Orama or whether an artifact/update distribution layer is sufficient.
- Compare candidate replication layers against regional scoping, reconnect convergence, and owner-only detailed profile retrieval.
- Define expiration, withdrawal, deletion, conflict resolution, and version compatibility.
- Resolve builder coordination and server-backup behavior.
- Resolve rudimentary messaging and Converse/XMPP integration.
- Identify connection infrastructure whose limits and costs fit the operating budget.
