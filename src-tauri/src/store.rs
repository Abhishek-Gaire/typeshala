//! Store file access with corrupt recovery (spec 0002, AC-4).
//!
//! The JSON store lives in the app data dir. When the file cannot be
//! parsed, it is renamed aside as a backup and a fresh store starts,
//! so the app always boots on defaults plus an empty history.

use std::path::{Path, PathBuf};
use std::sync::Arc;
use std::time::{SystemTime, UNIX_EPOCH};

use tauri::{AppHandle, Manager, Runtime};
use tauri_plugin_store::{Store, StoreExt};

use crate::models::{BridgeError, STORE_FILE};

/// Open the app store, recovering from a corrupt file when needed.
///
/// The store plugin swallows file parse errors at open time, so the file
/// is validated here first. A corrupt file is renamed aside as a backup
/// and a fresh store starts, so the app always boots on defaults plus an
/// empty history.
pub fn open_store<R: Runtime>(app: &AppHandle<R>) -> Result<Arc<Store<R>>, BridgeError> {
    let path = store_path(app)?;
    if file_is_corrupt(&path) {
        backup_corrupt_file(&path)?;
    }
    app.store(path).map_err(|err| {
        BridgeError::new(
            "store-read-failed",
            format!("store cannot be opened: {err}"),
        )
    })
}

/// Absolute path of the store file in the app data dir.
fn store_path<R: Runtime>(app: &AppHandle<R>) -> Result<PathBuf, BridgeError> {
    let dir = app.path().app_data_dir().map_err(|err| {
        BridgeError::new(
            "store-read-failed",
            format!("app data dir is unknown: {err}"),
        )
    })?;
    std::fs::create_dir_all(&dir).map_err(|err| {
        BridgeError::new(
            "store-write-failed",
            format!("app data dir cannot be created: {err}"),
        )
    })?;
    Ok(dir.join(STORE_FILE))
}

/// True when the file exists but is not valid JSON. A missing file is a
/// first run, not corruption, and needs no backup.
fn file_is_corrupt(path: &Path) -> bool {
    match std::fs::read(path) {
        Err(_) => false,
        Ok(bytes) => serde_json::from_slice::<serde_json::Value>(&bytes).is_err(),
    }
}

/// Rename a corrupt file aside as a timestamped backup.
fn backup_corrupt_file(path: &Path) -> Result<PathBuf, BridgeError> {
    let backup = backup_path(path);
    std::fs::rename(path, &backup).map_err(|err| {
        BridgeError::new(
            "store-read-failed",
            format!("store file is corrupt and backup failed: {err}"),
        )
    })?;
    Ok(backup)
}

/// Backup path with a timestamp suffix, e.g. `typeshala.json.bak.1699999999`.
fn backup_path(path: &Path) -> PathBuf {
    let stamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_secs())
        .unwrap_or(0);
    let mut name = path.file_name().map(|n| n.to_owned()).unwrap_or_default();
    name.push(format!(".bak.{stamp}"));
    path.with_file_name(name)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn tmp_file(name: &str) -> PathBuf {
        let mut dir = std::env::temp_dir();
        dir.push(format!("typeshala-debug-{name}"));
        let _ = std::fs::remove_dir_all(&dir);
        std::fs::create_dir_all(&dir).expect("temp dir");
        dir.join(STORE_FILE)
    }

    #[test]
    fn missing_file_is_not_corrupt() {
        let path = tmp_file("missing");
        assert!(!file_is_corrupt(&path));
    }

    #[test]
    fn garbage_file_is_corrupt_and_backed_up() {
        let path = tmp_file("garbage");
        std::fs::write(&path, "{ not valid json").expect("write garbage");
        assert!(file_is_corrupt(&path));
        let backup = backup_corrupt_file(&path).expect("backup works");
        assert!(!path.exists());
        assert!(backup.exists());
        assert_eq!(
            std::fs::read_to_string(&backup).expect("read backup"),
            "{ not valid json"
        );
    }

    #[test]
    fn valid_json_is_not_corrupt() {
        let path = tmp_file("valid");
        std::fs::write(&path, r#"{"settings": {}}"#).expect("write json");
        assert!(!file_is_corrupt(&path));
    }
}
