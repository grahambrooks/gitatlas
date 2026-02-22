# AGENTS.md — GitAtlas

## Project Overview

GitAtlas is a multi-repo Git observability desktop app. It scans the filesystem for Git repositories, displays their status on a single dashboard, and supports bulk operations (fetch all, pull all). Built with Tauri v2 (Rust backend) + React 19 + TypeScript frontend.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Desktop framework | Tauri v2 |
| Frontend | React 19, TypeScript 5, Vite 6 |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite` plugin, no config file) |
| Git operations | git2 (libgit2 Rust bindings) |
| Filesystem scanning | ignore + walkdir |
| Database | rusqlite (bundled SQLite, currently in-memory) |
| Error handling | thiserror 2 |

## Architecture

### Rust Backend (`src-tauri/src/`)

```
src/
├── main.rs               # Entry point → lib::run()
├── lib.rs                 # AppState, Builder, command registration
├── error.rs               # AppError enum with Serialize impl for IPC
├── commands/              # Tauri IPC command handlers
│   ├── scan.rs            # scan_directories, get_scan_roots
│   ├── status.rs          # get_all_repos, get_repo_status
│   └── operations.rs      # fetch_all, pull_all
├── git/                   # Pure git logic (no Tauri dependency)
│   ├── discovery.rs       # Find .git dirs using ignore crate
│   ├── status.rs          # Branch, ahead/behind, dirty, stash count
│   └── operations.rs      # fetch, pull via git2
├── db/                    # SQLite persistence
│   ├── mod.rs             # Database struct, schema init
│   ├── models.rs          # RepoInfo, RepoHealth
│   └── queries.rs         # CRUD operations
└── scanner/
    └── mod.rs             # Multi-root scan orchestration
```

### Frontend (`src/`)

```
src/
├── main.tsx / App.tsx     # React entry
├── index.css              # Tailwind v4 import
├── types/                 # TypeScript types mirroring Rust models
│   └── repo.ts            # RepoInfo, RepoHealth
├── hooks/                 # Data fetching via Tauri IPC
│   ├── useRepos.ts        # scan, refresh, fetchAll, pullAll
│   └── useRepoStatus.ts   # Single repo status
└── components/
    ├── Dashboard.tsx       # Main layout, scan trigger
    ├── RepoList.tsx        # Repo grid
    ├── RepoCard.tsx        # Single repo row
    ├── StatusBadge.tsx     # Health indicator dot
    └── BulkActions.tsx     # Fetch All / Pull All buttons
```

## Key Conventions

- **Crate name** is `gitatlas_lib`. The lib.rs is the crate root — use `crate::AppState`, not `crate::lib::AppState`.
- **IPC commands** are async, return `Result<T, AppError>`. `AppError` implements `Serialize` so Tauri can send it to the frontend.
- **AppState** holds a `Database` (in-memory SQLite with Mutex), registered via `tauri::Builder::manage()`.
- **Frontend IPC** uses `invoke()` from `@tauri-apps/api/core`. Type parameter matches the Rust return type.
- **Tailwind v4** — no `tailwind.config.js`. Uses `@import "tailwindcss"` in CSS and the `@tailwindcss/vite` plugin.
- **Pull = fetch only** for MVP safety. Full merge/rebase is Phase 2.
- **Default scan root** is `$HOME/dev`, resolved server-side in `get_scan_roots`.

## Build & Run

```sh
npm install              # Install frontend deps
npm run tauri dev        # Full dev mode (Rust + Vite + native window)
npm run dev              # Vite dev server only (no Rust)
npm run build            # Frontend production build
```

```sh
cd src-tauri
cargo check              # Rust type checking
cargo build              # Full Rust build
cargo test               # Run Rust tests (when added)
```

## Roadmap

### Current (MVP)
- Repo discovery via filesystem scan
- Global status dashboard (branch, ahead/behind, dirty, stash)
- Health indicators (clean/dirty/diverged/error)
- Bulk fetch/pull

### Phase 2 — Observability
- Commit velocity, staleness, branch churn metrics
- Repo dependency mapping
- Smart alerts ("repo hasn't been pulled in 14 days")
- Persistent file-based SQLite database
- Configurable scan roots (settings panel)

### Phase 3 — AI + DevEx
- Natural language summaries ("what changed across all repos today")
- Cross-repo refactor suggestions
- Risk detection (bus factor, stale ownership)
