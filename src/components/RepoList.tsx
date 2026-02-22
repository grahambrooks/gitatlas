import type { RepoInfo } from "../types";
import RepoCard from "./RepoCard";

interface RepoListProps {
  repos: RepoInfo[];
  onFetch: (path: string) => Promise<void>;
  onPullRebase: (path: string) => Promise<void>;
  onPush: (path: string) => Promise<void>;
  onOpen: (repo: RepoInfo) => void;
}

export default function RepoList({ repos, onFetch, onPullRebase, onPush, onOpen }: RepoListProps) {
  if (repos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-500">
        <p className="text-lg">No repositories found</p>
        <p className="text-sm mt-1">Click "Scan for Repos" to discover Git repositories</p>
      </div>
    );
  }

  return (
    <div
      className="grid gap-3"
      style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}
    >
      {repos.map((repo) => (
        <RepoCard
          key={repo.path}
          repo={repo}
          onFetch={onFetch}
          onPullRebase={onPullRebase}
          onPush={onPush}
          onOpen={onOpen}
        />
      ))}
    </div>
  );
}
