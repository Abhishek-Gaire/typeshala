//! Lesson commands (spec 0002, AC-2).
//!
//! Lessons are read only content shipped with the app. The single source
//! is `src/data/lessons/`, embedded at compile time so no runtime
//! resource lookup is needed.

use tauri::{AppHandle, Runtime};

use crate::models::{BridgeError, LayoutId, Lesson};

/// Bundled English QWERTY lessons, embedded at compile time.
const EN_QWERTY: &str = include_str!("../../../src/data/lessons/en-qwerty.json");

/// Parse the bundled lessons once per call. The file is tiny.
pub(crate) fn bundled() -> Result<Vec<Lesson>, BridgeError> {
    serde_json::from_str(EN_QWERTY).map_err(|err| {
        BridgeError::new(
            "lessons-invalid",
            format!("bundled lessons cannot be parsed: {err}"),
        )
    })
}

/// Load all lessons, or only one layout when given.
#[tauri::command]
pub fn load_lessons<R: Runtime>(
    _app: AppHandle<R>,
    layout: Option<LayoutId>,
) -> Result<Vec<Lesson>, BridgeError> {
    let mut lessons = bundled()?;
    if let Some(layout) = layout {
        lessons.retain(|lesson| lesson.layout == layout);
    }
    lessons.sort_by_key(|lesson| lesson.order);
    Ok(lessons)
}

/// Load one lesson by its stable id.
#[tauri::command]
pub fn get_lesson<R: Runtime>(_app: AppHandle<R>, id: String) -> Result<Lesson, BridgeError> {
    bundled()?
        .into_iter()
        .find(|lesson| lesson.id == id)
        .ok_or_else(|| BridgeError::new("not-found", format!("no lesson with id `{id}`")))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn bundled_lessons_parse_with_unique_ordered_ids() {
        let lessons = bundled().expect("bundled lessons must parse");
        assert!(!lessons.is_empty());
        let mut ids: Vec<&str> = lessons.iter().map(|l| l.id.as_str()).collect();
        ids.sort_unstable();
        ids.dedup();
        assert_eq!(ids.len(), lessons.len());
        let mut orders: Vec<u32> = lessons.iter().map(|l| l.order).collect();
        orders.sort_unstable();
        orders.dedup();
        assert_eq!(orders.len(), lessons.len());
    }
}
