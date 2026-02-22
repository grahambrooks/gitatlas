# GitAtlas

A desktop app for developers who work across many Git repositories. GitAtlas scans your filesystem, discovers every repo, and shows their status on a single dashboard — branch names, ahead/behind counts, uncommitted changes, and health at a glance.

Built with Tauri v2 (Rust) and React.

## Features

- **Repo Discovery** — Automatically finds Git repositories under configurable root directories
- **Status Dashboard** — See branch, ahead/behind, dirty files, and stash count for every repo in one view
- **Health Indicators** — Color-coded badges: clean, local changes, diverged, or error
- **Bulk Operations** — Fetch or pull all repositories with one click

## Screenshot

```
┌──────────────────────────────────────────────────────────┐
│  GitAtlas                          [Fetch All] [Scan]    │
│  Multi-repo observability dashboard                      │
├──────────────────────────────────────────────────────────┤
│  my-api          main   ↑2  ↓5           ● Diverged     │
│  frontend-app    dev         ~3           ● Changes      │
│  auth-service    main                     ● Clean        │
│  shared-utils    feat   ↑1               ● Changes      │
└──────────────────────────────────────────────────────────┘
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Rust](https://rustup.rs/) (stable)
- Tauri v2 system dependencies — see [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/)

### Install & Run

```sh
npm install
npm run tauri dev
```

This starts the Vite dev server and compiles the Rust backend, then opens a native desktop window. Click **"Scan for Repos"** to discover Git repositories under `~/dev`.

### Build for Production

```sh
npm run tauri build
```

Produces a native app bundle in `src-tauri/target/release/bundle/`.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Desktop framework | Tauri v2 |
| Frontend | React 19, TypeScript, Tailwind CSS v4 |
| Build tool | Vite 6 |
| Git engine | git2 (libgit2) |
| Filesystem scan | ignore + walkdir |
| Database | SQLite (rusqlite) |

## Project Structure

```
gitatlas/
├── src/                  # React frontend
│   ├── components/       # Dashboard, RepoList, RepoCard, StatusBadge, BulkActions
│   ├── hooks/            # useRepos, useRepoStatus (Tauri IPC)
│   └── types/            # TypeScript types matching Rust models
├── src-tauri/            # Rust backend
│   └── src/
│       ├── commands/     # Tauri IPC handlers
│       ├── git/          # Discovery, status, fetch/pull
│       ├── db/           # SQLite models and queries
│       └── scanner/      # Multi-root scan orchestration
├── package.json
└── vite.config.ts
```

## License

MIT
