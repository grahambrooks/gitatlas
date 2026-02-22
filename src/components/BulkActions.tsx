interface BulkActionsProps {
  onFetchAll: () => void;
  onPullAll: () => void;
  disabled: boolean;
  repoCount: number;
}

export default function BulkActions({
  onFetchAll,
  onPullAll,
  disabled,
  repoCount,
}: BulkActionsProps) {
  if (repoCount === 0) return null;

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onFetchAll}
        disabled={disabled}
        className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Fetch All
      </button>
      <button
        onClick={onPullAll}
        disabled={disabled}
        className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Pull All
      </button>
    </div>
  );
}
