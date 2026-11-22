# Speed Sprint — Text-Search Beta Demo

> **Early implementation proposal.**
>
> The beta demo scope below is the requested delivery target. Story details,
> library integration, and estimates remain provisional until validated.

Build a functional text-only profile-search page inside the PWA, with a defined
local store for profile text and working search results. This is a **beta demo**,
not an MVP. The former two-device prototype is removed from this sprint and the
roadmap; there is no second-device completion gate.

This sprint selects whole stories from [ROADMAP_Detailed.md](ROADMAP_Detailed.md),
which owns their scope, acceptance criteria, and prerequisites. See its
[current baseline](ROADMAP_Detailed.md#current-baseline) and
[delivery milestones](ROADMAP_Detailed.md#delivery-milestones-and-beta-first-order).
The existing PWA shell and sample Map/Grid views do not yet provide persistence
or search, and no selected story is marked complete by this planning update.

## Data and runtime boundaries

Define profile text as stable ID, display name, bio, ownership, and revision.
Use the proposed granthdb store for persisted profile records and synthetic demo
summaries, validating SQLite/WASM, OPFS, and the IndexedDB fallback in E1-S1.
Protect authoritative owner records with E1-S2 encryption and local account
unlock. Full network account authentication is later E1-S6 work.

Evaluate Orama for searching display names and bios in E5-S6. Its local index is
derived from stored synthetic summaries and can be reopened or rebuilt after
reload; it does not replace the authoritative owner store. Private owner records
are not implicitly included in search. Clearly identify demo data, and allow
local-only inclusion only through an explicit choice. Persist owner-derived
summaries and search artifacts encrypted; queries can use decrypted data in memory.

Text search runs locally while the app has network access. DESIGN's network
requirement still applies: tolerate brief interruptions and block interaction
with the sustained-offline overlay. Cached assets do not imply offline feature
support. Keep page markup/styles separate from scripts, components in their
own `src/components/` folders using regular DOM, and feature logic separate from
shared initialization. Do not edit generated `dist/` files.

## Selected stories and execution order

Each prerequisite appears earlier in this sequence. Story IDs are stable
references, not priority numbers; higher-numbered beta stories intentionally
execute before geographic and distributed-search stories.

| Order | Roadmap story | Demonstrable outcome |
| --- | --- | --- |
| 1 | [E1-S1 — Create profile and locality data structures and their local store](ROADMAP_Detailed.md#e1-s1--create-profile-and-locality-data-structures-and-their-local-store) | Defined persistent text records and store API; locality remains optional. |
| 2 | [E1-S2 — Encrypt and reopen authoritative owner records](ROADMAP_Detailed.md#e1-s2--encrypt-and-reopen-authoritative-owner-records) | Local owner data survives reload and unlock without plaintext fallback. |
| 3 | [E2-S1 — Save a minimal text profile locally](ROADMAP_Detailed.md#e2-s1--save-a-minimal-text-profile-locally) | Display name and bio can be edited and restored. |
| 4 | [E5-S6 — Search locally stored profile text](ROADMAP_Detailed.md#e5-s6--search-locally-stored-profile-text) | Queries return matching persisted synthetic summaries. |
| 5 | [E9-S4 — Provide the text-only profile-search page](ROADMAP_Detailed.md#e9-s4--provide-the-text-only-profile-search-page) | The PWA renders query results and loading/empty/error states. |
| 6 | [E12-S1 — Preserve the page and enforce sustained-offline behavior](ROADMAP_Detailed.md#e12-s1--preserve-the-page-and-enforce-sustained-offline-behavior) | Connectivity behavior follows DESIGN. |
| **7** | [**E13-S5 — Verify the text-search beta demo**](ROADMAP_Detailed.md#e13-s5--verify-the-text-search-beta-demo) | **Beta demo finished when all seven stories pass.** |

## Completion and verification

E13-S5 verifies the complete edit/save/reload/unlock and query/results flow with
reproducible synthetic summaries. Matching and nonmatching queries, summary
updates/deletions, private-record exclusion, and empty/error states must behave
as specified. Verify the PWA entry and sustained-offline overlay in the browser
and installed PWA where supported. Run `bun run build`, which bundles and then
runs tests, and record the results. Failed acceptance criteria remain incomplete.

No photos, location permission, H3 processing, locality reference dataset,
regional builder or snapshots, peer exchange, live discovery, messaging,
notifications, or second device are required. Defining a locality model in
E1-S1 does not require implementing locality resolution. Synthetic local browsing
does not settle access policy for real discovery data.

## Later product work and MVP status

After beta, the roadmap retains authenticated accounts, profile publication and
withdrawal, photos, geographic search, real Map/Grid discovery, peer networking,
regional indexes, private messaging, supported notifications, abuse controls,
data recovery, and release preparation. These features are outside this sprint.

**MVP scope and completion gate remain to be agreed.** The beta demo is not an
MVP, and there is no separate two-device prototype milestone. The complete
currently specified Version 1 scope finishes at E13-S4; a smaller product MVP
needs an agreed scope before its earlier completion point can be identified.

## Coding estimates

- **Human coding time:** 54–90 hours.
- **Human coding with AI:** 27–49 hours.

These are the sum of the seven selected stories' coding estimates. As in the
roadmap, they exclude research, testing, and documentation and are not an elapsed
delivery-date estimate. Library validation can change the implementation scope.
