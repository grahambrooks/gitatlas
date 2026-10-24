use std::path::{Path, PathBuf};

use tauri::State;

use crate::cache;
use crate::db::models::RepoInfo;
use crate::error::AppError;
use crate::git;
use crate::AppState;

async fn run_blocking<F, T>(f: F) -> Result<T, AppError>
where
    F: FnOnce() -> Result<T, AppError> + Send + 'static,
    T: Send + 'static,
{
    tokio::task::spawn_blocking(f)
        .await
        .map_err(|e| AppError::General(format!("background task failed: {}", e)))?
}

#[tauri::command]
pub async fn fetch_all(state: State<'_, AppState>) -> Result<Vec<RepoInfo>, AppError> {
    let repos = state.db.get_all_repos()?;
    let paths: Vec<PathBuf> = repos.iter().map(|r| PathBuf::from(&r.path)).collect();

    let results = run_blocking(move || {
        let mut out = Vec::with_capacity(paths.len());
        for path in &paths {
            let _ = git::operations::fetch_repo(path);
            out.push(git::status::get_repo_info(path));
        }
        Ok(out)
    })
    .await?;

    for updated in &results {
        state.db.upsert_repo(updated)?;
    }
    cache::save(&results);
    Ok(results)
}

#[tauri::command]
pub async fn pull_all(state: State<'_, AppState>) -> Result<Vec<RepoInfo>, AppError> {
    let repos = state.db.get_all_repos()?;
    let paths: Vec<PathBuf> = repos.iter().map(|r| PathBuf::from(&r.path)).collect();

    let results = run_blocking(move || {
        let mut out = Vec::with_capacity(paths.len());
        for path in &paths {
            let _ = git::operations::pull_rebase_repo(path);
            out.push(git::status::get_repo_info(path));
        }
        Ok(out)
    })
    .await?;

    for updated in &results {
        state.db.upsert_repo(updated)?;
    }
    cache::save(&results);
    Ok(results)
}

#[tauri::command]
pub async fn fetch_repo(path: String) -> Result<RepoInfo, AppError> {
    run_blocking(move || {
        let repo_path = Path::new(&path);
        git::operations::fetch_repo(repo_path)?;
        Ok(git::status::get_repo_info(repo_path))
    })
    .await
}

#[tauri::command]
pub async fn pull_rebase_repo(path: String) -> Result<RepoInfo, AppError> {
    run_blocking(move || {
        let repo_path = Path::new(&path);
        git::operations::pull_rebase_repo(repo_path)?;
        Ok(git::status::get_repo_info(repo_path))
    })
    .await
}

#[tauri::command]
pub async fn push_repo(path: String) -> Result<RepoInfo, AppError> {
    run_blocking(move || {
        let repo_path = Path::new(&path);
        git::operations::push_repo(repo_path)?;
        Ok(git::status::get_repo_info(repo_path))
    })
    .await
}
