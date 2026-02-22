use std::path::Path;

use tauri::State;

use crate::cache;
use crate::db::models::RepoInfo;
use crate::error::AppError;
use crate::git;
use crate::AppState;

#[tauri::command]
pub async fn fetch_all(state: State<'_, AppState>) -> Result<Vec<RepoInfo>, AppError> {
    let repos = state.db.get_all_repos()?;
    let mut results = Vec::new();

    for repo in &repos {
        let path = Path::new(&repo.path);
        let _ = git::operations::fetch_repo(path);
        let updated = git::status::get_repo_info(path);
        state.db.upsert_repo(&updated)?;
        results.push(updated);
    }

    cache::save(&results);
    Ok(results)
}

#[tauri::command]
pub async fn pull_all(state: State<'_, AppState>) -> Result<Vec<RepoInfo>, AppError> {
    let repos = state.db.get_all_repos()?;
    let mut results = Vec::new();

    for repo in &repos {
        let path = Path::new(&repo.path);
        let _ = git::operations::pull_rebase_repo(path);
        let updated = git::status::get_repo_info(path);
        state.db.upsert_repo(&updated)?;
        results.push(updated);
    }

    cache::save(&results);
    Ok(results)
}

#[tauri::command]
pub async fn fetch_repo(path: String) -> Result<RepoInfo, AppError> {
    let repo_path = Path::new(&path);
    git::operations::fetch_repo(repo_path)?;
    Ok(git::status::get_repo_info(repo_path))
}

#[tauri::command]
pub async fn pull_rebase_repo(path: String) -> Result<RepoInfo, AppError> {
    let repo_path = Path::new(&path);
    git::operations::pull_rebase_repo(repo_path)?;
    Ok(git::status::get_repo_info(repo_path))
}

#[tauri::command]
pub async fn push_repo(path: String) -> Result<RepoInfo, AppError> {
    let repo_path = Path::new(&path);
    git::operations::push_repo(repo_path)?;
    Ok(git::status::get_repo_info(repo_path))
}
