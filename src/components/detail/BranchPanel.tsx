import { useState } from "react";
import type { BranchInfo } from "../../types";

interface BranchPanelProps {
  branches: BranchInfo[];
  onCheckout: (name: string) => Promise<void>;
  onCreate: (name: string) => Promise<void>;
  onDelete: (name: string) => Promise<void>;
}

export default function BranchPanel({ branches, onCheckout, onCreate, onDelete }: BranchPanelProps) {
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  const localBranches = branches.filter((b) => !b.is_remote);
  const remoteBranches = branches.filter((b) => b.is_remote);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      await onCreate(newName.trim());
      setNewName("");
      setShowCreate(false);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-700">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
          Local
          <span className="ml-1.5 text-slate-500">{localBranches.length}</span>
        </span>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="text-xs text-slate-400 hover:text-slate-200 transition"
        >
          + New
        </button>
      </div>

      {showCreate && (
        <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-700/50">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            placeholder="branch-name"
            autoFocus
            className="flex-1 rounded border border-slate-700 bg-slate-800 px-2 py-1 text-xs font-mono text-slate-200 outline-none focus:border-slate-500"
          />
          <button
            onClick={handleCreate}
            disabled={!newName.trim() || creating}
            className="rounded bg-indigo-600 px-2 py-1 text-xs text-white disabled:opacity-40"
          >
            Create
          </button>
        </div>
      )}

      <div className="overflow-auto flex-1">
        {localBranches.map((branch) => (
          <BranchRow
            key={branch.name}
            branch={branch}
            onCheckout={onCheckout}
            onDelete={onDelete}
          />
        ))}
      </div>

      {remoteBranches.length > 0 && (
        <>
          <div className="px-3 py-2 border-t border-b border-slate-700">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
              Remote
              <span className="ml-1.5 text-slate-500">{remoteBranches.length}</span>
            </span>
          </div>
          <div className="overflow-auto flex-1">
            {remoteBranches.map((branch) => (
              <BranchRow
                key={branch.name}
                branch={branch}
                onCheckout={onCheckout}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function BranchRow({
  branch,
  onCheckout,
  onDelete,
}: {
  branch: BranchInfo;
  onCheckout: (name: string) => Promise<void>;
  onDelete?: (name: string) => Promise<void>;
}) {
  return (
    <div className="group flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-slate-700/30 transition">
      <span className={`flex-1 font-mono truncate ${branch.is_head ? "text-green-400 font-semibold" : "text-slate-300"}`}>
        {branch.is_head && "* "}
        {branch.name}
      </span>

      {branch.upstream && (
        <span className="text-slate-600 truncate max-w-24" title={branch.upstream}>
          {branch.upstream}
        </span>
      )}

      {!branch.is_head && (
        <div className="hidden group-hover:flex items-center gap-1">
          <button
            onClick={() => onCheckout(branch.name)}
            className="rounded bg-slate-700 px-1.5 py-0.5 text-slate-300 hover:bg-slate-600"
          >
            checkout
          </button>
          {onDelete && !branch.is_remote && (
            <button
              onClick={() => onDelete(branch.name)}
              className="rounded bg-red-900/50 px-1.5 py-0.5 text-red-400 hover:bg-red-900"
            >
              delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}
