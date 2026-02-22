use std::fs;
use std::path::PathBuf;

use serde::{Deserialize, Serialize};

use crate::db::models::RepoInfo;

#[derive(Debug, Serialize, Deserialize, Default)]
pub struct Config {
    #[serde(default)]
    pub scan_roots: Vec<String>,
}

fn data_dir() -> Option<PathBuf> {
    dirs_next::home_dir().map(|h| h.join(".gitatlas"))
}

fn ensure_dir() -> Option<PathBuf> {
    let dir = data_dir()?;
    let _ = fs::create_dir_all(&dir);
    Some(dir)
}

// ── Repo cache ──

pub fn save(repos: &[RepoInfo]) {
    let Some(dir) = ensure_dir() else { return };
    let path = dir.join("cache.json");
    if let Ok(json) = serde_json::to_string(repos) {
        let _ = fs::write(&path, json);
    }
}

pub fn load() -> Vec<RepoInfo> {
    let Some(dir) = data_dir() else {
        return Vec::new();
    };
    let Ok(data) = fs::read_to_string(dir.join("cache.json")) else {
        return Vec::new();
    };
    serde_json::from_str(&data).unwrap_or_default()
}

// ── Config ──

pub fn load_config() -> Config {
    let Some(dir) = data_dir() else {
        return Config::default();
    };
    let Ok(data) = fs::read_to_string(dir.join("config.json")) else {
        return Config::default();
    };
    serde_json::from_str(&data).unwrap_or_default()
}

pub fn save_config(config: &Config) {
    let Some(dir) = ensure_dir() else { return };
    if let Ok(json) = serde_json::to_string_pretty(config) {
        let _ = fs::write(dir.join("config.json"), json);
    }
}
