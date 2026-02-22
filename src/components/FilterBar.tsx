import type { RepoHealth, RepoInfo } from "../types";

const HEALTH_OPTIONS: { value: RepoHealth; label: string; dot: string }[] = [
  { value: "clean", label: "Clean", dot: "bg-green-500" },
  { value: "dirty", label: "Changes", dot: "bg-yellow-500" },
  { value: "diverged", label: "Diverged", dot: "bg-red-500" },
  { value: "error", label: "Error", dot: "bg-gray-500" },
];

interface FilterBarProps {
  repos: RepoInfo[];
  activeFilters: Set<RepoHealth>;
  onToggleFilter: (health: RepoHealth) => void;
  search: string;
  onSearchChange: (value: string) => void;
}

export default function FilterBar({
  repos,
  activeFilters,
  onToggleFilter,
  search,
  onSearchChange,
}: FilterBarProps) {
  const counts = new Map<RepoHealth, number>();
  for (const repo of repos) {
    counts.set(repo.health, (counts.get(repo.health) ?? 0) + 1);
  }

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-1.5">
        {HEALTH_OPTIONS.map(({ value, label, dot }) => {
          const count = counts.get(value) ?? 0;
          const active = activeFilters.has(value);
          return (
            <button
              key={value}
              onClick={() => onToggleFilter(value)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition ${
                active
                  ? "border-slate-500 bg-slate-700 text-slate-200"
                  : "border-slate-700 bg-transparent text-slate-500 hover:border-slate-600 hover:text-slate-400"
              }`}
            >
              <span className={`inline-block h-2 w-2 rounded-full ${dot}`} />
              {label}
              <span className={active ? "text-slate-400" : "text-slate-600"}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <input
        type="text"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search repos..."
        className="ml-auto rounded-md border border-slate-700 bg-slate-800 px-3 py-1 text-sm text-slate-200 placeholder-slate-500 outline-none transition focus:border-slate-500 w-56"
      />
    </div>
  );
}
