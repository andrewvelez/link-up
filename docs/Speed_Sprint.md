# Speed Sprint

Implement these tasks in order. The prototype must demonstrate location,
profile discovery, and private messaging while keeping authoritative user data
on the device. This is a reduced scope derived from ROADMAP.md.

1. **Profiles — Establish identity and local storage.**
   Verify the existing authentication path and give each tester a stable
   identity. Store user-owned data encrypted locally through Dexie, isolated
   by account. This provides ownership and persistence for profiles and messages.

2. **Location — Locate the user.**
   Request browser location permission, calculate H3 membership, and resolve
   a locality using reference data limited to the test region. Start with
   city-level disclosure and keep exact coordinates private. Handle denied
   permission visibly. This supplies the origin for nearby discovery.

3. **Location — Keep discovery location current.**
   Refresh location while the app is active, update meaningful changes,
   and expire stale presence records. Use fixed thresholds for the prototype.
   This lets testers move without leaving misleading locations behind.

4. **Profiles — Create, edit, and publish a minimal profile.**
   Support a display name, one photo, and a short bio. Save locally and require
   explicit opt-in to search visibility. Define the limited search summary
   separately from private details; support withdrawing it. This gives discovery
   real user-controlled content.

5. **Search — Connect the test users.**
   Establish one working browser networking path with known peers and the
   necessary signaling or relay configuration. Authorize profile updates and
   keep private details on their owner's device. This enables actual exchange
   between devices without requiring a complete discovery network.

6. **Search — Deliver one shared regional index.**
   Use one fixed builder to create an Orama snapshot containing opted-in search
   summaries. Have phones load it and refresh with complete snapshots, including
   updates, withdrawals, and expired records. Measure transfer size, loading
   time, and memory. This tests the shared-index approach before adding deltas,
   builder elections, or failover.

7. **Search — Display nearby profiles.**
   Search the downloaded index locally with a radius and basic text matching.
   Order by approximate distance using disclosed locations, with profile ID
   breaking ties. Include neighboring cells within the test region and remove
   duplicates. Show empty results and stale or incomplete coverage. This proves
   useful discovery without maps or density-adaptive expansion.

8. **Profiles — Open a discovered profile.**
   Open a result and retrieve additional details directly from its owner,
   subject to explicit sharing permission. Show an unavailable state when the
   owner cannot be reached. This completes discovery without distributing
   private profile details through the search index.

9. **Messaging — Exchange private text messages.**
   Connect Converse/XMPP to the same user identities and prove encrypted
   one-to-one messaging. Provide a conversation view, encrypted local history,
   visible pending or failed sends, and retry after reconnection without
   duplicates. Keep undelivered outgoing messages locally. This completes the
   core interaction without attachments or background delivery.

10. **Location, profiles, search, and messaging — Verify the complete flow.**
    On two devices, including a phone, create profiles, obtain location,
    discover each other, share details, and exchange messages. Repeat after
    reload, movement, withdrawal, and a connection interruption. Verify account
    isolation and location precision, record resource use and infrastructure
    needs, and run `bun run test`. This establishes whether the prototype works
    and supplies evidence for the remaining roadmap decisions.
