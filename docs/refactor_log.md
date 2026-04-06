# Refactor Log

New entries are appended at the bottom. Never remove entries.

---

## Entry #001 — Phase 0 Hardening Start

**Date:** 2026-04-05
**Goal:** Start the production-hardening roadmap with changes that reduce deployment brittleness and remove stale system surfaces.

### Steps Taken

1. Standardized the backend command path on `backend/.venv` because the workspace also contains a root `.venv`, which caused tool auto-detection ambiguity.
2. Added a small shared `core` app and introduced `/health/` as a real backend health endpoint.
3. Replaced hardcoded frontend backend URLs with environment-driven configuration.
4. Replaced the broken `/admin` frontend route link with a direct Django admin URL.
5. Removed the stale `frontend/src/pages/Admin.jsx` file because it no longer matched the Django backend contract.
6. Added `.env.example` files for both backend and frontend so environment setup no longer depends on tribal knowledge.
7. Fixed the duplicate `pointerEvents` warning in `Home.jsx` to keep the production build clean.

### Expected Benefits

- Fewer deployment-time code edits.
- Cleaner separation between local, staging, and production environments.
- Lower onboarding friction because the required environment variables are documented.
- Better operational readiness because a health probe now exists.
- Lower maintenance cost because a stale admin surface was removed instead of left to drift further.

### Problems Faced

- The workspace contains both `.venv` and `backend/.venv`, which caused initial environment confusion.
- The frontend still contained remnants of a previous FastAPI-era admin workflow, so Phase 0 needed cleanup before deeper backend refactors.
- The frontend production build is now clean of the duplicate object-key warning, but it still emits a large-bundle warning. That remains a Phase 2 performance task, not a Phase 0 blocker.

### Validation

1. Backend configuration check:
	- Command: `backend/.venv/Scripts/python.exe backend/manage.py check`
	- Result: passed with no issues.
2. Health endpoint test:
	- Command: `backend/.venv/Scripts/python.exe backend/manage.py test core --verbosity 2`
	- Result: passed. The new `/health/` endpoint returned HTTP 200 with `{ "status": "ok", "database": "ok" }` under test.
3. Frontend production build:
	- Command: `Push-Location frontend; npm run build -- --debug; Pop-Location`
	- Result: passed. The earlier duplicate `pointerEvents` warning is gone.
4. Remaining note:
	- Vite still reports a large chunk warning for the main bundle. That is expected until route-level code splitting and lazy loading are implemented in a later phase.

### System Benefit After This Entry

- The repo can now move between environments with far fewer source-code edits.
- Operational tooling has a stable health endpoint to probe.
- Frontend runtime URLs are no longer locked to one localhost deployment.
- The codebase has less misleading dead surface area.
- Future refactor phases now have a documented baseline and a verified starting point.

---

## Entry #002 — Phase 1 Backend Hardening

**Date:** 2026-04-05
**Goal:** Move the backend from prototype configuration toward production-safe operation by hardening settings, database configuration, chat validation, throttling, and observability.

### Steps Taken

1. Split the old monolithic Django settings file into `portfolio/settings/base.py`, `portfolio/settings/dev.py`, and `portfolio/settings/prod.py`.
2. Removed the old `portfolio.settings` module path and moved the runtime defaults to `portfolio.settings.dev` because backward compatibility was not a requirement for this refactor.
3. Added environment-driven database selection with SQLite as the development fallback and PostgreSQL as the required production target.
4. Added the PostgreSQL driver with `psycopg[binary]` through the project package manager so the production database path is backed by a real dependency.
5. Added structured JSON logging and request ID propagation through shared backend middleware and logging helpers.
6. Refactored the chat endpoint from a plain Django view into a DRF `APIView` with serializer-based input validation.
7. Added an explicit endpoint throttle for chat so rate-limiting is enforced in a predictable, testable way.
8. Moved chat orchestration into a dedicated service module so provider selection, provider failures, and response logging are not mixed directly into the HTTP view.
9. Added backend tests for health checks, request ID propagation, chat success, validation failures, missing blog posts, and rate limiting.
10. Expanded the backend `.env.example` file so the new settings contract is documented alongside the code.

### Expected Benefits

- Clear separation between development and production behavior.
- Safer production startup because production now requires explicit secure configuration instead of relying on development defaults.
- Real support for PostgreSQL deployment without hand-editing source files.
- Better abuse resistance on the AI chat endpoint through request throttling and input constraints.
- Better debugging and incident response because requests now emit structured logs and request IDs.
- Cleaner backend layering because validation, transport logic, and provider orchestration are no longer collapsed into a single view.

### Problems Faced

- The terminal session reused environment variables between commands, which caused one test run to accidentally pick up the production `DATABASE_URL`. The fix was to clear the shared-shell environment before rerunning development tests.
- The first throttling implementation using DRF scoped throttles was not deterministic enough in the test environment, so it was replaced with an explicit `ChatRateThrottle` implementation tied directly to the chat endpoint.
- DRF field validation produced different blank-string error text than the frontend expected, so the serializer and frontend error parsing had to be aligned deliberately.
- Django request warnings initially lost the request ID after the middleware reset its context variable, so the logging filter was improved to read the ID from the attached request object when present.

### Validation

1. Development settings check:
	- Command: `backend/.venv/Scripts/python.exe backend/manage.py check`
	- Result: passed with no issues.
2. Backend behavior tests:
	- Command: `Remove-Item Env:DATABASE_URL -ErrorAction Ignore; Remove-Item Env:DJANGO_SETTINGS_MODULE -ErrorAction Ignore; backend/.venv/Scripts/python.exe backend/manage.py test core chat --verbosity 2`
	- Result: passed. All health and chat tests completed successfully.
3. Production deployment check:
	- Command: `backend/.venv/Scripts/python.exe backend/manage.py check --deploy --settings=portfolio.settings.prod` with explicit production-like environment variables.
	- Result: passed with no deployment warnings.
4. Frontend compatibility check:
	- Command: `Push-Location frontend; npm run build; Pop-Location`
	- Result: passed after the chat client error-handling update.
5. Remaining note:
	- The frontend still emits a large bundle warning. That remains a Phase 2 concern and is not a blocker for the backend hardening completed here.

### System Benefit After This Entry

- The backend now has explicit environment boundaries instead of one blended settings mode.
- Production security settings are codified rather than implied.
- Chat request validation and throttling are now formalized at the API boundary.
- Logs are more useful for system design discussions because they now carry request-scoped trace information.
- The repo is materially closer to what a senior engineer would hand over to a team as a maintainable modular monolith.

---

## Entry #003 — Phase 2 Frontend Hardening Start

**Date:** 2026-04-05
**Goal:** Start the frontend hardening phase by adding a real app layer, formal shared modules, route-level code splitting, better runtime failure handling, and updated architecture documentation.

### Steps Taken

1. Moved the React application entry into `frontend/src/app/` and introduced an explicit app shell made of `App.jsx`, `AppRouter.jsx`, `AppErrorBoundary.jsx`, and `RouteFallback.jsx`.
2. Moved theme state into `frontend/src/app/providers/ThemeProvider.jsx` so global providers now live under the application layer instead of a generic `context/` folder.
3. Moved frontend runtime configuration, API access, and Markdown rendering into `frontend/src/shared/config/`, `frontend/src/shared/api/`, and `frontend/src/shared/lib/`.
4. Deleted the old `src/App.jsx`, `src/context/ThemeContext.jsx`, `src/config/env.js`, `src/services/api.js`, and `src/utils/markdown.js` files rather than keeping compatibility wrappers, because backward compatibility was explicitly not a requirement for this refactor.
5. Switched the main route table to lazy-loaded page modules so each major page is split into its own chunk at build time.
6. Lazy-loaded the heavy Three.js home background and the blog chat panel so those chunks are only fetched when the relevant route or UI state actually needs them.
7. Fixed the `LetsTrain` page CTA to use client-side navigation instead of a hardcoded anchor path.
8. Updated the README and React guide references so the repo documentation points to the current architecture rather than stale file paths.

### Expected Benefits

- Smaller initial frontend payload because route bundles are now split instead of shipped in one large application chunk.
- Clearer architectural boundaries between app shell code, shared infrastructure code, and page-level UI code.
- Better failure behavior because render-time frontend crashes now fall into an explicit error boundary instead of blanking the page with no recovery surface.
- Lower maintenance cost because the repo no longer carries duplicate legacy module paths that future contributors would have to mentally map.

### Problems Faced

- The project documentation still contained several old frontend path references, so the refactor needed a documentation pass to avoid teaching outdated module locations.
- Route-level code splitting alone would not help the home route enough because the heavy Three.js scene was still imported eagerly inside the page, so a second lazy boundary was added at the component level.
- The user explicitly did not want backward compatibility, which meant the right move was deletion rather than temporary forwarding modules. That is cleaner, but it also required a full import sweep to avoid leaving broken references behind.

### Validation

1. Frontend editor diagnostics:
	- Result: passed. No frontend errors remained after the module moves.
2. Frontend production build:
	- Command: `Push-Location frontend; npm run build; Pop-Location`
	- Result: passed. Vite emitted separate chunks for the major routes plus dedicated `ChatPanel` and `RetroScene` chunks.
3. Remaining note:
	- Large chunk warnings still remain for the `RetroScene` and `BlogPost` bundles. The initial app bundle is much smaller now, but deeper Phase 2 work is still needed around blog-rendering dependencies and heavier visual modules.

### System Benefit After This Entry

- The frontend now has a recognizable application layer instead of a single flat entrypoint.
- Shared runtime concerns now live under stable `shared/` modules rather than ad hoc top-level folders.
- The repo structure is closer to what a production-minded React codebase should look like before deeper feature-level reorganization begins.

---

## Entry #004 — Phase 2 Feature Reorganization And Bundle Reduction

**Date:** 2026-04-05
**Goal:** Continue the frontend hardening phase by reorganizing code around features, shrinking the blog rendering cost, and isolating the remaining heavy Three.js payload.

### Steps Taken

1. Moved the blog UI into `frontend/src/features/blog/` with dedicated page and component folders.
2. Moved the home feature into `frontend/src/features/home/` and moved the projects and training pages into their own feature folders as well.
3. Updated the app router so all route imports now target the feature-based paths instead of the old top-level `pages/` folder.
4. Added `MarkdownContent.jsx` to the blog feature and changed article rendering to load the Markdown parser dynamically instead of pulling it directly into the route bundle.
5. Reworked `frontend/src/shared/lib/markdown.js` to use the Highlight.js core build plus an explicit set of registered languages and aliases instead of the full default package.
6. Replaced the original manual chunk map with a targeted chunking function in Vite so React, Markdown, Three.js core, and the React-Three integration stack are emitted separately.
7. Updated the README, React guide, and roadmap references so the current docs reflect the new feature-based layout.
8. Kept the no-backward-compatibility rule intact by moving and deleting old paths instead of introducing forwarding modules.

### Expected Benefits

- Clearer ownership boundaries because route code and feature-specific components now live together.
- Much smaller blog route payload because Markdown parsing and syntax-highlighting dependencies are no longer bundled into the page chunk itself.
- Better long-term maintainability because the folder layout now matches product features instead of a flat bucket of generic pages.
- Better operational clarity in performance work because the remaining heavy dependency is now isolated to the Three.js core chunk instead of being mixed with unrelated route code.

### Problems Faced

- The file move itself was straightforward, but it required a careful second pass over relative imports because the new feature folders changed almost every import depth.
- The first chunk split proved that route-level splitting was working, but it also exposed that the real blog cost came from the full Highlight.js build rather than from the page component itself.
- Three.js remains intrinsically heavy even after better chunk separation, so this pass could isolate that cost cleanly but could not eliminate it entirely without a deeper home-scene redesign.

### Validation

1. Frontend editor diagnostics:
	- Result: passed. No errors remained in the updated app router, feature folders, markdown runtime module, or Vite config.
2. Frontend production build after feature reorganization:
	- Command: `Push-Location frontend; npm run build; Pop-Location`
	- Result: passed. Route chunks for `BlogPostPage`, `RetroScene`, and the other feature pages are now all small and isolated.
3. Frontend production build after markdown optimization and refined vendor chunking:
	- Command: `Push-Location frontend; npm run build; Pop-Location`
	- Result: passed. `BlogPostPage` dropped to about 5 kB, `markdown-vendor` dropped to about 114 kB, and the remaining size warning is isolated to `three-core` at about 719 kB.

### System Benefit After This Entry

- The frontend now reflects the target Phase 2 structure materially rather than only conceptually.
- The blog feature is cheap to load and easier to own because its rendering pipeline has been separated from the route shell.
- The bundle warning surface is now narrow and understandable: the remaining issue is the Three.js core payload, not general frontend sprawl.

---

## Entry #005 — Phase 2 Frontpage Reset

**Date:** 2026-04-05
**Goal:** Replace the heavy homepage experiment stack with a lighter retro landing page and remove the Three.js path from the active frontend build.

### Steps Taken

1. Replaced the old home page with a new retro control-room landing page built from standard React markup and a dedicated CSS module.
2. Added `frontend/src/features/home/styles/home.module.css` so the new front page no longer relies on a large block of inline styling.
3. Removed the active `RetroScene` and `BaseballGame` files from the home feature because the front page is no longer driven by a 3D scene.
4. Removed the unused frontend dependencies `three`, `@react-three/fiber`, and `@react-three/drei` from the project.
5. Simplified Vite chunking after the dependency removal so the build no longer carries Three.js-specific vendor groups.
6. Updated the README to describe the new retro homepage direction and the fact that any remaining game experiments are now optional side experiments rather than the main surface.
7. Added a small note in the React guide so the old game-registry example is treated as an archived pattern instead of the current home-page implementation.

### Expected Benefits

- Faster homepage load because the active route no longer pulls a 3D rendering stack.
- Cleaner product direction because the front page is now a deliberate visual system instead of a technology demo.
- Lower maintenance cost because the old home-specific dependencies and scene code are gone rather than merely hidden.
- Better Phase 2 momentum because the remaining frontend work can now focus on polish and content rather than bundle triage around Three.js.

### Problems Faced

- The first home-page patch accidentally left the old implementation appended under the new file, so the page had to be cleaned up in a second pass before validation.
- The README still described the deleted baseball/game-driven homepage, so the implementation required a documentation update in the same step.

### Validation

1. Frontend editor diagnostics:
	- Result: passed. No errors remained in `HomePage.jsx`, the new CSS module, or the updated Vite config.
2. Frontend production build:
	- Command: `Push-Location frontend; npm run build; Pop-Location`
	- Result: passed with no chunk-size warning.
3. Build outcome:
	- `HomePage` now ships as a small JS chunk plus a feature CSS chunk.
	- `react-vendor` remains about 229 kB and `markdown-vendor` about 114 kB.
	- The previous `three-core` warning is gone because the Three.js stack has been removed from the active app.

### System Benefit After This Entry

- The homepage now matches the intended direction: retro, lighter, and easier to evolve.
- The frontend dependency graph is simpler and more honest because unused 3D packages are no longer installed.
- Phase 2 has moved from performance containment into real product-facing design work.

---

## Entry #006 — Phase 2 Frontpage Systemization

**Date:** 2026-04-05
**Goal:** Turn the new retro homepage from one large page file into a reusable home UI system while sharpening the branded control-room presentation.

### Steps Taken

1. Extracted reusable home feature building blocks into `frontend/src/features/home/components/` with dedicated `HomePanel`, `HomeMetricGrid`, and `HomeRouteCard` modules.
2. Moved the homepage content configuration into `frontend/src/features/home/homeContent.js` so route metadata, signals, metrics, and narrative copy are separated from the page layout.
3. Reworked `frontend/src/features/home/pages/HomePage.jsx` to compose the page from those feature-owned primitives instead of repeating panel and card markup inline.
4. Added new branded sections for system posture, build ledger, and operating principles so the landing page reads more like a coherent product surface than a single hero block.
5. Expanded `frontend/src/features/home/styles/home.module.css` to support the new reusable panel tones, track cards, ledger cards, principle cards, and route status chips.
6. Added a reduced-motion guard for the rotating signal line and matching CSS motion fallbacks so the homepage degrades more cleanly for users who prefer less animation.

### Expected Benefits

- Lower maintenance cost because future homepage changes can now reuse stable feature primitives instead of growing one page component further.
- Clearer separation between content, layout, and styling inside the home feature.
- Stronger product identity because the homepage now communicates system posture, current work, and route status in a more structured way.
- Better accessibility posture because decorative motion now respects reduced-motion preferences.

### Problems Faced

- The first frontpage reset solved the performance issue, but it still left the page logic concentrated in one large module. This pass had to separate structure from content without losing the retro visual language.
- The new UI extraction needed to stay lightweight and avoid introducing another generic shared-component layer too early, so the reusable primitives were kept inside the home feature rather than pushed into global UI code.

### Validation

1. Frontend editor diagnostics:
	- Result: passed. No errors remained in the refactored home page, new home components, content module, or CSS module.
2. Frontend production build:
	- Command: `Push-Location frontend; npm run build; Pop-Location`
	- Result: passed with no chunk-size warning.
3. Build outcome:
	- `HomePage` now ships at about 11.55 kB of JavaScript and about 10.82 kB of CSS.
	- The overall frontend build remains clean, with `react-vendor` at about 229 kB and `markdown-vendor` at about 114 kB.

### System Benefit After This Entry

- The homepage is now structured like a real feature module instead of a polished one-off file.
- The retro landing page has a clearer narrative hierarchy and stronger reusable design language.
- Phase 2 can keep iterating on the front page without reopening the earlier bundle and architecture problems.

---

## Entry #007 — Phase 2 App Shell Cleanup

**Date:** 2026-04-06
**Goal:** Continue Phase 2 by reducing inline shell styling, removing placeholder frame content, and making the app chrome feel more like a maintained product surface.

### Steps Taken

1. Refactored the header navigation to use a shared nav-item list instead of hand-written repeated link blocks.
2. Moved the `Let's Train` route badge styling out of inline JSX and into the shared shell stylesheet.
3. Replaced the old footer placeholder links with a real shell footer that separates internal routes from the primary external profile link.
4. Reworked `frontend/src/components/SettingsDock.jsx` to use a dedicated CSS module rather than a large inline-style block.
5. Added better settings-dock behavior by supporting click-outside close, Escape close, and a graceful disabled state when browser audio APIs are unavailable.
6. Kept the settings surface aligned with the retro shell language by switching the control labels to more deliberate monospace states like `CTL`, `MIDNIGHT`, `DAYSHIFT`, `ON`, and `OFF`.

### Expected Benefits

- Lower maintenance cost because shell presentation logic is now less entangled with JSX markup.
- Better consistency between the homepage direction and the rest of the application frame.
- Cleaner user experience because the footer no longer advertises dead placeholder destinations.
- Better behavior around the settings menu because it now closes predictably and handles unsupported audio more safely.

### Problems Faced

- The first patch attempt for the shell cleanup failed because the footer replacement diff did not match the existing file cleanly, so the changes had to be reapplied in smaller controlled updates.
- The settings dock was still carrying a prototype-era inline-style approach, which meant the safest path was a full component replacement rather than a partial edit.

### Validation

1. Frontend editor diagnostics:
	- Result: passed. No errors remained in the updated header, footer, settings dock, or shell stylesheet.
2. Frontend production build:
	- Command: `Push-Location frontend; npm run build; Pop-Location`
	- Result: passed with no chunk-size warning.
3. Build outcome:
	- The shared `index` CSS bundle increased to about 16.47 kB because the shell now carries more explicit styling, but the JavaScript bundles remained small and clean.
	- The main `index` JavaScript chunk remained lean at about 14.46 kB, while `react-vendor` stayed at about 229 kB.

### System Benefit After This Entry

- The app shell now better matches the production-minded direction already established in the home feature.
- Phase 2 has reduced another major source of prototype-style inline UI code.
- The frontend frame is more honest, more maintainable, and easier to evolve as a cohesive design system.
