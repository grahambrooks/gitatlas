use std::fs;
use std::path::PathBuf;

use crate::db::models::RepoInfo;

fn cache_dir() -> Option<PathBuf> {
    dirs_next::home_dir().map(|h| h.join(".gitatlas"))
}

fn cache_path() -> Option<PathBuf> {
    cache_dir().map(|d| d.join("cache.json"))
}

pub fn save(repos: &[RepoInfo]) {
    let Some(path) = cache_path() else { return };
    if let Some(dir) = path.parent() {
        let _ = fs::create_dir_all(dir);
    }
    if let Ok(json) = serde_json::to_string(repos) {
        let _ = fs::write(&path, json);
    }
}

pub fn load() -> Vec<RepoInfo> {
    let Some(path) = cache_path() else {
        return Vec::new();
    };
    let Ok(data) = fs::read_to_string(&path) else {
        return Vec::new();
    };
    serde_json::from_str(&data).unwrap_or_default()
}
