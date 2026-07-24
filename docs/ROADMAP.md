# Link-Up Roadmap

## Purpose

This document defines Link-Up's development priorities in enough detail to
guide implementation planning.

It is not a Kanban board and does not contain individual Kanban tasks. Each
priority describes the intended outcome, the major areas of work, important
decisions, and the conditions that must be satisfied before the priority can
be considered complete. Kanban tasks should be derived from this document.

The priorities remain ordered because later architectural experiments depend
on foundations established by earlier priorities. Work may overlap when doing
so helps answer an open question, but a priority should not be marked complete
until its completion criteria are satisfied.

## Development Priorities

1. Make the existing PWA shell functional and testable.
2. Define the smallest useful profile, presence, and discovery flow.
3. Choose and test browser storage and encryption boundaries.
4. Connect one browser-compatible peer transport to the application.
5. Add the minimum rendezvous and signaling service.
6. Prove one authorized peer interaction with a clear fallback path.
7. Add block, report, and revocation behavior before broad discovery.
8. Measure client contribution and avoided server cost.

---

## 1. Make the Existing PWA Shell Functional and Testable

**Status:** Incomplete

### Intended Outcome

Link-Up should have a dependable application shell that can be built, started,
installed, updated, and tested before product data, peer networking, and remote
services are added to it.

Completing this priority does not mean implementing profiles, discovery,
identity, messaging, or peer communication. It means establishing a stable
foundation on which those features can be developed and evaluated.

### Current State

The repository already provides part of this foundation:

- Bun commands build, test, and start the application.
- The application is served over local HTTPS.
- The landing page and application page are available through defined routes.
- Static assets are served by the application.
- A web app manifest and service worker are present.
- The application exposes an installation prompt when the browser supports it.
- Automated behavior and unit tests cover parts of the shell.
- JavaScript is checked through `tsc` with `checkJs`.

This is meaningful progress, but it does not yet demonstrate that the complete
PWA lifecycle works reliably in a real browser.

### Application Shell

The landing page and application page should provide a coherent path into the
application.

The shell should establish:

- Which page is the public entry point.
- How a user enters the application.
- Which UI belongs to the persistent shell.
- How navigation between shell views works.
- What the user sees while application data is loading.
- What the user sees when startup fails.
- A stable location where later profile, discovery, and communication features
  can be introduced.

Temporary content is acceptable, but the shell structure should not need to be
replaced when priority 2 begins.

### Build and Development Workflow

The documented commands should behave consistently:

- `bun run build` should produce a deployable production artifact.
- `bun run test` should validate the project without starting a persistent
  application server.
- `bun run start` should build the development version, run validation, and
  make the application available locally.

The workflow should also establish:

- Clear failure behavior for type checking, compilation, and tests.
- Predictable handling of an existing local server.
- A deliberate development cache version.
- A reproducible production cache version.
- No dependence on undocumented manual preparation.
- Documentation that matches the commands developers actually run.

### PWA Installation

Installation should be treated as a progressive enhancement because browser
support and installation UI differ.

The application should:

- Register its service worker successfully.
- Provide a valid manifest containing the required application metadata and
  icons.
- Expose the application-controlled install button only when an install prompt
  is available.
- Keep the application usable when the browser does not expose an install
  prompt.
- Avoid presenting installation as a requirement for using Link-Up.
- Give the user understandable feedback when installation cannot be initiated.

Installation behavior should be verified in at least one browser that supports
the application-controlled install prompt and one browser that does not.

### Service Worker and Updates

The service worker should have an explicit initial responsibility. Its cache
must not grow accidentally into an undefined storage system for application
data.

For the shell, it should establish:

- Which static resources are cached.
- When cached resources are refreshed.
- How old cache versions are removed.
- How navigation requests behave when the network is unavailable.
- What happens when a required resource is not cached.
- How a newly deployed shell becomes active.
- How the application recovers from a failed or incompatible cached version.

Important user data must not rely on the static-resource cache. Storage and
recovery of user data belong to later priorities.

### Offline and Failure Behavior

“Functional” should include understandable behavior when normal startup
conditions are unavailable.

The shell should distinguish between:

- The browser being offline.
- The local or remote application service being unavailable.
- A static resource failing to load.
- A service-worker or cache problem.
- A later application module failing during startup.

The initial shell does not need to provide full offline application behavior.
It should load whatever safe shell is available and communicate what the user
can and cannot do.

### Browser Validation

Route-handler and unit tests are useful, but they cannot prove the complete PWA
lifecycle.

Browser-level specifications should cover the smallest critical path:

1. Open the landing page.
2. Enter the application.
3. Confirm that the application shell renders.
4. Confirm that service-worker registration succeeds in a supported context.
5. Confirm that the manifest and required icons are accepted.
6. Exercise supported installation behavior.
7. Reload the application under the intended cached-shell conditions.
8. Confirm that an updated shell can replace an older cached version.

The browser test layer should remain small. Detailed logic should continue to
be tested through faster behavior and unit tests.

### Test Organization

Tests should continue to be divided by scope:

- `test/Specs/` for browser-driven user and PWA lifecycle behavior.
- `test/Behaviors/` for routes and application service behavior.
- `test/Units/` for isolated rendering and browser-module logic.

Tests should verify observable behavior rather than internal implementation
details. A real listening server should only be used where the behavior being
tested genuinely crosses the network or browser boundary.

The counts in `test/TEST_PYRAMID.md` should remain synchronized with the test
suite.

### Supported Environment

Before this priority is complete, the project should state the minimum
environment in which the shell is expected to work:

- Required Bun version or version policy.
- Supported development operating environment.
- Initial browser support targets.
- HTTPS requirements for local and deployed use.
- Any browser-specific limitations affecting installation or service workers.

This support statement can be narrow. Its purpose is to make validation
repeatable, not to promise broad compatibility prematurely.

### Documentation

The project documentation should allow a new developer to:

- Install the required tools.
- Build the production artifact.
- Run the test suite.
- Start the development application.
- Open the correct local URL.
- Understand the expected HTTPS warning or certificate setup.
- Locate the PWA assets and test organization.
- Recognize the difference between the current shell and unimplemented product
  functionality.

`README.md`, `DESIGN.md`, and the actual project commands should not contradict
one another.

### Completion Criteria

Priority 1 can be marked complete when:

- The production build completes from a clean checkout using the documented
  command.
- The development command starts or reuses the expected local server and
  reports the application URL.
- Build, type-check, or test failures cause the command to fail clearly.
- The landing page and application shell work through their public routes.
- The manifest, icons, and service worker form a valid installable PWA in a
  supported browser.
- Unsupported installation environments retain a usable browser experience.
- Static shell caching, cache cleanup, and update behavior are explicitly
  defined and tested.
- Offline and startup failures produce deliberate shell behavior.
- The critical browser-level PWA lifecycle has automated specification
  coverage.
- Behavior and unit tests cover the shell logic that does not require a real
  browser.
- Supported development and browser environments are documented.
- Project documentation accurately describes the implemented shell.
- The shell provides a stable place to begin priority 2 without requiring a
  structural rewrite.

### Deriving Kanban Tasks

Kanban tasks for this priority should be created from gaps between the current
state and the completion criteria.

Each Kanban task should represent one reviewable outcome, identify the relevant
completion criterion, and include its required validation. Implementation,
tests, and directly affected documentation should normally remain part of the
same task.
