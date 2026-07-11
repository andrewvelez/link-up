# Link-Up Resource Budgets

## Purpose

Link-Up should remain usable on ordinary mobile devices without imposing
unbounded storage, memory, network, battery, or background-processing costs.

These budgets are initial engineering constraints. They should guide
implementation choices and be revised using measurements from representative
devices and real usage.

A feature that cannot meet a budget should be changed, deferred, or accompanied
by an explicit decision to revise that budget.

## Target Environment

The primary runtime is an installed browser Progressive Web App.

Initial budgets should target:

- Current, modest Android and iOS devices rather than only flagship hardware.
- Intermittent or metered network connections.
- Limited browser-managed storage.
- Browser restrictions on background execution.
- Users who may keep Link-Up installed for years.

The browser engine itself is outside Link-Up's direct resource budget. Link-Up
should measure and control the additional resources caused by its application
code, retained data, network activity, and background work.

## Initial Budgets

All numerical limits are provisional until validated on representative devices.

### Application Delivery

| Resource | Initial budget |
| --- | ---: |
| Initial compressed application shell | 500 KB |
| Total compressed first-use application assets | 2 MB |
| JavaScript required for initial interaction | 250 KB compressed |
| Largest individual non-media application asset | 500 KB |

The initial experience should not require downloading optional media, geographic
datasets, or features the user has not requested.

### Startup and Responsiveness

| Resource | Initial budget |
| --- | ---: |
| Usable cached launch on a modest device | 2 seconds |
| Usable uncached launch on a normal mobile connection | 5 seconds |
| Main-thread task duration | 50 ms maximum |
| Response to ordinary user input | 100 ms |

Large computations should be divided, deferred, moved off the main thread where
browser support permits, or eliminated.

### Memory

| Resource | Initial budget |
| --- | ---: |
| Link-Up working-set increase during ordinary use | 100 MB |
| Link-Up working-set increase during media viewing | 200 MB |
| Decoded media retained after leaving its view | 0 items |

Lists, maps, conversations, and discovery results must be bounded or virtualized.
Object URLs, media elements, event listeners, peer connections, and workers must
have explicit lifecycles.

### Local Storage

| Resource | Initial budget |
| --- | ---: |
| Application shell and static cache | 10 MB |
| Structured local application data | 25 MB |
| Default media cache | 100 MB |
| Total normal local footprint | 150 MB |

The application must continue to operate when persistent storage is unavailable,
storage quotas are smaller than expected, or cached data is evicted.

Temporary files and caches must have size limits and eviction policies. Live
profiles must not become an ambient retained profile archive. User-owned data
and explicitly authorized saved data require separate retention rules.

### Network Use

| Resource | Initial budget |
| --- | ---: |
| Idle foreground control traffic | 1 MB per hour |
| Background control traffic | 5 MB per day |
| Discovery refresh excluding media | 100 KB |
| Ordinary text message protocol overhead | 5 KB |

Media transfer is accounted for separately because user-selected media can
legitimately exceed these limits.

The application should:

- Transfer media only when needed.
- Generate and request appropriately sized media variants.
- Avoid polling when event-driven updates are available.
- Use bounded retry attempts with backoff.
- Avoid repeatedly transferring unchanged data.
- Make relay use measurable separately from direct peer transfer.

### CPU, Battery, and Background Activity

Link-Up should perform no continuous computation merely because it is installed.

When the application is not actively used:

- Location sampling must stop unless a user-visible feature explicitly requires it.
- Peer discovery and peer connections must not remain continuously active.
- Retry loops and synchronization must be bounded.
- Service-worker activity must be event-driven and short-lived.
- Cryptographic or geographic processing must not run speculatively.

An ordinary foreground session should not cause sustained high CPU use after
startup, synchronization, or a user-requested operation completes.

### Concurrency

Initial limits:

| Resource | Initial budget |
| --- | ---: |
| Simultaneous direct peer connections | 4 |
| Simultaneous media transfers | 2 |
| Simultaneous network requests not initiated by the user | 6 |
| Automatic retry attempts for one operation | 3 |

Queues must be bounded. Reaching a concurrency limit should delay, combine,
cancel, or reject work rather than create an unlimited backlog.

### Location

Location work should use the least precise and least frequent data that provides
the requested product behavior.

- Exact coordinates must not be retained when an H3 geocell is sufficient.
- Location updates must be driven by meaningful movement or user action rather
  than a permanent high-frequency timer.
- H3 expansion must have explicit limits on resolution, ring count, result
  count, and computation time.
- Geographic datasets must be loaded by region or need rather than assumed to
  fit entirely in memory.

### Remote-Service Cost

Client-heavy architecture should produce measurable reductions in centralized
work rather than merely moving complexity into the client.

For each major network feature, measure:

- Authoritative service requests per active user.
- Signaling and rendezvous traffic.
- Direct peer-transfer bytes.
- Relayed peer-transfer bytes.
- Durable server-storage growth.
- Cache hit and duplicate-transfer rates.
- Work repeated by both peers and remote services.

No numerical remote-service budget is set yet. Establishing per-active-user
bandwidth, storage, and compute targets is part of the MVP measurement work.

## Enforcement

Resource limits should be enforced close to the code that owns the resource.
Examples include bounded caches, capped queues, transfer limits, expiration
times, abort signals, connection limits, and storage eviction policies.

Development measurements should cover at least:

- Fresh installation and first launch.
- Cached launch.
- A 30-minute ordinary session.
- Discovery in sparse and dense areas.
- Messaging and media transfer.
- Network loss and reconnection.
- Several days of accumulated local state.
- Upgrade from an older cached application version.

Measurements should use both a modest target device and a current desktop
browser. Desktop measurements alone are not sufficient.

## Exceptions and Revisions

A budget may be revised when measurements show that it is unrealistic or that a
larger allocation provides a worthwhile product benefit.

Any revision should record:

- The affected resource.
- The old and new limits.
- The measured reason for the change.
- The devices and conditions tested.
- Any compensating limit or cleanup behavior.

The purpose of these budgets is not to make every component as small as possible.
It is to keep resource use intentional, bounded, observable, and appropriate for
the devices on which Link-Up is expected to run.
