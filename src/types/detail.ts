export type RefKind = "head" | "local" | "remote" | "tag";

export interface RefLabel {
  name: string;
  kind: RefKind;
}

export interface CommitInfo {
  oid: string;
  short_oid: string;
  message: string;
  author: string;
  author_email: string;
  date: string;
  parents: string[];
  refs: RefLabel[];
}

export type FileStatus =
  | "added"
  | "modified"
  | "deleted"
  | "renamed"
  | "untracked"
  | "conflicted";

export interface FileChange {
  path: string;
  status: FileStatus;
  staged: boolean;
}

export interface BranchInfo {
  name: string;
  is_head: boolean;
  is_remote: boolean;
  upstream: string | null;
}

export interface StashEntry {
  index: number;
  message: string;
}

export interface CommitFileChange {
  path: string;
  status: string;
}

export interface RemoteInfo {
  name: string;
  url: string;
}

export interface GitProfile {
  name: string;
  email: string;
}
