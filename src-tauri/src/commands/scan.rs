use std::path::PathBuf;

use tauri::State;

use crate::db::models::RepoInfo;
use crate::error::AppError;
use crate::AppState;
use crate::scanner;

#[tauri::command]
pub async fn scan_directories(
    roots: Vec<String>,
    state: State<'_, AppState>,
) -> Result<Vec<RepoInfo>, AppError> {
    let root_paths: Vec<PathBuf> = roots.into_iter().map(PathBuf::from).collect();
    let repos = scanner::scan_roots(&root_paths);

    // Persist to database
    let db = &state.db;
    db.clear_repos()?;
    for repo in &repos {
        db.upsert_repo(repo)?;
    }

    Ok(repos)
}

#[tauri::command]
pub async fn get_scan_roots() -> Result<Vec<String>, AppError> {
    // For MVP, return a default scan root
    let home = dirs_next().unwrap_or_else(|| "/Users".to_string());
    Ok(vec![format!("{}/dev", home)])
}

fn dirs_next() -> Option<String> {
    std::env::var("HOME").ok()
}
