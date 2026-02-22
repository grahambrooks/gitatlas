import type { RepoHealth } from "../types";

const healthConfig: Record<RepoHealth, { color: string; label: string }> = {
  clean: { color: "bg-green-500", label: "Clean" },
  dirty: { color: "bg-yellow-500", label: "Changes" },
  diverged: { color: "bg-red-500", label: "Diverged" },
  error: { color: "bg-gray-600", label: "Error" },
};

interface StatusBadgeProps {
  health: RepoHealth;
}

export default function StatusBadge({ health }: StatusBadgeProps) {
  const config = healthConfig[health];
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`inline-block h-2.5 w-2.5 rounded-full ${config.color}`} />
      <span className="text-xs text-slate-400">{config.label}</span>
    </span>
  );
}
