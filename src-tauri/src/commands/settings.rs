//! Settings commands (spec 0002, AC-3).
//!
//! Settings live under the `settings` key. Missing keys fall back to
//! safe defaults, and patches merge over current values.

use tauri::{AppHandle, Runtime};

use crate::models::{default_settings, merge_settings, BridgeError, Settings, SettingsPatch};
use crate::store::open_store;

/// Load settings, or safe defaults on first run.
#[tauri::command]
pub fn get_settings<R: Runtime>(app: AppHandle<R>) -> Result<Settings, BridgeError> {
    let store = open_store(&app)?;
    match store.get("settings") {
        Some(value) => {
            let mut settings: Settings = serde_json::from_value(value).map_err(|err| {
                BridgeError::new(
                    "settings-invalid",
                    format!("stored settings cannot be parsed: {err}"),
                )
            })?;
            settings.schema_version = crate::models::SCHEMA_VERSION;
            Ok(settings)
        }
        None => Ok(default_settings()),
    }
}

/// Save a partial patch merged over current settings.
#[tauri::command]
pub fn save_settings<R: Runtime>(
    app: AppHandle<R>,
    patch: SettingsPatch,
) -> Result<Settings, BridgeError> {
    let store = open_store(&app)?;
    let current = match store.get("settings") {
        Some(value) => serde_json::from_value(value).unwrap_or_else(|_| default_settings()),
        None => default_settings(),
    };
    let next = merge_settings(&current, &patch);
    store.set(
        "settings",
        serde_json::to_value(&next).map_err(|err| {
            BridgeError::new(
                "store-write-failed",
                format!("settings cannot be encoded: {err}"),
            )
        })?,
    );
    store.save().map_err(|err| {
        BridgeError::new(
            "store-write-failed",
            format!("settings cannot be saved: {err}"),
        )
    })?;
    Ok(next)
}
