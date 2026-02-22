import { useState, useEffect, useMemo } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useRepos } from "../hooks/useRepos";
import type { RepoHealth, RepoInfo } from "../types";
import FilterBar from "./FilterBar";
import RepoList from "./RepoList";
import BulkActions from "./BulkActions";
import GitHubLink from "./GitHubLink";
import RepoDetail from "./detail/RepoDetail";

export default function Dashboard() {
  const {
    repos, loading, error,
    scanRepos, fetchAll, pullAll,
    fetchRepo, pullRebaseRepo, pushRepo,
  } = useRepos();
  const [scanRoots, setScanRoots] = useState<string[]>([]);
  const [activeFilters, setActiveFilters] = useState<Set<RepoHealth>>(new Set());
  const [search, setSearch] = useState("");
  const [selectedRepo, setSelectedRepo] = useState<RepoInfo | null>(null);

  useEffect(() => {
    invoke<string[]>("get_scan_roots").then(setScanRoots).catch(() => {});
  }, []);

  const handleScan = () => {
    if (scanRoots.length > 0) {
      scanRepos(scanRoots);
    }
  };

  const toggleFilter = (health: RepoHealth) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(health)) {
        next.delete(health);
      } else {
        next.add(health);
      }
      return next;
    });
  };

  const filteredRepos = useMemo(() => {
    let result = repos;

    if (activeFilters.size > 0) {
      result = result.filter((r) => activeFilters.has(r.health));
    }

    const query = search.trim().toLowerCase();
    if (query) {
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(query) ||
          r.branch.toLowerCase().includes(query) ||
          r.path.toLowerCase().includes(query),
      );
    }

    return result;
  }, [repos, activeFilters, search]);

  // Show detail view as fullscreen overlay
  if (selectedRepo) {
    return (
      <RepoDetail
        repo={selectedRepo}
        onClose={() => setSelectedRepo(null)}
      />
    );
  }

  return (
    <div className="px-6 py-8">
      <header className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white">GitAtlas</h1>
            <p className="text-sm text-slate-400">
              Multi-repo observability dashboard
            </p>
          </div>
          <GitHubLink url="https://github.com/grahambrooks/gitatlas" className="h-5 w-5" />
        </div>
        <div className="flex items-center gap-3">
          <BulkActions
            onFetchAll={fetchAll}
            onPullAll={pullAll}
            disabled={loading}
            repoCount={repos.length}
          />
          <button
            onClick={handleScan}
            disabled={loading || scanRoots.length === 0}
            className="rounded-md bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Scanning..." : "Scan for Repos"}
          </button>
        </div>
      </header>

      {error && (
        <div className="mb-4 rounded-md bg-red-900/30 border border-red-800 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {repos.length > 0 && (
        <FilterBar
          repos={repos}
          activeFilters={activeFilters}
          onToggleFilter={toggleFilter}
          search={search}
          onSearchChange={setSearch}
        />
      )}

      <div className="mb-4 text-sm text-slate-500">
        {repos.length === 0
          ? "No repositories scanned yet"
          : filteredRepos.length === repos.length
            ? `${repos.length} repositories`
            : `${filteredRepos.length} of ${repos.length} repositories`}
      </div>

      <RepoList
        repos={filteredRepos}
        onFetch={fetchRepo}
        onPullRebase={pullRebaseRepo}
        onPush={pushRepo}
        onOpen={setSelectedRepo}
      />
    </div>
  );
}
