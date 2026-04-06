# Ajay Kumar — Portfolio

A personal portfolio and technical blog with an AI chat assistant.
Built as a learning project — every file is heavily commented to explain the concepts used.

## Current Architecture

This repo now targets the current architecture directly.
Legacy frontend module paths and the old monolithic Django settings module are intentionally removed instead of being kept behind compatibility wrappers.
The frontend is now split by feature, and the build emits separate route and Markdown vendor chunks instead of one flat application bundle.

## Features

- **Home** — Retro control-room landing page with a lighter CRT-inspired visual system
- **Blog** — Series-based Markdown blog with inline image support (PNG, JPG, SVG, GIF, WebP)
- **AI Chat** — Ask questions about any blog post; answered by Claude / Gemini / OpenAI / Ollama
- **Projects** — Showcase of GitHub projects
- **Let's Train** — Upcoming RL agent training playground
- **Django Admin** — Full CMS at `/admin/` for managing blog content and uploading images

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, React Router DOM 7 |
| Markdown | marked.js + highlight.js |
| Backend | Django 6 + Django REST Framework |
| AI Chat | Claude (Anthropic) / Gemini (Google) / OpenAI / Ollama |
| Package Manager (Python) | uv |
| Database | SQLite (dev) → PostgreSQL (prod) |

## Project Structure

```
Portfolio/
├── frontend/                   # React + Vite application
│   ├── .env.example            # Frontend runtime configuration template
│   └── src/
│       ├── app/                # App shell, router, providers, error boundary
│       ├── features/
│       │   ├── blog/
│       │   │   ├── components/ # ChatPanel, MarkdownContent, BlogStateView, BlogEmptyState
│       │   │   ├── pages/      # BlogsPage, BlogSeriesPage, BlogPostPage
│       │   │   └── styles/     # Feature-specific blog layout and state surfaces
│       │   ├── home/
│       │   │   ├── components/ # HomePanel, HomeMetricGrid, HomeRouteCard
│       │   │   ├── pages/      # HomePage
│       │   │   └── styles/     # Feature-specific retro landing page styles
│       │   ├── projects/
│       │   │   ├── pages/      # ProjectsPage
│       │   │   └── styles/     # Project card layout and tags
│       │   └── training/
│       │       ├── pages/      # LetsTrainPage
│       │       └── styles/     # Training status, feature grid, and CTA surfaces
│       ├── components/
│       │   └── Layout/         # Header, Footer, Layout
│       ├── shared/
│       │   ├── api/            # Shared HTTP client and endpoint helpers
│       │   ├── config/         # Env-driven frontend runtime configuration
│       │   └── lib/            # Shared utilities such as Markdown rendering
│       ├── games/              # Archived lightweight retro experiments
│       │   ├── index.js        # Registry for optional future game surfaces
│       │   └── SpaceInvaders.jsx  # Canvas game kept as a lightweight experiment
│
├── backend/                    # Django project
│   ├── manage.py               # Django CLI entry point
│   ├── pyproject.toml          # uv dependencies
│   ├── .env.example            # Backend configuration template
│   ├── .env                    # API keys and secrets (not in git)
│   ├── core/                   # Health checks, logging, middleware
│   ├── portfolio/              # Django project config
│   │   ├── settings/
│   │   │   ├── base.py         # Shared Django settings
│   │   │   ├── dev.py          # Local development defaults
│   │   │   └── prod.py         # Production-only secure settings
│   │   └── urls.py             # Root URL routing
│   ├── blog/                   # Blog app
│   │   ├── models.py           # BlogSeries, BlogPost, BlogImage models
│   │   ├── serializers.py      # Convert models to/from JSON
│   │   ├── views.py            # API ViewSets
│   │   ├── admin.py            # Django Admin: inline image uploader, snippets
│   │   └── urls.py             # Blog URL routing
│   └── chat/                   # AI chat app
│       ├── providers.py        # Claude / Gemini / OpenAI / Ollama backends
│       └── views.py            # POST /api/chat/ endpoint
│
└── docs/
    ├── django_guide.md         # Learn Django through this project
    ├── react_guide.md          # Learn React through this project
    └── bugs.md                 # Append-only bug log (root cause + fix for each)
```

## Getting Started

### Prerequisites
- Python 3.12+
- Node.js 18+
- [uv](https://docs.astral.sh/uv/getting-started/installation/) (Python package manager)

### 1. Clone and set up backend

```bash
cd backend

# Install all Python dependencies
uv sync

# Copy .env.example to .env and fill in your values.
# For local development, manage.py defaults to portfolio.settings.dev.
# For production-style runs, set DJANGO_SETTINGS_MODULE=portfolio.settings.prod.

# Create the database tables
uv run python manage.py migrate

# Create your admin login (for the CMS at /admin/)
uv run python manage.py createsuperuser

# Start the Django server
uv run python manage.py runserver
# → http://localhost:8000
```

### 2. Set up frontend

```bash
cd frontend

# Copy .env.example to .env if you need custom frontend URLs or base path
npm install
npm run dev
# → http://localhost:5173
```

### 3. Production-oriented commands

```bash
# Backend deploy validation
cd backend
uv run python manage.py check --deploy --settings=portfolio.settings.prod

# Frontend production build
cd ../frontend
npm run build
```

### 4. Add blog content

1. Open `http://localhost:8000/admin/`
2. Log in with the superuser credentials you just created
3. Under **Blog Series**, click **Add** → create a series (e.g., "Transformer Series")
4. Under **Blog Posts**, click **Add** → write a post in Markdown, assign it to the series
5. Visit `http://localhost:5173/blogs` to see it live

### 5. Embed images in blog posts

1. Open a blog post in Django Admin
2. Scroll to the **Post Images** section at the bottom
3. Click **Add another Blog Image** → upload a file (PNG, JPG, SVG, GIF, WebP)
4. Copy the snippet from the **"Paste this into Markdown"** column — it looks like:
   ```
   ![my diagram](http://localhost:8000/media/blog_images/diagram.svg)
   ```
5. Paste it anywhere in the post **Content** field and save

## AI Chat Setup

The chat feature requires at least one AI provider. Edit `backend/.env`:

```ini
# Use whichever you have — priority: Claude > Gemini > OpenAI > Ollama
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=AIza...
OPENAI_API_KEY=sk-...

# OR run Ollama locally (no API key needed):
# 1. Install from https://ollama.com
# 2. ollama pull llama3.2
# Ollama is auto-detected when running
```

## Home Direction

The front page is being rebuilt as a lighter retro control-room surface.
The old Three.js baseball scene has been removed from the active UI so the homepage stays faster and easier to evolve.
Any future retro game experiments can still live under [frontend/src/games/index.js](frontend/src/games/index.js) without driving the main landing page again.

## Docs

| File | What it covers |
|---|---|
| [docs/django_guide.md](docs/django_guide.md) | Django concepts explained through this project's code |
| [docs/react_guide.md](docs/react_guide.md) | React concepts explained through this project's code |
| [docs/bugs.md](docs/bugs.md) | Append-only log of every bug found: symptom, root cause, fix, lesson |
| [docs/refactor_log.md](docs/refactor_log.md) | Append-only implementation log for the production-hardening roadmap |

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/series/` | List all blog series |
| GET | `/api/series/{id}/` | One series with all its posts |
| GET | `/api/blogs/` | List all posts (filter: `?series_id=`) |
| GET | `/api/blogs/{slug}/` | Single post by slug |
| POST | `/api/chat/` | AI chat for a blog post |
| GET/POST | `/admin/` | Django admin CMS |
