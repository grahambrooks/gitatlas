import { useState, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import type { RepoInfo } from "../types";

export function useRepoStatus(path: string) {
  const [status, setStatus] = useState<RepoInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await invoke<RepoInfo>("get_repo_status", { path });
      setStatus(result);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, [path]);

  return { status, loading, error, refresh };
}
