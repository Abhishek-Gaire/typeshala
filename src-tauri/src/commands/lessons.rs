//! Lesson commands (spec 0002, AC-2).
//!
//! Lessons are read only content shipped with the app. The single source
//! is `src/data/lessons/`, embedded at compile time so no runtime
//! resource lookup is needed.

use tauri::{AppHandle, Runtime};

use crate::models::{BridgeError, LayoutId, Lesson};

/// Bundled English QWERTY lessons, embedded at compile time.
const EN_QWERTY: &str = include_str!("../../../src/data/lessons/en-qwerty.json");

/// Bundled Nepali Romanized lessons, embedded at compile time (spec 0006).
const NE_ROMANIZED: &str = include_str!("../../../src/data/lessons/ne-romanized.json");

/// Bundled Nepali Traditional lessons, embedded at compile time (spec 0007).
const NE_TRADITIONAL: &str = include_str!("../../../src/data/lessons/ne-traditional.json");

/// Parse the bundled lessons once per call. The files are tiny.
pub(crate) fn bundled() -> Result<Vec<Lesson>, BridgeError> {
    let mut lessons: Vec<Lesson> = serde_json::from_str(EN_QWERTY).map_err(|err| {
        BridgeError::new(
            "lessons-invalid",
            format!("bundled lessons cannot be parsed: {err}"),
        )
    })?;
    let mut romanized: Vec<Lesson> =
        serde_json::from_str(NE_ROMANIZED).map_err(|err| {
            BridgeError::new(
                "lessons-invalid",
                format!("bundled romanized lessons cannot be parsed: {err}"),
            )
        })?;
    lessons.append(&mut romanized);
    let mut traditional: Vec<Lesson> =
        serde_json::from_str(NE_TRADITIONAL).map_err(|err| {
            BridgeError::new(
                "lessons-invalid",
                format!("bundled traditional lessons cannot be parsed: {err}"),
            )
        })?;
    lessons.append(&mut traditional);
    Ok(lessons)
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
        // Order is unique per layout (spec 0005 invariant), not globally.
        let mut per_layout: std::collections::HashMap<String, Vec<u32>> =
            std::collections::HashMap::new();
        for lesson in &lessons {
            per_layout
                .entry(format!("{:?}", lesson.layout))
                .or_default()
                .push(lesson.order);
        }
        assert!(per_layout.len() >= 2);
        for orders in per_layout.values() {
            let mut sorted = orders.clone();
            sorted.sort_unstable();
            sorted.dedup();
            assert_eq!(sorted.len(), orders.len());
        }
    }
}
