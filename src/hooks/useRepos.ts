import { useState, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import type { RepoInfo } from "../types";

export function useRepos() {
  const [repos, setRepos] = useState<RepoInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateRepo = useCallback((updated: RepoInfo) => {
    setRepos((prev) =>
      prev.map((r) => (r.path === updated.path ? updated : r)),
    );
  }, []);

  const scanRepos = useCallback(async (roots: string[]) => {
    setLoading(true);
    setError(null);
    try {
      const result = await invoke<RepoInfo[]>("scan_directories", { roots });
      setRepos(result);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshRepos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await invoke<RepoInfo[]>("get_all_repos");
      setRepos(result);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await invoke<RepoInfo[]>("fetch_all");
      setRepos(result);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const pullAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await invoke<RepoInfo[]>("pull_all");
      setRepos(result);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRepo = useCallback(
    async (path: string) => {
      const updated = await invoke<RepoInfo>("fetch_repo", { path });
      updateRepo(updated);
    },
    [updateRepo],
  );

  const pullRebaseRepo = useCallback(
    async (path: string) => {
      const updated = await invoke<RepoInfo>("pull_rebase_repo", { path });
      updateRepo(updated);
    },
    [updateRepo],
  );

  const pushRepo = useCallback(
    async (path: string) => {
      const updated = await invoke<RepoInfo>("push_repo", { path });
      updateRepo(updated);
    },
    [updateRepo],
  );

  return {
    repos,
    loading,
    error,
    scanRepos,
    refreshRepos,
    fetchAll,
    pullAll,
    fetchRepo,
    pullRebaseRepo,
    pushRepo,
  };
}
