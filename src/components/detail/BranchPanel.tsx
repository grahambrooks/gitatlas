import { useState } from "react";
import type { BranchInfo, RemoteInfo } from "../../types";

interface BranchPanelProps {
  branches: BranchInfo[];
  onCheckout: (name: string) => Promise<void>;
  onCreate: (name: string) => Promise<void>;
  onDelete: (name: string) => Promise<void>;
  onMerge?: (name: string) => Promise<void>;
  remotes?: RemoteInfo[];
  onAddRemote?: (name: string, url: string) => Promise<void>;
  onRemoveRemote?: (name: string) => Promise<void>;
  onRenameRemote?: (oldName: string, newName: string) => Promise<void>;
}

export default function BranchPanel({
  branches,
  onCheckout,
  onCreate,
  onDelete,
  onMerge,
  remotes,
  onAddRemote,
  onRemoveRemote,
  onRenameRemote,
}: BranchPanelProps) {
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
            onMerge={onMerge}
          />
        ))}
      </div>

      {remoteBranches.length > 0 && (
        <>
          <div className="px-3 py-2 border-t border-b border-slate-700">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
              Remote Branches
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

      {/* Remotes section */}
      {remotes && (
        <RemotesSection
          remotes={remotes}
          onAdd={onAddRemote}
          onRemove={onRemoveRemote}
          onRename={onRenameRemote}
        />
      )}
    </div>
  );
}

function BranchRow({
  branch,
  onCheckout,
  onDelete,
  onMerge,
}: {
  branch: BranchInfo;
  onCheckout: (name: string) => Promise<void>;
  onDelete?: (name: string) => Promise<void>;
  onMerge?: (name: string) => Promise<void>;
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
          {onMerge && !branch.is_remote && (
            <button
              onClick={() => onMerge(branch.name)}
              className="rounded bg-purple-900/50 px-1.5 py-0.5 text-purple-300 hover:bg-purple-900"
            >
              merge
            </button>
          )}
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

function RemotesSection({
  remotes,
  onAdd,
  onRemove,
  onRename,
}: {
  remotes: RemoteInfo[];
  onAdd?: (name: string, url: string) => Promise<void>;
  onRemove?: (name: string) => Promise<void>;
  onRename?: (oldName: string, newName: string) => Promise<void>;
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [addName, setAddName] = useState("");
  const [addUrl, setAddUrl] = useState("");
  const [renamingRemote, setRenamingRemote] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const handleAdd = async () => {
    if (!addName.trim() || !addUrl.trim() || !onAdd) return;
    await onAdd(addName.trim(), addUrl.trim());
    setAddName("");
    setAddUrl("");
    setShowAdd(false);
  };

  const handleRename = async (oldName: string) => {
    if (!renameValue.trim() || !onRename) return;
    await onRename(oldName, renameValue.trim());
    setRenamingRemote(null);
    setRenameValue("");
  };

  return (
    <>
      <div className="flex items-center justify-between px-3 py-2 border-t border-b border-slate-700">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
          Remotes
          <span className="ml-1.5 text-slate-500">{remotes.length}</span>
        </span>
        {onAdd && (
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="text-xs text-slate-400 hover:text-slate-200 transition"
          >
            + Add
          </button>
        )}
      </div>

      {showAdd && (
        <div className="flex flex-col gap-1.5 px-3 py-2 border-b border-slate-700/50">
          <input
            value={addName}
            onChange={(e) => setAddName(e.target.value)}
            placeholder="name (e.g. upstream)"
            className="rounded border border-slate-700 bg-slate-800 px-2 py-1 text-xs font-mono text-slate-200 outline-none focus:border-slate-500"
          />
          <input
            value={addUrl}
            onChange={(e) => setAddUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="https://github.com/user/repo.git"
            className="rounded border border-slate-700 bg-slate-800 px-2 py-1 text-xs font-mono text-slate-200 outline-none focus:border-slate-500"
          />
          <button
            onClick={handleAdd}
            disabled={!addName.trim() || !addUrl.trim()}
            className="self-end rounded bg-indigo-600 px-2 py-1 text-xs text-white disabled:opacity-40"
          >
            Add Remote
          </button>
        </div>
      )}

      <div className="overflow-auto flex-1">
        {remotes.length === 0 ? (
          <p className="px-3 py-2 text-xs text-slate-600">No remotes configured</p>
        ) : (
          remotes.map((remote) => (
            <div key={remote.name} className="group flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-slate-700/30 transition">
              {renamingRemote === remote.name ? (
                <input
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleRename(remote.name);
                    if (e.key === "Escape") setRenamingRemote(null);
                  }}
                  onBlur={() => setRenamingRemote(null)}
                  autoFocus
                  className="flex-1 rounded border border-slate-700 bg-slate-800 px-1 py-0.5 text-xs font-mono text-slate-200 outline-none focus:border-slate-500"
                />
              ) : (
                <>
                  <span className="font-mono font-semibold text-slate-300">{remote.name}</span>
                  <span className="flex-1 font-mono text-slate-500 truncate" title={remote.url}>
                    {remote.url}
                  </span>
                </>
              )}
              <div className="hidden group-hover:flex items-center gap-1">
                {onRename && (
                  <button
                    onClick={() => {
                      setRenamingRemote(remote.name);
                      setRenameValue(remote.name);
                    }}
                    className="rounded bg-slate-700 px-1.5 py-0.5 text-slate-300 hover:bg-slate-600"
                  >
                    rename
                  </button>
                )}
                {onRemove && (
                  <button
                    onClick={() => onRemove(remote.name)}
                    className="rounded bg-red-900/50 px-1.5 py-0.5 text-red-400 hover:bg-red-900"
                  >
                    remove
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
