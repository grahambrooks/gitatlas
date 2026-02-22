mod cache;
mod commands;
mod db;
mod error;
mod git;
mod scanner;

use db::Database;

pub struct AppState {
    pub db: Database,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let db = Database::new_in_memory().expect("Failed to initialize database");
    let state = AppState { db };

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .manage(state)
        .invoke_handler(tauri::generate_handler![
            commands::scan::scan_directories,
            commands::scan::get_scan_roots,
            commands::scan::load_cached_repos,
            commands::status::get_all_repos,
            commands::status::get_repo_status,
            commands::operations::fetch_all,
            commands::operations::pull_all,
            commands::operations::fetch_repo,
            commands::operations::pull_rebase_repo,
            commands::operations::push_repo,
            commands::detail::get_commit_log,
            commands::detail::get_commit_diff,
            commands::detail::get_file_changes,
            commands::detail::get_file_diff,
            commands::detail::stage_files,
            commands::detail::unstage_files,
            commands::detail::stage_all_files,
            commands::detail::unstage_all_files,
            commands::detail::create_commit,
            commands::detail::get_branches,
            commands::detail::checkout_branch,
            commands::detail::create_branch,
            commands::detail::delete_branch,
            commands::detail::get_stashes,
            commands::detail::stash_save,
            commands::detail::stash_pop,
            commands::detail::stash_drop,
            commands::detail::get_readme,
            commands::detail::get_commit_files,
            commands::detail::merge_branch,
            commands::detail::get_file_history,
            commands::detail::get_remotes,
            commands::detail::add_remote,
            commands::detail::remove_remote,
            commands::detail::rename_remote,
            commands::detail::get_git_profile,
            commands::detail::set_git_profile,
            commands::detail::squash_commits,
            commands::detail::get_pr_url,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
