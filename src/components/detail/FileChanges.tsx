import type { FileChange, FileStatus } from "../../types";

interface FileChangesProps {
  changes: FileChange[];
  selectedFile: string | null;
  onSelectFile: (path: string, staged: boolean) => void;
  onStageFiles: (files: string[]) => void;
  onUnstageFiles: (files: string[]) => void;
  onStageAll: () => void;
  onUnstageAll: () => void;
}

const STATUS_LABELS: Record<FileStatus, { letter: string; color: string }> = {
  added: { letter: "A", color: "text-green-400" },
  modified: { letter: "M", color: "text-yellow-400" },
  deleted: { letter: "D", color: "text-red-400" },
  renamed: { letter: "R", color: "text-blue-400" },
  untracked: { letter: "?", color: "text-slate-400" },
  conflicted: { letter: "!", color: "text-red-500" },
};

export default function FileChanges({
  changes,
  selectedFile,
  onSelectFile,
  onStageFiles,
  onUnstageFiles,
  onStageAll,
  onUnstageAll,
}: FileChangesProps) {
  const staged = changes.filter((c) => c.staged);
  const unstaged = changes.filter((c) => !c.staged);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Staged */}
      <Section
        title="Staged"
        count={staged.length}
        action={staged.length > 0 ? { label: "Unstage All", onClick: onUnstageAll } : undefined}
      >
        {staged.map((file) => (
          <FileRow
            key={`staged-${file.path}`}
            file={file}
            isSelected={selectedFile === file.path}
            onSelect={() => onSelectFile(file.path, true)}
            onAction={() => onUnstageFiles([file.path])}
            actionLabel="−"
            actionTitle="Unstage"
          />
        ))}
      </Section>

      {/* Unstaged */}
      <Section
        title="Changes"
        count={unstaged.length}
        action={unstaged.length > 0 ? { label: "Stage All", onClick: onStageAll } : undefined}
      >
        {unstaged.map((file) => (
          <FileRow
            key={`unstaged-${file.path}`}
            file={file}
            isSelected={selectedFile === file.path}
            onSelect={() => onSelectFile(file.path, false)}
            onAction={() => onStageFiles([file.path])}
            actionLabel="+"
            actionTitle="Stage"
          />
        ))}
      </Section>
    </div>
  );
}

function Section({
  title,
  count,
  action,
  children,
}: {
  title: string;
  count: number;
  action?: { label: string; onClick: () => void };
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-0 flex-1">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-700">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
          {title}
          <span className="ml-1.5 text-slate-500">{count}</span>
        </span>
        {action && (
          <button
            onClick={action.onClick}
            className="text-xs text-slate-400 hover:text-slate-200 transition"
          >
            {action.label}
          </button>
        )}
      </div>
      <div className="overflow-auto flex-1">
        {count === 0 ? (
          <p className="px-3 py-2 text-xs text-slate-600">No files</p>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

function FileRow({
  file,
  isSelected,
  onSelect,
  onAction,
  actionLabel,
  actionTitle,
}: {
  file: FileChange;
  isSelected: boolean;
  onSelect: () => void;
  onAction: () => void;
  actionLabel: string;
  actionTitle: string;
}) {
  const { letter, color } = STATUS_LABELS[file.status];

  return (
    <div
      className={`group flex items-center gap-2 px-3 py-1 cursor-pointer transition text-xs ${
        isSelected ? "bg-indigo-600/20" : "hover:bg-slate-700/30"
      }`}
    >
      <span className={`font-mono font-bold w-3 ${color}`}>{letter}</span>
      <button
        onClick={onSelect}
        className="flex-1 truncate text-left text-slate-300 font-mono"
        title={file.path}
      >
        {file.path}
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onAction();
        }}
        title={actionTitle}
        className="hidden group-hover:block rounded bg-slate-700 px-1.5 py-0.5 text-xs font-bold text-slate-300 hover:bg-slate-600"
      >
        {actionLabel}
      </button>
    </div>
  );
}
