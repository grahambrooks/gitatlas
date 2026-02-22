import { useState, useEffect, useCallback } from "react";
import type { RepoInfo } from "../../types";
import { useRepoDetail } from "../../hooks/useRepoDetail";
import CommitGraph from "./CommitGraph";
import FileChanges from "./FileChanges";
import DiffViewer from "./DiffViewer";
import CommitForm from "./CommitForm";
import BranchPanel from "./BranchPanel";
import StashPanel from "./StashPanel";
import ReadmeViewer from "./ReadmeViewer";

type Tab = "changes" | "history" | "branches" | "stashes" | "readme";

interface RepoDetailProps {
  repo: RepoInfo;
  onClose: () => void;
}

export default function RepoDetail({ repo, onClose }: RepoDetailProps) {
  const [activeTab, setActiveTab] = useState<Tab>("changes");
  const [selectedCommit, setSelectedCommit] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const detail = useRepoDetail(repo.path);

  // Load data for the active tab
  useEffect(() => {
    if (activeTab === "changes") {
      detail.loadChanges();
    } else if (activeTab === "history") {
      detail.loadCommits();
    } else if (activeTab === "branches") {
      detail.loadBranches();
    } else if (activeTab === "stashes") {
      detail.loadStashes();
    } else if (activeTab === "readme") {
      detail.loadReadme();
    }
    // Reset selections on tab switch
    detail.setDiff("");
    setSelectedCommit(null);
    setSelectedFile(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, repo.path]);

  const handleSelectCommit = useCallback(
    async (oid: string) => {
      setSelectedCommit(oid);
      setSelectedFile(null);
      await detail.loadCommitDiff(oid);
    },
    [detail],
  );

  const handleSelectFile = useCallback(
    async (filePath: string, staged: boolean) => {
      setSelectedFile(filePath);
      setSelectedCommit(null);
      await detail.loadFileDiff(filePath, staged);
    },
    [detail],
  );

  const tabs: { key: Tab; label: string }[] = [
    { key: "changes", label: "Changes" },
    { key: "history", label: "History" },
    { key: "branches", label: "Branches" },
    { key: "stashes", label: "Stashes" },
    { key: "readme", label: "Readme" },
  ];

  const stagedCount = detail.changes.filter((c) => c.staged).length;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-900">
      {/* Header */}
      <header className="flex items-center gap-4 border-b border-slate-700 px-4 py-3 shrink-0">
        <button
          onClick={onClose}
          className="rounded p-1 text-slate-400 hover:bg-slate-700 hover:text-slate-200 transition"
          title="Back to dashboard"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M13 4L7 10L13 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-white truncate">{repo.name}</h2>
          <p className="text-xs text-slate-500 font-mono truncate">{repo.path}</p>
        </div>

        <span className="rounded bg-slate-700/60 px-2 py-0.5 text-xs font-mono text-blue-300 shrink-0">
          {repo.branch}
        </span>

        {/* Remote operations */}
        <div className="flex items-center gap-1.5 ml-4">
          <HeaderButton
            label="Fetch"
            loading={detail.loading}
            loadingAction={detail.loadingAction}
            activeLabel="Fetching…"
            onClick={detail.fetchRemote}
          />
          <HeaderButton
            label="Pull"
            loading={detail.loading}
            loadingAction={detail.loadingAction}
            activeLabel="Pulling…"
            onClick={detail.pullRebase}
          />
          <HeaderButton
            label="Push"
            loading={detail.loading}
            loadingAction={detail.loadingAction}
            activeLabel="Pushing…"
            onClick={detail.push}
          />
        </div>

        {/* Loading action indicator */}
        {detail.loadingAction && (
          <span className="text-xs text-blue-400 animate-pulse shrink-0">
            {detail.loadingAction}
          </span>
        )}

        <div className="ml-auto" />

        {/* Tabs */}
        <nav className="flex items-center gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`rounded px-3 py-1.5 text-sm font-medium transition ${
                activeTab === tab.key
                  ? "bg-slate-700 text-white"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      {/* Toast notifications */}
      {detail.successMessage && (
        <div className="mx-4 mt-2 rounded bg-green-900/30 border border-green-800 px-3 py-2 text-xs text-green-300 shrink-0 flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0">
            <path d="M3 7L6 10L11 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {detail.successMessage}
        </div>
      )}

      {/* Error */}
      {detail.error && (
        <div className="mx-4 mt-2 rounded bg-red-900/30 border border-red-800 px-3 py-2 text-xs text-red-300 shrink-0 flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0">
            <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M7 4V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <circle cx="7" cy="10.5" r="0.75" fill="currentColor"/>
          </svg>
          <span className="flex-1">{detail.error}</span>
        </div>
      )}

      {/* Content */}
      <div className="flex flex-1 min-h-0">
        {activeTab === "changes" && (
          <>
            {/* Left: file list + commit form */}
            <div className="flex w-80 shrink-0 flex-col border-r border-slate-700">
              <div className="flex-1 min-h-0 overflow-auto">
                <FileChanges
                  changes={detail.changes}
                  selectedFile={selectedFile}
                  onSelectFile={handleSelectFile}
                  onStageFiles={detail.stageFiles}
                  onUnstageFiles={detail.unstageFiles}
                  onStageAll={detail.stageAll}
                  onUnstageAll={detail.unstageAll}
                />
              </div>
              <CommitForm stagedCount={stagedCount} onCommit={detail.createCommit} />
            </div>
            {/* Right: diff */}
            <div className="flex-1 min-h-0 overflow-auto">
              <DiffViewer diff={detail.diff} />
            </div>
          </>
        )}

        {activeTab === "history" && (
          <>
            {/* Left: branch graph + commit list */}
            <div className="w-[560px] shrink-0 overflow-auto border-r border-slate-700">
              <CommitGraph
                commits={detail.commits}
                selectedOid={selectedCommit}
                onSelect={handleSelectCommit}
              />
            </div>
            {/* Right: diff */}
            <div className="flex-1 min-h-0 overflow-auto">
              <DiffViewer diff={detail.diff} />
            </div>
          </>
        )}

        {activeTab === "branches" && (
          <div className="flex-1 overflow-auto">
            <BranchPanel
              branches={detail.branches}
              onCheckout={detail.checkoutBranch}
              onCreate={detail.createBranch}
              onDelete={detail.deleteBranch}
            />
          </div>
        )}

        {activeTab === "stashes" && (
          <div className="flex-1 overflow-auto">
            <StashPanel
              stashes={detail.stashes}
              onSave={detail.saveStash}
              onPop={detail.popStash}
              onDrop={detail.dropStash}
            />
          </div>
        )}

        {activeTab === "readme" && (
          <div className="flex-1 overflow-auto">
            <ReadmeViewer content={detail.readme} />
          </div>
        )}
      </div>
    </div>
  );
}

function HeaderButton({
  label,
  loading,
  loadingAction,
  activeLabel,
  onClick,
}: {
  label: string;
  loading: boolean;
  loadingAction: string | null;
  activeLabel: string;
  onClick: () => Promise<void>;
}) {
  const isThisAction = loadingAction === activeLabel;

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`rounded px-2.5 py-1 text-xs font-medium transition ${
        isThisAction
          ? "bg-blue-600/30 text-blue-300 border border-blue-500/40"
          : "bg-slate-700/80 text-slate-300 hover:bg-slate-600 hover:text-white"
      } disabled:opacity-40 disabled:cursor-not-allowed`}
    >
      {isThisAction ? (
        <span className="flex items-center gap-1.5">
          <Spinner />
          {activeLabel}
        </span>
      ) : (
        label
      )}
    </button>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin h-3 w-3" viewBox="0 0 12 12" fill="none">
      <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3" />
      <path d="M6 1A5 5 0 0 1 11 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
