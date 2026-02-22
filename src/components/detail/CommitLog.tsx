import type { CommitInfo } from "../../types";

interface CommitLogProps {
  commits: CommitInfo[];
  selectedOid: string | null;
  onSelect: (oid: string) => void;
}

export default function CommitLog({ commits, selectedOid, onSelect }: CommitLogProps) {
  if (commits.length === 0) {
    return (
      <div className="p-4 text-sm text-slate-500">No commits found</div>
    );
  }

  return (
    <div className="flex flex-col divide-y divide-slate-700/50">
      {commits.map((commit) => {
        const isSelected = selectedOid === commit.oid;
        const date = new Date(commit.date);
        const relDate = formatRelative(date);

        return (
          <button
            key={commit.oid}
            onClick={() => onSelect(commit.oid)}
            className={`flex flex-col gap-0.5 px-3 py-2 text-left transition ${
              isSelected
                ? "bg-indigo-600/20 border-l-2 border-indigo-400"
                : "hover:bg-slate-700/30 border-l-2 border-transparent"
            }`}
          >
            <p className="text-sm text-slate-200 leading-snug line-clamp-2">
              {commit.message.split("\n")[0]}
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="font-mono text-slate-400">{commit.short_oid}</span>
              <span>{commit.author}</span>
              <span className="ml-auto">{relDate}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function formatRelative(date: Date): string {
  const now = Date.now();
  const diff = now - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}
