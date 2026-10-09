//! Verification log channel (spec 0022, `/check verify`).
//!
//! Emits one line per observable event to the terminal and appends it to
//! `typeshala-verify.log` in the app data dir, so the feature can be
//! verified from logs alone when the app cannot be driven directly.
//! Logging never changes app behavior and never fails a caller.

use std::fs::OpenOptions;
use std::io::Write;
use std::time::{SystemTime, UNIX_EPOCH};

use tauri::{AppHandle, Manager, Runtime};

/// Name of the log file inside the app data dir.
pub const VERIFY_LOG_FILE: &str = "typeshala-verify.log";

/// Build one log line: stamp, event name, then the JSON data payload.
pub fn log_line(stamp_ms: u128, event: &str, data: &str) -> String {
    format!("{stamp_ms} {event} {data}")
}

/// Log one verification event to the terminal and the log file.
#[tauri::command]
pub fn verify_log<R: Runtime>(
    app: AppHandle<R>,
    event: String,
    data: String,
) -> Result<(), String> {
    let stamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_millis())
        .unwrap_or(0);
    let line = log_line(stamp, &event, &data);
    println!("[verify] {line}");
    if let Ok(dir) = app.path().app_data_dir() {
        let _ = std::fs::create_dir_all(&dir);
        if let Ok(mut file) = OpenOptions::new()
            .create(true)
            .append(true)
            .open(dir.join(VERIFY_LOG_FILE))
        {
            let _ = writeln!(file, "{line}");
        }
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use tauri::test::{mock_builder, mock_context, noop_assets};

    #[test]
    fn log_line_holds_stamp_event_and_data() {
        assert_eq!(
            log_line(1_700_000_000_000, "roman_key", "{\"key\":\"a\"}"),
            "1700000000000 roman_key {\"key\":\"a\"}"
        );
    }

    #[test]
    fn verify_log_never_fails_the_caller() {
        let app = mock_builder()
            .build(mock_context(noop_assets()))
            .expect("mock app builds");
        let result = verify_log(
            app.handle().clone(),
            "roman_state".to_string(),
            "{\"units\":\"क\"}".to_string(),
        );
        assert!(result.is_ok());
    }
}
