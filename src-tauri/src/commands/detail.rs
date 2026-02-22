use std::path::Path;

use crate::db::models::{BranchInfo, CommitInfo, FileChange, StashEntry};
use crate::error::AppError;
use crate::git;

// ── Commit log ──────────────────────────────────────────

#[tauri::command]
pub async fn get_commit_log(path: String, count: Option<usize>) -> Result<Vec<CommitInfo>, AppError> {
    let limit = count.unwrap_or(100);
    git::detail::get_commit_log(Path::new(&path), limit)
}

#[tauri::command]
pub async fn get_commit_diff(path: String, oid: String) -> Result<String, AppError> {
    git::detail::get_commit_diff(Path::new(&path), &oid)
}

// ── File changes & diff ─────────────────────────────────

#[tauri::command]
pub async fn get_file_changes(path: String) -> Result<Vec<FileChange>, AppError> {
    git::detail::get_file_changes(Path::new(&path))
}

#[tauri::command]
pub async fn get_file_diff(path: String, file_path: String, staged: bool) -> Result<String, AppError> {
    git::detail::get_file_diff(Path::new(&path), &file_path, staged)
}

// ── Staging ─────────────────────────────────────────────

#[tauri::command]
pub async fn stage_files(path: String, files: Vec<String>) -> Result<Vec<FileChange>, AppError> {
    let p = Path::new(&path);
    git::detail::stage_files(p, &files)?;
    git::detail::get_file_changes(p)
}

#[tauri::command]
pub async fn unstage_files(path: String, files: Vec<String>) -> Result<Vec<FileChange>, AppError> {
    let p = Path::new(&path);
    git::detail::unstage_files(p, &files)?;
    git::detail::get_file_changes(p)
}

#[tauri::command]
pub async fn stage_all_files(path: String) -> Result<Vec<FileChange>, AppError> {
    let p = Path::new(&path);
    git::detail::stage_all(p)?;
    git::detail::get_file_changes(p)
}

#[tauri::command]
pub async fn unstage_all_files(path: String) -> Result<Vec<FileChange>, AppError> {
    let p = Path::new(&path);
    git::detail::unstage_all(p)?;
    git::detail::get_file_changes(p)
}

// ── Commit ──────────────────────────────────────────────

#[tauri::command]
pub async fn create_commit(path: String, message: String) -> Result<String, AppError> {
    git::detail::create_commit(Path::new(&path), &message)
}

// ── Branches ────────────────────────────────────────────

#[tauri::command]
pub async fn get_branches(path: String) -> Result<Vec<BranchInfo>, AppError> {
    git::detail::get_branches(Path::new(&path))
}

#[tauri::command]
pub async fn checkout_branch(path: String, branch_name: String) -> Result<(), AppError> {
    git::detail::checkout_branch(Path::new(&path), &branch_name)
}

#[tauri::command]
pub async fn create_branch(path: String, branch_name: String) -> Result<(), AppError> {
    git::detail::create_branch(Path::new(&path), &branch_name)
}

#[tauri::command]
pub async fn delete_branch(path: String, branch_name: String) -> Result<(), AppError> {
    git::detail::delete_branch(Path::new(&path), &branch_name)
}

// ── Stashes ─────────────────────────────────────────────

#[tauri::command]
pub async fn get_stashes(path: String) -> Result<Vec<StashEntry>, AppError> {
    git::detail::get_stashes(Path::new(&path))
}

#[tauri::command]
pub async fn stash_save(path: String, message: String) -> Result<(), AppError> {
    git::detail::stash_save(Path::new(&path), &message)
}

#[tauri::command]
pub async fn stash_pop(path: String, index: usize) -> Result<(), AppError> {
    git::detail::stash_pop(Path::new(&path), index)
}

#[tauri::command]
pub async fn stash_drop(path: String, index: usize) -> Result<(), AppError> {
    git::detail::stash_drop(Path::new(&path), index)
}

// ── README ─────────────────────────────────────────────

#[tauri::command]
pub async fn get_readme(path: String) -> Result<Option<String>, AppError> {
    git::detail::get_readme(Path::new(&path))
}
