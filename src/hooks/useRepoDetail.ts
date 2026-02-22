import { useState, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import type {
  CommitInfo,
  FileChange,
  BranchInfo,
  StashEntry,
} from "../types";

export function useRepoDetail(repoPath: string) {
  const [commits, setCommits] = useState<CommitInfo[]>([]);
  const [changes, setChanges] = useState<FileChange[]>([]);
  const [branches, setBranches] = useState<BranchInfo[]>([]);
  const [stashes, setStashes] = useState<StashEntry[]>([]);
  const [diff, setDiff] = useState<string>("");
  const [readme, setReadme] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const withError = useCallback(async (fn: () => Promise<void>) => {
    setError(null);
    try {
      await fn();
    } catch (err) {
      setError(String(err));
    }
  }, []);

  // ── Commits ──

  const loadCommits = useCallback(
    async (count = 100) => {
      setLoading(true);
      await withError(async () => {
        const result = await invoke<CommitInfo[]>("get_commit_log", {
          path: repoPath,
          count,
        });
        setCommits(result);
      });
      setLoading(false);
    },
    [repoPath, withError],
  );

  const loadCommitDiff = useCallback(
    async (oid: string) => {
      await withError(async () => {
        const result = await invoke<string>("get_commit_diff", {
          path: repoPath,
          oid,
        });
        setDiff(result);
      });
    },
    [repoPath, withError],
  );

  // ── File changes ──

  const loadChanges = useCallback(async () => {
    await withError(async () => {
      const result = await invoke<FileChange[]>("get_file_changes", {
        path: repoPath,
      });
      setChanges(result);
    });
  }, [repoPath, withError]);

  const loadFileDiff = useCallback(
    async (filePath: string, staged: boolean) => {
      await withError(async () => {
        const result = await invoke<string>("get_file_diff", {
          path: repoPath,
          filePath,
          staged,
        });
        setDiff(result);
      });
    },
    [repoPath, withError],
  );

  // ── Staging ──

  const stageFiles = useCallback(
    async (files: string[]) => {
      await withError(async () => {
        const result = await invoke<FileChange[]>("stage_files", {
          path: repoPath,
          files,
        });
        setChanges(result);
      });
    },
    [repoPath, withError],
  );

  const unstageFiles = useCallback(
    async (files: string[]) => {
      await withError(async () => {
        const result = await invoke<FileChange[]>("unstage_files", {
          path: repoPath,
          files,
        });
        setChanges(result);
      });
    },
    [repoPath, withError],
  );

  const stageAll = useCallback(async () => {
    await withError(async () => {
      const result = await invoke<FileChange[]>("stage_all_files", {
        path: repoPath,
      });
      setChanges(result);
    });
  }, [repoPath, withError]);

  const unstageAll = useCallback(async () => {
    await withError(async () => {
      const result = await invoke<FileChange[]>("unstage_all_files", {
        path: repoPath,
      });
      setChanges(result);
    });
  }, [repoPath, withError]);

  // ── Commit ──

  const createCommit = useCallback(
    async (message: string) => {
      await withError(async () => {
        await invoke<string>("create_commit", { path: repoPath, message });
        await loadChanges();
        await loadCommits();
      });
    },
    [repoPath, withError, loadChanges, loadCommits],
  );

  // ── Branches ──

  const loadBranches = useCallback(async () => {
    await withError(async () => {
      const result = await invoke<BranchInfo[]>("get_branches", {
        path: repoPath,
      });
      setBranches(result);
    });
  }, [repoPath, withError]);

  const checkoutBranch = useCallback(
    async (branchName: string) => {
      await withError(async () => {
        await invoke("checkout_branch", {
          path: repoPath,
          branchName,
        });
        await loadBranches();
      });
    },
    [repoPath, withError, loadBranches],
  );

  const createBranch = useCallback(
    async (branchName: string) => {
      await withError(async () => {
        await invoke("create_branch", { path: repoPath, branchName });
        await loadBranches();
      });
    },
    [repoPath, withError, loadBranches],
  );

  const deleteBranch = useCallback(
    async (branchName: string) => {
      await withError(async () => {
        await invoke("delete_branch", { path: repoPath, branchName });
        await loadBranches();
      });
    },
    [repoPath, withError, loadBranches],
  );

  // ── Remote operations ──

  const showSuccess = useCallback((msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3000);
  }, []);

  const fetchRemote = useCallback(async () => {
    setLoading(true);
    setLoadingAction("Fetching…");
    await withError(async () => {
      await invoke("fetch_repo", { path: repoPath });
      await loadCommits();
      await loadBranches();
      showSuccess("Fetch complete");
    });
    setLoadingAction(null);
    setLoading(false);
  }, [repoPath, withError, loadCommits, loadBranches, showSuccess]);

  const pullRebase = useCallback(async () => {
    setLoading(true);
    setLoadingAction("Pulling…");
    await withError(async () => {
      await invoke("pull_rebase_repo", { path: repoPath });
      await loadCommits();
      await loadChanges();
      await loadBranches();
      showSuccess("Pull complete");
    });
    setLoadingAction(null);
    setLoading(false);
  }, [repoPath, withError, loadCommits, loadChanges, loadBranches, showSuccess]);

  const push = useCallback(async () => {
    setLoading(true);
    setLoadingAction("Pushing…");
    await withError(async () => {
      await invoke("push_repo", { path: repoPath });
      await loadCommits();
      showSuccess("Push complete");
    });
    setLoadingAction(null);
    setLoading(false);
  }, [repoPath, withError, loadCommits, showSuccess]);

  // ── Stashes ──

  const loadStashes = useCallback(async () => {
    await withError(async () => {
      const result = await invoke<StashEntry[]>("get_stashes", {
        path: repoPath,
      });
      setStashes(result);
    });
  }, [repoPath, withError]);

  const saveStash = useCallback(
    async (message: string) => {
      await withError(async () => {
        await invoke("stash_save", { path: repoPath, message });
        await loadStashes();
        await loadChanges();
      });
    },
    [repoPath, withError, loadStashes, loadChanges],
  );

  const popStash = useCallback(
    async (index: number) => {
      await withError(async () => {
        await invoke("stash_pop", { path: repoPath, index });
        await loadStashes();
        await loadChanges();
      });
    },
    [repoPath, withError, loadStashes, loadChanges],
  );

  const dropStash = useCallback(
    async (index: number) => {
      await withError(async () => {
        await invoke("stash_drop", { path: repoPath, index });
        await loadStashes();
      });
    },
    [repoPath, withError, loadStashes],
  );

  // ── README ──

  const loadReadme = useCallback(async () => {
    await withError(async () => {
      const result = await invoke<string | null>("get_readme", {
        path: repoPath,
      });
      setReadme(result);
    });
  }, [repoPath, withError]);

  return {
    commits,
    changes,
    branches,
    stashes,
    diff,
    readme,
    loading,
    loadingAction,
    error,
    successMessage,
    setDiff,
    loadCommits,
    loadCommitDiff,
    loadChanges,
    loadFileDiff,
    stageFiles,
    unstageFiles,
    stageAll,
    unstageAll,
    createCommit,
    loadBranches,
    checkoutBranch,
    createBranch,
    deleteBranch,
    fetchRemote,
    pullRebase,
    push,
    loadStashes,
    saveStash,
    popStash,
    dropStash,
    loadReadme,
  };
}
