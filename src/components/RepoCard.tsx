import { useState } from "react";
import type { RepoInfo } from "../types";
import StatusBadge from "./StatusBadge";

interface RepoCardProps {
  repo: RepoInfo;
  onFetch: (path: string) => Promise<void>;
  onPullRebase: (path: string) => Promise<void>;
  onPush: (path: string) => Promise<void>;
  onOpen: (repo: RepoInfo) => void;
}

export default function RepoCard({ repo, onFetch, onPullRebase, onPush, onOpen }: RepoCardProps) {
  const [busy, setBusy] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const run = async (label: string, action: (path: string) => Promise<void>) => {
    setBusy(label);
    setActionError(null);
    try {
      await action(repo.path);
    } catch (err) {
      setActionError(String(err));
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-slate-700 bg-slate-800/50 p-4 transition hover:border-slate-500">
      <div
        className="flex flex-col gap-3 cursor-pointer"
        onClick={() => onOpen(repo)}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-medium text-slate-100">{repo.name}</p>
            <p className="truncate text-xs text-slate-500 font-mono" title={repo.path}>
              {repo.path}
            </p>
          </div>
          <StatusBadge health={repo.health} />
        </div>

        <div className="flex items-center gap-2">
          <span className="truncate rounded bg-slate-700/60 px-2 py-0.5 text-xs font-mono text-blue-300">
            {repo.branch}
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400">
          {repo.ahead > 0 && (
            <span className="text-green-400" title="Commits ahead">
              ↑{repo.ahead}
            </span>
          )}
          {repo.behind > 0 && (
            <span className="text-red-400" title="Commits behind">
              ↓{repo.behind}
            </span>
          )}
          {repo.dirty_files > 0 && (
            <span className="text-yellow-400" title="Dirty files">
              ~{repo.dirty_files} changed
            </span>
          )}
          {repo.stash_count > 0 && (
            <span className="text-purple-400" title="Stashes">
              {repo.stash_count} stash
            </span>
          )}
          {repo.ahead === 0 && repo.behind === 0 && repo.dirty_files === 0 && repo.stash_count === 0 && (
            <span className="text-slate-500">Up to date</span>
          )}
        </div>
      </div>

      {actionError && (
        <p className="text-xs text-red-400 truncate" title={actionError}>
          {actionError}
        </p>
      )}

      <div className="flex items-center gap-2 border-t border-slate-700/50 pt-3">
        <ActionButton label="Fetch" busy={busy} onClick={() => run("Fetch", onFetch)} />
        <ActionButton label="Pull" busy={busy} onClick={() => run("Pull", onPullRebase)} />
        <ActionButton label="Push" busy={busy} onClick={() => run("Push", onPush)} />
      </div>
    </div>
  );
}

function ActionButton({
  label,
  busy,
  onClick,
}: {
  label: string;
  busy: string | null;
  onClick: () => void;
}) {
  const isThis = busy === label;
  const disabled = busy !== null;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex-1 rounded bg-slate-700/60 px-2 py-1 text-xs font-medium text-slate-300 transition hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {isThis ? `${label}...` : label}
    </button>
  );
}
