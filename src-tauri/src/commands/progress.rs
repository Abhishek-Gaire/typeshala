//! Progress commands (spec 0002, AC-1 and AC-5).
//!
//! Attempts live under the `attempts` key as an append only array.
//! Best scores are derived at read time, never stored.

use tauri::{AppHandle, Runtime};

use crate::models::{
    derive_bests, validate_attempt, Attempt, BridgeError, LayoutId, NewAttempt, Progress,
};
use crate::store::open_store;

/// Save one finished attempt. The id is assigned inside.
#[tauri::command]
pub fn save_result<R: Runtime>(
    app: AppHandle<R>,
    attempt: NewAttempt,
) -> Result<Attempt, BridgeError> {
    validate_attempt(&attempt)?;
    let known = super::lessons::bundled()?
        .into_iter()
        .any(|lesson| lesson.id == attempt.lesson_id);
    if !known {
        return Err(BridgeError::new(
            "not-found",
            format!("no lesson with id `{}`", attempt.lesson_id),
        ));
    }
    let store = open_store(&app)?;
    let mut attempts = read_attempts(&store);
    let saved = Attempt {
        id: next_id(&attempts),
        lesson_id: attempt.lesson_id,
        layout: attempt.layout,
        started_at: attempt.started_at,
        duration_ms: attempt.duration_ms,
        wpm: attempt.wpm,
        accuracy: attempt.accuracy,
        errors: attempt.errors,
        completed: attempt.completed,
    };
    attempts.push(saved.clone());
    store.set(
        "attempts",
        serde_json::to_value(&attempts).map_err(|err| {
            BridgeError::new(
                "store-write-failed",
                format!("attempts cannot be encoded: {err}"),
            )
        })?,
    );
    store.save().map_err(|err| {
        BridgeError::new(
            "store-write-failed",
            format!("attempts cannot be saved: {err}"),
        )
    })?;
    Ok(saved)
}

/// Read attempts with optional filters, plus derived per lesson bests.
/// Every attempt is kept, newest last, with an optional limit on the tail.
#[tauri::command]
pub fn get_progress<R: Runtime>(
    app: AppHandle<R>,
    lesson_id: Option<String>,
    layout: Option<LayoutId>,
    limit: Option<usize>,
) -> Result<Progress, BridgeError> {
    let store = open_store(&app)?;
    let mut attempts = read_attempts(&store);
    if let Some(lesson_id) = lesson_id {
        attempts.retain(|attempt| attempt.lesson_id == lesson_id);
    }
    if let Some(layout) = layout {
        attempts.retain(|attempt| attempt.layout == layout);
    }
    if let Some(limit) = limit {
        let drop = attempts.len().saturating_sub(limit);
        attempts.drain(..drop);
    }
    let bests = derive_bests(&attempts);
    Ok(Progress { attempts, bests })
}

/// Read the raw attempt array. Missing key means no attempts yet.
fn read_attempts<R: Runtime>(store: &tauri_plugin_store::Store<R>) -> Vec<Attempt> {
    match store.get("attempts") {
        Some(value) => serde_json::from_value(value).unwrap_or_default(),
        None => Vec::new(),
    }
}

/// Next attempt id from date plus counter. Unique and sortable.
fn next_id(attempts: &[Attempt]) -> String {
    format!("a{}", attempts.len() + 1)
}
