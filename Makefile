.PHONY: dev build check check-rs check-ts lint fmt clean update update-npm update-cargo update-all help

# ── Development ──────────────────────────────────────────────

dev: ## Run full Tauri dev (Rust + Vite)
	npm run tauri dev

dev-fe: ## Run Vite dev server only (no Rust)
	npm run dev

# ── Build ────────────────────────────────────────────────────

build: ## Production build
	npm run tauri build

build-debug: ## Debug build (faster, unoptimized)
	npm run tauri build -- --debug

# ── Check / Lint ─────────────────────────────────────────────

check: check-rs check-ts ## Run all checks

check-rs: ## Rust type check
	cd src-tauri && cargo check

check-ts: ## TypeScript type check
	npx tsc -b --noEmit

lint-rs: ## Rust lints
	cd src-tauri && cargo clippy -- -D warnings

fmt: ## Format all code
	cd src-tauri && cargo fmt

fmt-check: ## Check formatting without writing
	cd src-tauri && cargo fmt -- --check

# ── Clean ────────────────────────────────────────────────────

clean: ## Remove build artifacts
	cd src-tauri && cargo clean
	rm -rf dist

clean-all: clean ## Remove build artifacts and node_modules
	rm -rf node_modules

# ── Dependencies ─────────────────────────────────────────────

install: ## Install all dependencies
	npm install

update: update-npm update-cargo ## Update all dependencies

update-npm: ## Update npm dependencies
	npm update
	npm outdated || true

update-cargo: ## Update Rust dependencies
	cd src-tauri && cargo update

outdated: ## Show outdated dependencies
	@echo "── npm ──"
	npm outdated || true
	@echo ""
	@echo "── cargo ──"
	cd src-tauri && cargo outdated 2>/dev/null || echo "install cargo-outdated: cargo install cargo-outdated"

# ── Help ─────────────────────────────────────────────────────

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-14s\033[0m %s\n", $$1, $$2}'

.DEFAULT_GOAL := help
