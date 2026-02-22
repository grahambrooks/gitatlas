interface DiffViewerProps {
  diff: string;
}

export default function DiffViewer({ diff }: DiffViewerProps) {
  if (!diff) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-slate-500">
        Select a file or commit to view diff
      </div>
    );
  }

  const lines = diff.split("\n");

  return (
    <div className="h-full overflow-auto">
      <pre className="p-3 text-xs leading-5 font-mono">
        {lines.map((line, i) => {
          let cls = "text-slate-400";
          if (line.startsWith("+")) cls = "text-green-400 bg-green-950/30";
          else if (line.startsWith("-")) cls = "text-red-400 bg-red-950/30";

          return (
            <div key={i} className={cls}>
              {line || " "}
            </div>
          );
        })}
      </pre>
    </div>
  );
}
