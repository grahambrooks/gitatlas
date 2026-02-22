import { useState } from "react";

interface CommitFormProps {
  stagedCount: number;
  onCommit: (message: string) => Promise<void>;
}

export default function CommitForm({ stagedCount, onCommit }: CommitFormProps) {
  const [message, setMessage] = useState("");
  const [committing, setCommitting] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim() || stagedCount === 0) return;
    setCommitting(true);
    try {
      await onCommit(message.trim());
      setMessage("");
    } finally {
      setCommitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <div className="border-t border-slate-700 p-3">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Commit message..."
        rows={3}
        className="w-full resize-none rounded border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-sm text-slate-200 placeholder-slate-500 outline-none transition focus:border-slate-500"
      />
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-slate-500">
          {stagedCount} file{stagedCount !== 1 ? "s" : ""} staged
        </span>
        <button
          onClick={handleSubmit}
          disabled={!message.trim() || stagedCount === 0 || committing}
          className="rounded bg-green-600 px-3 py-1 text-xs font-medium text-white transition hover:bg-green-500 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {committing ? "Committing..." : "Commit"}
        </button>
      </div>
    </div>
  );
}
