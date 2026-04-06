# Production Refactor Roadmap

Date: 2026-04-05
Goal: turn the current repo into a production-grade modular monolith without unnecessary overengineering.

## Design Position

If I were responsible for this repo, I would make one high-level call first:

- Keep one backend service.
- Keep one frontend app.
- Improve internal boundaries before introducing more deployables.

Reason:

- The product does not justify microservices yet.
- The real bottlenecks are configuration, safety, security, testing, and operations.
- Splitting services early would create more moving parts than value.

## Target End State

### Backend

- `config/settings/base.py`, `config/settings/dev.py`, `config/settings/prod.py`
- `apps/core/` for shared concerns such as exceptions, health checks, logging helpers, and common utilities
- `apps/blog/` for blog domain only
- `apps/chat/` for chat domain only
- `services/` for orchestration logic and provider coordination
- `tests/` separated into unit, integration, and API tests

### Frontend

- `src/app/` for routing, providers, error boundaries, and application shell
- `src/features/blog/`, `src/features/chat/`, `src/features/home/`, `src/features/projects/`
- `src/shared/api/` for the HTTP client and endpoint contracts
- `src/shared/config/` for environment-aware frontend configuration
- `src/shared/ui/` for reusable primitives
- `src/shared/styles/` for tokens and shared styling rules

### Delivery and Operations

- `.github/workflows/` for CI
- `infra/docker/` and optionally `infra/nginx/`
- `docs/adr/` for architecture decisions
- `docs/runbooks/` for deployment and incident guidance

## Phased Plan

## Phase 0: Immediate Cleanup

These are the fastest high-value fixes.

1. Remove or replace `frontend/src/pages/Admin.jsx`.
Reason: it is stale, not routed, and does not match the backend contract.

2. Fix hardcoded hostnames in frontend and backend runtime code.
Reason: this is the main source of environment brittleness.

3. Add `.env.example` files for frontend and backend.
Reason: production readiness starts with reproducible configuration.

4. Fix the duplicate `pointerEvents` warning in `frontend/src/features/home/pages/HomePage.jsx`.
Reason: small warning, low risk, should not remain in a clean build.

5. Add a health endpoint.
Reason: operations needs a stable first signal.

## Phase 1: Backend Hardening

1. Split Django settings into base, dev, and prod.
Reason: this is the cleanest way to express environment-specific behavior.

2. Introduce environment-driven PostgreSQL support.
Reason: the README already implies this is the production database target.

3. Move the chat endpoint to DRF serializer-based validation.
Reason: validation and error handling should be formalized.

4. Add throttling and abuse controls to chat.
Reason: the chat endpoint is the cost center and attack surface.

5. Add structured logging and request IDs.
Reason: production debugging depends on traceable logs.

6. Add secure production settings.
Reason: Django already flagged the missing controls during `check --deploy`.

Suggested backend packages to consider:

- `django-environ` for settings management
- `psycopg` for PostgreSQL
- `whitenoise` only if you serve static assets from Django in a simple deployment
- `sentry-sdk` for error reporting

## Phase 2: Frontend Hardening

1. Introduce `src/shared/config/` and read API base URLs from env.
Reason: remove all deployment-specific values from source code.

2. Reorganize by feature instead of by broad page bucket only.
Reason: feature ownership scales better than page ownership.

3. Route-split major pages and lazy-load heavy modules.
Reason: current bundle size is too large for a lean production portfolio site.

4. Move repeated inline style systems into reusable UI primitives or CSS modules.
Reason: the current styling approach is fast to start but expensive to maintain.

5. Add an application-level error boundary and better loading states.
Reason: failures should degrade gracefully.

Optional, but reasonable later:

- Add TanStack Query if server-state complexity grows enough to justify caching and invalidation tooling.

## Phase 3: Testing and CI

1. Add backend unit tests for serializers, services, and provider selection rules.
2. Add backend API tests for series, blog posts, and chat failure modes.
3. Add frontend smoke tests for routing and blog rendering.
4. Add one end-to-end flow covering blog read plus chat open.
5. Add CI for backend checks, tests, and frontend build.

Reason:

- Production structure without change safety is still fragile.

## Phase 4: Delivery and Operations

1. Add Dockerfiles for backend and frontend if you want consistent local and CI builds.
2. Add a reverse-proxy strategy for frontend, API, and media.
3. Move media to object storage.
4. Add staging and production environment documentation.
5. Add backup and recovery notes for the database.

Reason:

- This is the point where the repo becomes operable, not just runnable.

## What I Would Change First If I Owned The Repo

1. Environment and settings isolation.
Reason: this is the root of most production issues in the current codebase.

2. Chat endpoint hardening.
Reason: it is the most sensitive and expensive part of the system.

3. Remove stale frontend admin code.
Reason: dead code distorts system understanding.

4. Tests plus CI.
Reason: without them, every refactor remains risky.

5. Frontend config plus route-level code splitting.
Reason: the app is currently heavier and more deployment-coupled than it should be.

## Suggested Folder Shape After Refactor

```text
Portfolio/
  backend/
    apps/
      blog/
      chat/
      core/
    config/
      settings/
        base.py
        dev.py
        prod.py
    services/
    tests/
    manage.py
    pyproject.toml
  frontend/
    src/
      app/
      features/
        blog/
        chat/
        home/
        projects/
      shared/
        api/
        config/
        lib/
        styles/
        ui/
  infra/
    docker/
    nginx/
  .github/
    workflows/
  docs/
    adr/
    runbooks/
```

## Success Criteria

I would consider the repo meaningfully production-ready when all of the following are true:

- No hardcoded environment hostnames remain in runtime code.
- Django `check --deploy` is clean for the production settings module.
- Chat has validation, throttling, and safe error handling.
- Backend tests and frontend build run in CI.
- Frontend uses environment-aware configuration and smaller initial bundles.
- The repo has a documented deployment path and a basic operations story.

At that point, the project would still be simple, but it would be simple in the right way.