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
        .any(|lesson| lesson.id == attempt.lesson_id)
        || is_classic_drill_id(&attempt.lesson_id);
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

/// True when a lesson id is a classic drill row (specs 0012, 0017, 0022).
///
/// Classic rows are generated at module load in the frontend, so this side
/// cannot list them: the id shape `cl-<screen>-<level>-<suffix>` is validated
/// instead, with suffix the layout tag (`en`, `tr`, `rn`).
fn is_classic_drill_id(id: &str) -> bool {
    let parts: Vec<&str> = id.split('-').collect();
    if parts.len() != 4 || parts[0] != "cl" {
        return false;
    }
    let screen = matches!(parts[1], "home" | "top" | "bottom" | "all");
    let level = matches!(parts[2], "1" | "2" | "3");
    let suffix = matches!(parts[3], "en" | "tr" | "rn");
    screen && level && suffix
}

#[cfg(test)]
mod tests {
    use super::*;
    use tauri::test::{mock_builder, mock_context, noop_assets};

    #[test]
    fn classic_drill_ids_are_recognised_by_shape() {
        for id in [
            "cl-home-1-rn",
            "cl-top-2-tr",
            "cl-bottom-3-en",
            "cl-all-1-rn",
        ] {
            assert!(is_classic_drill_id(id), "{id} should be a classic drill id");
        }
        for id in [
            "cl-home-4-rn",
            "cl-mid-1-rn",
            "cl-home-1-xx",
            "cl-home-rn",
            "ne-words",
            "",
        ] {
            assert!(
                !is_classic_drill_id(id),
                "{id} should not be a classic drill id"
            );
        }
    }

    #[test]
    fn saves_a_classic_drill_attempt_to_the_store() {
        let app = mock_builder()
            .plugin(tauri_plugin_store::Builder::new().build())
            .build(mock_context(noop_assets()))
            .expect("mock app builds");
        let attempt = NewAttempt {
            lesson_id: "cl-all-3-rn".to_string(),
            layout: LayoutId::Romanized,
            started_at: "2026-10-09T00:00:00Z".to_string(),
            duration_ms: 32_908,
            wpm: 8.4,
            accuracy: 100.0,
            errors: vec![],
            completed: true,
        };
        let saved = save_result(app.handle().clone(), attempt).expect("save works");
        assert_eq!(saved.lesson_id, "cl-all-3-rn");
        assert_eq!(saved.layout, LayoutId::Romanized);
        let progress = get_progress(app.handle().clone(), None, None, None).expect("read works");
        assert_eq!(progress.attempts.len(), 1);
        assert_eq!(progress.attempts[0].lesson_id, "cl-all-3-rn");
        assert_eq!(progress.attempts[0].layout, LayoutId::Romanized);
    }
}
