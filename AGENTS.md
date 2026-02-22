# AGENTS.md — GitAtlas

## Project Overview

GitAtlas is a multi-repo Git observability desktop app. It scans the filesystem for Git repositories, displays their status on a dashboard, and provides a full-featured Git UI for each repo — commit history with visual graph, staging, branching, stashing, remote management, and more. Built with Tauri v2 (Rust backend) + React 19 + TypeScript frontend.

## Tech Stack

| Layer             | Technology                                                     |
|-------------------|----------------------------------------------------------------|
| Desktop framework | Tauri v2                                                       |
| Frontend          | React 19, TypeScript 5, Vite 6                                 |
| Styling           | Tailwind CSS v4 (`@tailwindcss/vite` plugin, no config file)   |
| Git operations    | git2 (libgit2 Rust bindings)                                   |
| Filesystem scan   | ignore + walkdir                                               |
| Database          | rusqlite (bundled SQLite, in-memory)                           |
| Config/cache      | JSON files in `~/.gitatlas/` (config.json, cache.json)         |
| Shell integration | tauri-plugin-shell (opening URLs in system browser)            |
| Error handling    | thiserror 2                                                    |

## Architecture

### Rust Backend (`src-tauri/src/`)

```
src/
├── main.rs               # Entry point → lib::run()
├── lib.rs                # AppState, Builder, command registration
├── error.rs              # AppError enum with Serialize impl for IPC
├── cache.rs              # Disk persistence: repo cache + config (scan roots)
├── commands/
│   ├── scan.rs           # scan_directories, get/set_scan_roots, load_cached_repos
│   ├── status.rs         # get_all_repos, get_repo_status
│   ├── operations.rs     # fetch_all, pull_all, fetch/pull/push per-repo
│   └── detail.rs         # 29 commands for repo detail operations
├── git/                  # Pure git logic (no Tauri dependency)
│   ├── discovery.rs      # Find .git dirs using ignore crate (max 5 levels deep)
│   ├── status.rs         # Branch, ahead/behind, dirty, stash count, remote URL
│   ├── operations.rs     # Fetch, pull (rebase), push via git2
│   └── detail.rs         # Commit log, diffs, staging, branches, stashes, remotes, profiles
├── db/
│   ├── mod.rs            # Database struct, schema init
│   ├── models.rs         # RepoInfo, CommitInfo, FileChange, BranchInfo, StashEntry, etc.
│   └── queries.rs        # upsert_repo, get_all_repos, clear_repos
└── scanner/
    └── mod.rs            # Multi-root scan orchestration
```

### Frontend (`src/`)

```
src/
├── main.tsx / App.tsx    # React entry
├── index.css             # Tailwind v4 import
├── types/
│   ├── repo.ts           # RepoInfo, RepoHealth
│   ├── detail.ts         # CommitInfo, FileChange, BranchInfo, StashEntry, RemoteInfo, GitProfile, etc.
│   └── index.ts          # Re-exports
├── hooks/
│   ├── useRepos.ts       # Scan, refresh, fetchAll, pullAll, cache loading on mount
│   ├── useRepoDetail.ts  # All detail operations (commits, staging, branches, stashes, remotes, profiles)
│   └── useRepoStatus.ts  # Single repo status
└── components/
    ├── Dashboard.tsx      # Main layout, scan root config, scan trigger, filter/search
    ├── RepoList.tsx       # Repo card grid
    ├── RepoCard.tsx       # Single repo card with status, GitHub link, quick actions
    ├── FilterBar.tsx      # Health filter toggles + search input
    ├── StatusBadge.tsx    # Health indicator dot
    ├── BulkActions.tsx    # Fetch All / Pull All buttons
    ├── GitHubLink.tsx     # Shared GitHub icon button using shell.open()
    └── detail/
        ├── RepoDetail.tsx  # Full-screen repo view with tabbed interface
        ├── FileChanges.tsx # Stage/unstage files, inline diffs
        ├── CommitGraph.tsx # Commit history list with visual graph overlay
        ├── CommitLog.tsx   # Commit list presentation
        ├── CommitForm.tsx  # Commit message input + submit
        ├── DiffViewer.tsx  # Unified diff display
        ├── BranchPanel.tsx # Create, checkout, delete, merge branches
        ├── StashPanel.tsx  # Save, pop, drop stashes
        ├── ReadmeViewer.tsx# Markdown README rendering
        └── graph/
            ├── computeGraph.ts  # Lane assignment algorithm with pass-through tracking
            └── GraphSvg.tsx     # SVG rendering: edges, pass-through lines, commit nodes
```

## Key Conventions

- **Crate name** is `gitatlas_lib`. The lib.rs is the crate root — use `crate::AppState`, not `crate::lib::AppState`.
- **IPC commands** are async, return `Result<T, AppError>`. `AppError` implements `Serialize` so Tauri can send it to the frontend.
- **AppState** holds a `Database` (in-memory SQLite with Mutex), registered via `tauri::Builder::manage()`.
- **Frontend IPC** uses `invoke()` from `@tauri-apps/api/core`. Type parameter matches the Rust return type.
- **External URLs** must use `open()` from `@tauri-apps/plugin-shell` — regular `<a href target="_blank">` does not work in Tauri.
- **Tailwind v4** — no `tailwind.config.js`. Uses `@import "tailwindcss"` in CSS and the `@tailwindcss/vite` plugin.
- **Scan root** is configurable and persisted in `~/.gitatlas/config.json`. Falls back to `$HOME/dev` if not set.
- **Repo cache** is written to `~/.gitatlas/cache.json` after every scan and bulk operation. Loaded on startup for instant display.
- **Remote URL** is extracted from each repo's `origin` remote and stored in `RepoInfo.remote_url` for GitHub link derivation.

## Data Flow

```
App Start
  → useRepos mount: invoke("load_cached_repos") → instant repo display
  → invoke("get_scan_roots") → show scan root path

User clicks "Scan for Repos"
  → invoke("scan_directories", { roots })
  → scanner::scan_roots() discovers .git dirs → get_repo_info() for each
  → Populate in-memory SQLite + write ~/.gitatlas/cache.json
  → Return Vec<RepoInfo> to frontend

User clicks a repo card
  → RepoDetail full-screen view
  → Tabs lazy-load data: commits, file changes, branches, stashes, readme
  → All operations via invoke() to detail.rs commands
```

## Build & Run

```sh
npm install              # Install frontend deps
npm run tauri dev        # Full dev mode (Rust + Vite + native window)
npm run dev              # Vite dev server only (no Rust)
```

```sh
cd src-tauri
cargo check              # Rust type checking
cargo build              # Full Rust build
```

```sh
npx tsc --noEmit         # TypeScript type checking (from project root)
```

## Detail Commands Reference

The `commands/detail.rs` module exposes 29 IPC commands:

**Commits**: get_commit_log, get_commit_diff, get_commit_files, get_file_history, squash_commits
**Staging**: get_file_changes, get_file_diff, stage_files, unstage_files, stage_all_files, unstage_all_files, create_commit
**Branches**: get_branches, checkout_branch, create_branch, delete_branch, merge_branch
**Stashes**: get_stashes, stash_save, stash_pop, stash_drop
**Remotes**: get_remotes, add_remote, remove_remote, rename_remote, get_pr_url
**Profile**: get_git_profile, set_git_profile
**Other**: get_readme
