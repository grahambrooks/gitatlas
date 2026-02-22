import { useState } from "react";
import type { StashEntry } from "../../types";

interface StashPanelProps {
  stashes: StashEntry[];
  onSave: (message: string) => Promise<void>;
  onPop: (index: number) => Promise<void>;
  onDrop: (index: number) => Promise<void>;
}

export default function StashPanel({ stashes, onSave, onPop, onDrop }: StashPanelProps) {
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(message.trim());
      setMessage("");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-700">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
          placeholder="Stash message (optional)"
          className="flex-1 rounded border border-slate-700 bg-slate-800 px-2 py-1 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-slate-500"
        />
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded bg-purple-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-purple-500 disabled:opacity-40"
        >
          {saving ? "..." : "Stash"}
        </button>
      </div>

      <div className="overflow-auto flex-1">
        {stashes.length === 0 ? (
          <p className="px-3 py-4 text-xs text-slate-500 text-center">No stashes</p>
        ) : (
          stashes.map((stash) => (
            <div
              key={stash.index}
              className="group flex items-center gap-2 px-3 py-2 text-xs border-b border-slate-700/30 hover:bg-slate-700/30 transition"
            >
              <span className="font-mono text-slate-500">#{stash.index}</span>
              <span className="flex-1 truncate text-slate-300">{stash.message}</span>
              <div className="hidden group-hover:flex items-center gap-1">
                <button
                  onClick={() => onPop(stash.index)}
                  className="rounded bg-slate-700 px-1.5 py-0.5 text-slate-300 hover:bg-slate-600"
                >
                  pop
                </button>
                <button
                  onClick={() => onDrop(stash.index)}
                  className="rounded bg-red-900/50 px-1.5 py-0.5 text-red-400 hover:bg-red-900"
                >
                  drop
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
