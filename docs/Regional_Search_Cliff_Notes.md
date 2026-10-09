# Regional Distributed Search — Cliff Notes

Date: October 9, 2026

## Core objective

Build decentralized profile discovery for a gay dating app, optimized for locality and mobile responsiveness. **Fast results take priority over fresh results.** A master backup exists elsewhere, so backup and authoritative recovery are outside the present design discussion. Media is handled separately, with references retained in profiles.

## Documents, indexes, and storage

- A document represents a profile’s fields and values. It can contain the complete profile object.
- An inverted index maps terms to matching document IDs; one index covers many documents, rather than one inverted index per profile.
- A search engine that retains retrievable documents can also serve as their data store. A separate profile database is not inherently required on each node.
- Stored documents, text indexes, geographic indexes, and sorting structures serve different purposes but can coexist in the same engine.
- Benefits include one local query interface, direct return of profile data, and avoiding synchronization between a separate document database and search engine.
- Costs include index memory/storage, update processing, and engine-specific limitations around transactions, constraints, and non-search queries. These were discussed, not established as blockers.

## Access and encryption

- Nodes search only profiles they are authorized to read.
- Profiles can be encrypted during transfer and storage, then decrypted locally for indexing or searching.
- Searching data that remains unreadable to the node is not required; specialized searchable encryption is therefore outside scope.
- A readable index can reveal profile information. A shared snapshot must contain only information its recipients are authorized to access.
- Revoking access cannot guarantee removal of data a recipient has already decrypted.

## Geographic model and regional partitioning

- Use **H3** for hierarchical geocells.
- Profiles are assigned to fine-grained cells; coarser ancestors or sets of cells identify regional partitions.
- The discussion’s child depths 4 and 1 were illustrative, not finalized H3 resolution choices.
- Distance means **distance from the viewer’s cell center to the profile’s cell center**. Profiles in the same cell tie on distance and need a secondary ordering rule.
- Geographic partitioning happens before local searching: a San Francisco search should not involve Atlanta’s profile data or indexes.
- City-centered regions are preferred candidates for shared index distribution. Examples proposed: Atlanta and surrounding communities within 25 miles; San Francisco and surrounding communities within 15 miles. These are illustrative boundaries.
- A city-centered region may comprise many H3 cells; it need not equal one H3 parent.
- Search from the viewer’s own cell center, even when a shared snapshot is centered on a city.
- Neighboring regions may be needed near boundaries. Overlapping regions require deduplication by profile ID.
- H3 ancestry is logically exact, while geographic containment across resolutions is approximate.
- Actual profile count, snapshot size, and mobile resource usage can inform regional sizing. The physical location of storage devices was not considered a central issue at this stage.

## Distribution and routing

- Local search libraries do not themselves determine which peers hold documents or how regional requests reach them.
- A locality-aware DHT or geographic overlay is a candidate for regional placement and routing. No implementation was selected.
- An ordinary DHT can also act as a directory: **regional H3 cell → peers serving that region**. Directory placement may be non-geographic while profile placement remains regional.
- Conventional Kademlia uses distance between hashed keys, not physical distance. Hashing H3 IDs does not preserve their geographic relationships.
- H3 determines relevant cells/regions; routing locates their providers; authorized data or indexes are delivered to nodes for local search.
- Server-cluster shard routing, geographic indexing, and peer-to-peer regional routing are distinct capabilities.

## Fast local search

- Search locally available regional data immediately; refresh it in the background.
- Missing regional coverage can be fetched asynchronously rather than blocking available results.
- Prefetching neighboring regions was suggested to reduce waiting during movement or radius expansion.
- Benefits include smaller transfers, smaller indexes, fewer peers involved per search, and no network round trip for data already held locally.
- Fast responses and fresh profile/location data are separate concerns; the explicit priority is speed.

## Shared regional indexes

- **Every node should not independently rebuild substantially the same regional index.** The user identified this as duplicated processing, especially on phones.
- Local search execution requires a local usable index, not necessarily local construction of that index.
- Preferred direction: a regional builder creates and maintains a shared index; peers distribute it; phones load their copy and search locally.
- Initial snapshots provide a starting point. Subsequent changes should update the existing index efficiently.
- Downloading and loading a prebuilt index still costs bandwidth, memory, and deserialization time, but avoids repeating full document indexing.
- Smaller transferable segments or deltas may reduce update costs and overlap duplication, **provided the selected engine supports them**. This support has not been established.

## Builder selection and continuity

- Maintain a pool of **up to ten qualified builders per region**.
- Favor sustained uptime, stable connectivity, spare CPU/memory, external power, unmetered networking, possession of regional data, and demonstrated successful builds.
- The goal is maximum useful contribution with minimum disruption and resource burden.
- Round-robin handoff was considered, then refined: **rotation is not mandatory**.
- A powerful, reliable super node may remain the active builder indefinitely. Other eligible nodes provide standby capacity and failover.
- Keep assignments stable; avoid switching for small, temporary ranking changes.
- Successors should load the existing index and continue from its recorded update position rather than start over.
- Peers can distribute finished snapshots independently of the builder, so index production need not bear all download traffic.
- Builder election, failover coordination, trust/verification, and handoff protocols remain unspecified.

## Index lifecycle and software versions

- Index format and indexing rules are tied to software versions and do not change independently of them.
- The intended lifecycle is an initial full build for the relevant software/index version, followed by incremental maintenance.
- Builder handoff continues the existing compatible index state.
- A software release that preserves index compatibility need not inherently force a rebuild; incompatible format or rule changes require a version transition.
- **Local incremental updates are not the same as transferable index deltas.** Efficiently distributing changes without making every phone re-index documents is an essential selection requirement.

## Libraries and engines discussed

The initial shortlist evaluated local geographic/text search and document storage. It predates the shared-index requirement and is **not a final selection**. The research was a broad documentation/repository review, not an exhaustive inventory or a measured benchmark.

| Candidate | Initial assessment | Remaining concern for the evolved design |
| --- | --- | --- |
| Orama JS | Best initial integrated browser candidate: documents, typed filters, text search, geographic radius/polygon filtering. | Distance ordering was identified as separate from filtering; shared incremental index delivery still needs verification. |
| MiniSearch + KDBush/geokdbush | Text search and retained fields plus a dedicated geographic nearest-neighbor index. | Integration and distribution of both indexes; KDBush is static. |
| FlexSearch + geographic index | Document store, workers, and persistent adapters including IndexedDB. | Geographic component and transferable index updates need validation. |
| search-index + geographic index | Persistent browser/Node search with retained raw documents. | No verified native geographic search or regional index-delta distribution. |
| Typesense | Server engine with document storage and geographic filtering/sorting. | Not an embedded browser engine; documented cluster replication does not implement the desired geographic P2P placement. |
| Meilisearch | Server engine with stored documents and geosearch. | Requires an engine process; regional P2P distribution is separate. |
| Solr / Lucene, Elasticsearch, OpenSearch | Stored fields/documents, geographic search, and—in server products—cluster routing capabilities. | Deployment and managed-cluster model differ from browser peers. |
| Bleve | Native embedded text/numeric/geographic library. | Go rather than a browser JavaScript engine. |
| SQLite WASM + FTS5 + R-tree | Possible browser storage/search alternative. | Additional geographic logic and shared-index design work. |
| Fuse.js, uFuzzy, fuzzysort | Text-matching components. | Not integrated geographic document engines. |
| Pagefind / Lunr | Static-index-oriented search. | Poor fit for continuously changing profiles without a suitable update/distribution strategy. |

One optional optimization discussed: spatially index distinct cell centers rather than repeating the same coordinates for every profile, with a separate cell-to-profile membership mapping. This remains a proposed approach, not a decision.

## Open decisions

1. Which engine supports efficiently loading shared regional indexes and applying distributable updates?
2. What regional boundaries, H3 resolutions, overlap rules, and size limits should be used?
3. What routing/DHT implementation should discover regional peers and distribute indexes?
4. How are builder eligibility, assignment, failure detection, and trusted publication coordinated?
5. How are snapshot versions, update positions, interrupted transfers, and software-version transitions represented?
6. How are recipient permissions reconciled with a shared regional snapshot?
7. What are the measured startup, memory, nearest-first query, and update costs on target phones?

## Selected references discussed

- [H3 hierarchy](https://h3geo.org/docs/api/hierarchy/)
- [H3 indexing and containment](https://h3geo.org/docs/highlights/indexing/)
- [Orama](https://github.com/oramasearch/orama)
- [MiniSearch](https://github.com/lucaong/minisearch)
- [FlexSearch](https://github.com/nextapps-de/flexsearch)
- [search-index](https://github.com/fergiemcdowall/search-index)
- [KDBush](https://github.com/mourner/kdbush)
- [geokdbush](https://github.com/mourner/geokdbush)
- [libp2p Kademlia specification](https://github.com/libp2p/specs/blob/master/kad-dht/README.md)
