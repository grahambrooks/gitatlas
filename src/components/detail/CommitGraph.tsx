import { useMemo, useCallback } from "react";
import type { CommitInfo, RefLabel } from "../../types";
import { computeGraph } from "./graph/computeGraph";
import GraphSvg, { ROW_HEIGHT, LANE_WIDTH, LEFT_PAD } from "./graph/GraphSvg";

interface CommitGraphProps {
  commits: CommitInfo[];
  selectedOid: string | null;
  onSelect: (oid: string) => void;
  onMergeDrop?: (sourceBranch: string, targetOid: string) => void;
}

const REF_COLORS: Record<string, { bg: string; text: string }> = {
  head: { bg: "bg-green-600", text: "text-white" },
  local: { bg: "bg-blue-600", text: "text-white" },
  remote: { bg: "bg-slate-600", text: "text-slate-200" },
  tag: { bg: "bg-amber-600", text: "text-white" },
};

function avatarColor(email: string): string {
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    hash = email.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 55%, 45%)`;
}

export default function CommitGraph({ commits, selectedOid, onSelect, onMergeDrop }: CommitGraphProps) {
  const { laneCount } = useMemo(() => computeGraph(commits), [commits]);
  const graphWidth = LEFT_PAD + laneCount * LANE_WIDTH + 12;

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, targetOid: string) => {
      e.preventDefault();
      const sourceBranch = e.dataTransfer.getData("text/plain");
      if (sourceBranch && onMergeDrop) {
        onMergeDrop(sourceBranch, targetOid);
      }
    },
    [onMergeDrop],
  );

  if (commits.length === 0) {
    return (
      <div className="p-4 text-sm text-slate-500">No commits found</div>
    );
  }

  return (
    <div className="relative overflow-auto h-full">
      {/* SVG layer */}
      <GraphSvg commits={commits} width={graphWidth} />

      {/* Commit rows on top of SVG */}
      <div className="relative" style={{ paddingLeft: graphWidth }}>
        {commits.map((commit) => {
          const isSelected = selectedOid === commit.oid;
          const date = new Date(commit.date);
          const relDate = formatRelative(date);
          const initial = (commit.author[0] || "?").toUpperCase();
          const color = avatarColor(commit.author_email);

          return (
            <button
              key={commit.oid}
              onClick={() => onSelect(commit.oid)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, commit.oid)}
              className={`flex items-center w-full text-left transition ${
                isSelected
                  ? "bg-indigo-600/20"
                  : "hover:bg-slate-700/20"
              }`}
              style={{ height: ROW_HEIGHT }}
            >
              {/* Avatar */}
              <div
                className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white ml-2"
                style={{ backgroundColor: color }}
                title={commit.author}
              >
                {initial}
              </div>

              <div className="flex flex-col gap-0.5 px-3 py-1 min-w-0 flex-1">
                <div className="flex items-center gap-2 min-w-0">
                  <p className="text-sm text-slate-200 leading-snug truncate">
                    {commit.message.split("\n")[0]}
                  </p>
                  {commit.refs.length > 0 && (
                    <div className="flex items-center gap-1 shrink-0">
                      {commit.refs.map((ref) => (
                        <RefBadge key={`${ref.kind}-${ref.name}`} refLabel={ref} />
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="font-mono text-slate-400">{commit.short_oid}</span>
                  <span className="truncate">{commit.author}</span>
                  <span className="ml-auto shrink-0">{relDate}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function RefBadge({ refLabel }: { refLabel: RefLabel }) {
  const colors = REF_COLORS[refLabel.kind] ?? REF_COLORS.local;
  const display = refLabel.kind === "head"
    ? `HEAD \u2192 ${refLabel.name}`
    : refLabel.name;

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", refLabel.name);
    e.dataTransfer.effectAllowed = "move";
  };

  const isDraggable = refLabel.kind === "local" || refLabel.kind === "remote";

  return (
    <span
      draggable={isDraggable}
      onDragStart={isDraggable ? handleDragStart : undefined}
      className={`inline-flex items-center rounded px-1.5 py-0 text-[10px] font-semibold leading-4 ${colors.bg} ${colors.text} ${isDraggable ? "cursor-grab active:cursor-grabbing" : ""}`}
    >
      {display}
    </span>
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
