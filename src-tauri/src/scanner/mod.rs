use std::path::PathBuf;

use crate::db::models::RepoInfo;
use crate::git::{discovery, status};

/// Scan multiple root directories for Git repositories,
/// returning status info for each discovered repo.
pub fn scan_roots(roots: &[PathBuf]) -> Vec<RepoInfo> {
    let mut all_repos = Vec::new();

    for root in roots {
        let repo_paths = discovery::discover_repos(root);
        for path in repo_paths {
            let info = status::get_repo_info(&path);
            all_repos.push(info);
        }
    }

    all_repos.sort_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));
    all_repos
}
