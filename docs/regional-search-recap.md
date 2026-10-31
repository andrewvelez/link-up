# Regional Distributed Search — Recap

Date: October 9, 2026

## How search engines represent and store data

A **document** holds the fields and values supplied to the engine. It can contain the complete data object. The engine builds an **inverted index** that maps terms to matching document IDs; one index covers many documents.

For example, these documents:

```json
[
  { "id": 1, "text": "red bicycle" },
  { "id": 2, "text": "blue bicycle" },
  { "id": 3, "text": "red car" }
]
```

produce an index conceptually like this:

```json
{
  "red": [1, 3],
  "blue": [2],
  "bicycle": [1, 2],
  "car": [3]
}
```

Searching for “red bicycle” finds the ID shared by both lists: `1`. Actual engines may use compact binary formats and include word positions or frequencies.

Documents and indexes can be held in memory or saved to persistent storage. Making a field searchable does not necessarily preserve its original value for retrieval.

## Using the search engine as a data store

If the engine retains the documents as well as the index, and can retrieve them, it can also serve as a data store. One system can store and search complete profiles, avoiding a separate database and synchronization between the two. The tradeoffs are memory and storage use, index maintenance when data changes, and engine-specific limits on transactions, constraints, and other queries. Keeping documents in memory does not by itself preserve them across restarts. With a master backup assumed elsewhere, recovery was outside scope. This left each node able to use the engine as a local searchable store, with a separate layer still needed to distribute data between nodes.

## Applying that model to profiles and encryption

For the gay dating app, a document could contain a profile’s fields and values. Media would be stored separately, with references in the profile. Nodes would receive only profiles they were authorized to read and decrypt them locally for searching. The engine would not need to search data that remained encrypted and unreadable to it. An index can reveal information about the profiles it describes, so access permissions also apply to indexes shared with other nodes. Revoking access cannot guarantee removal of data already decrypted by a recipient.

## Adding geographic search to the library requirements

The main query would be distance from the viewer’s geocell center to each profile’s geocell center. Profiles in the same cell would tie and need a secondary ordering rule. A text index alone would not provide the required nearest-profile search.

The initial library review therefore considered document storage, profile filters, text search, and geographic search. Orama was the leading integrated browser candidate; MiniSearch paired with a geographic index was the main alternative. Geographic filtering and nearest-first ordering still needed to be distinguished.

At this stage, the evaluation concerned searching data available on a node. It had not yet established how data or indexes would be distributed among nodes.

## Limiting distribution and searches to relevant regions

The browser libraries reviewed did not handle geographic peer placement or routing. That required a separate distributed layer; server-cluster routing was also a distinct capability.

H3 cells could group profiles into regional datasets before local searching. A San Francisco search would not need Atlanta’s profiles or indexes. This would reduce the data transferred, stored, and searched on a phone. The example child depths were not finalized resolutions, and the physical location of storage devices was not central to this model.

A locality-aware distributed hash table (DHT) could support regional placement and routing. Alternatively, an ordinary DHT could act as a directory: **regional H3 cell → peers serving that region**. Conventional Kademlia uses hashed-key distance, so hashing H3 IDs does not preserve geography. No routing implementation was selected.

Searches near boundaries might need neighboring regions. H3 parent relationships are exact in the hierarchy, but geographic containment across resolutions is approximate.

## Keeping an index locally for fast responses

**Fast results took priority over fresh results.** Searching a locally available regional index would avoid a network round trip for each search. Updates and missing regions could be fetched in the background without blocking results from data already present. Prefetching neighboring regions could reduce waiting during movement or radius expansion.

The initial approach was for each node to maintain an index of its relevant regional profiles. This supported local searching, but left the cost of constructing similar indexes on many devices unresolved.

## Sharing prebuilt indexes to avoid repeated work

Nearby nodes would hold many of the same profiles. Having every phone independently index those profiles would repeat substantial processing, even if done in the background.

The revised approach separated **local search execution** from **index construction**. A regional builder would create and maintain the index, peers would distribute saved copies (snapshots), and phones would load and search their copies.

Loading a snapshot still costs bandwidth, memory, and processing time. Smaller index segments or transferable changes (deltas) could reduce transfer costs if supported by the engine. Shared snapshots must also contain only information their recipients are authorized to read.

## Defining regions for shared snapshots

City-centered regions were proposed as shared distribution units: Atlanta and surrounding communities within 25 miles, or San Francisco and surrounding communities within 15 miles. These were illustrative boundaries. A region could contain many H3 cells rather than correspond to one H3 parent.

A shared city-centered snapshot would still be searched from the viewer’s own cell center. Profile count, snapshot size, and phone resource use could help determine region sizes.

Overlapping regions would require deduplication by profile ID. Smaller shared H3-based index segments might reduce overlap duplication, subject to engine support.

## Choosing stable builders instead of requiring rotation

Builders would be selected for sustained uptime, stable connectivity, spare CPU and memory, external power, unmetered networking, regional data, and successful builds. The aim was useful contribution with little disruption to the network. Other peers could serve downloads independently of the builder.

A pool of up to ten qualified builders per region would provide one active builder and standbys. Round-robin handoff was considered, but a powerful, reliable node could remain active indefinitely. Mandatory rotation was unnecessary when continued service better met the stability goal. Small, temporary ranking changes would not justify switching builders.

Election, failover coordination, trust/verification, and handoff protocols remained unspecified.

## Maintaining the index through updates and handoffs

The intended lifecycle was a full build for the relevant software/index version, followed by incremental updates. Index format and indexing-rule changes would be tied to software versions. A compatible software release would not necessarily require a rebuild.

A successor builder would load the existing compatible index and continue from its recorded update position. Handoff would preserve that work rather than restart it.

This added a requirement to the earlier library evaluation: **the engine must support distributing index changes efficiently, not just updating an index locally**. Local update support does not establish that phones can apply transferred index changes without re-indexing profiles. That capability remained unverified, so the initial shortlist was not a final selection.

## Library candidates from the initial review

This table records the earlier library review. It predates the shared-index requirement and is **not a final selection**. The research was a broad documentation/repository review, not an exhaustive inventory or a measured benchmark.

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
