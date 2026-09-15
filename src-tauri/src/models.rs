//! Shared shapes for the local store (spec 0002).
//!
//! Attempts are append only records. Settings are last write wins.
//! Best scores and trends are derived at read time, never stored.

use serde::{Deserialize, Serialize};

/// Storage schema version. Bump when a stored shape changes.
pub const SCHEMA_VERSION: u32 = 1;

/// File name of the JSON store inside the app data dir.
pub const STORE_FILE: &str = "typeshala.json";

/// One steady error shape across bridge plus UI.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BridgeError {
    /// Short code, e.g. `validation-failed`.
    pub code: String,
    /// Human readable detail.
    pub message: String,
}

impl BridgeError {
    /// Build a new bridge error from a code plus detail.
    pub fn new(code: &str, message: String) -> Self {
        Self {
            code: code.to_string(),
            message,
        }
    }
}

/// Typing layout a lesson or attempt belongs to.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum LayoutId {
    /// English QWERTY.
    Qwerty,
    /// Nepali Romanized Unicode.
    Romanized,
    /// Nepali Traditional Preeti mapping.
    Traditional,
}

/// A read only lesson shipped with the app.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Lesson {
    /// Stable id, never reused for different content.
    pub id: String,
    /// Layout this lesson teaches.
    pub layout: LayoutId,
    /// Display title.
    pub title: String,
    /// Text the learner types.
    pub prompt: String,
    /// Position in the lesson order.
    pub order: u32,
    /// Difficulty label, e.g. `home-row`.
    #[serde(default)]
    pub level: Option<String>,
}

/// One finished typing attempt. Append only.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Attempt {
    /// Assigned inside `save_result`, never by the caller.
    pub id: String,
    /// Lesson that was typed.
    #[serde(rename = "lessonId")]
    pub lesson_id: String,
    /// Layout used for the attempt.
    pub layout: LayoutId,
    /// Start time as an ISO date string.
    #[serde(rename = "startedAt")]
    pub started_at: String,
    /// How long the attempt took, in milliseconds.
    #[serde(rename = "durationMs")]
    pub duration_ms: u64,
    /// Words per minute.
    pub wpm: f64,
    /// Accuracy from 0 to 100.
    pub accuracy: f64,
    /// Character positions that were wrong, may be empty.
    pub errors: Vec<u32>,
    /// False when the learner gave up partway.
    pub completed: bool,
}

/// Input for `save_result`. Same as `Attempt` minus the id.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NewAttempt {
    #[serde(rename = "lessonId")]
    pub lesson_id: String,
    pub layout: LayoutId,
    #[serde(rename = "startedAt")]
    pub started_at: String,
    #[serde(rename = "durationMs")]
    pub duration_ms: u64,
    pub wpm: f64,
    pub accuracy: f64,
    #[serde(default)]
    pub errors: Vec<u32>,
    pub completed: bool,
}

/// UI theme choice.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Theme {
    Light,
    Dark,
    System,
}

/// UI language choice.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum UiLanguage {
    En,
    Ne,
}

/// Learner settings. Stored under the `settings` key.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Settings {
    #[serde(rename = "schemaVersion")]
    pub schema_version: u32,
    pub layout: LayoutId,
    pub theme: Theme,
    pub sound: bool,
    #[serde(rename = "promptSize")]
    pub prompt_size: u32,
    #[serde(rename = "uiLanguage")]
    pub ui_language: UiLanguage,
    #[serde(rename = "fingerGuidance")]
    pub finger_guidance: bool,
}

/// Partial settings input for `save_settings`. Every field optional.
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct SettingsPatch {
    #[serde(default)]
    pub layout: Option<LayoutId>,
    #[serde(default)]
    pub theme: Option<Theme>,
    #[serde(default)]
    pub sound: Option<bool>,
    #[serde(rename = "promptSize")]
    #[serde(default)]
    pub prompt_size: Option<u32>,
    #[serde(rename = "uiLanguage")]
    #[serde(default)]
    pub ui_language: Option<UiLanguage>,
    #[serde(rename = "fingerGuidance")]
    #[serde(default)]
    pub finger_guidance: Option<bool>,
}

/// Derived best score for one lesson, computed at read time.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BestScore {
    #[serde(rename = "lessonId")]
    pub lesson_id: String,
    pub wpm: f64,
    pub accuracy: f64,
    pub attempts: usize,
}

/// Progress read output: filtered attempts plus derived bests.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Progress {
    pub attempts: Vec<Attempt>,
    pub bests: Vec<BestScore>,
}

/// Safe defaults used on first run and after corrupt recovery.
pub fn default_settings() -> Settings {
    Settings {
        schema_version: SCHEMA_VERSION,
        layout: LayoutId::Qwerty,
        theme: Theme::System,
        sound: true,
        prompt_size: 28,
        ui_language: UiLanguage::En,
        finger_guidance: true,
    }
}

/// Merge a patch over current settings. Unknown fields never reach here
/// (serde drops them) and missing ones keep their current value.
pub fn merge_settings(current: &Settings, patch: &SettingsPatch) -> Settings {
    let mut next = current.clone();
    next.schema_version = SCHEMA_VERSION;
    if let Some(layout) = patch.layout {
        next.layout = layout;
    }
    if let Some(theme) = patch.theme {
        next.theme = theme;
    }
    if let Some(sound) = patch.sound {
        next.sound = sound;
    }
    if let Some(prompt_size) = patch.prompt_size {
        if (12..=48).contains(&prompt_size) {
            next.prompt_size = prompt_size;
        }
    }
    if let Some(ui_language) = patch.ui_language {
        next.ui_language = ui_language;
    }
    if let Some(finger_guidance) = patch.finger_guidance {
        next.finger_guidance = finger_guidance;
    }
    next
}

/// Check an incoming attempt before it is stored.
pub fn validate_attempt(input: &NewAttempt) -> Result<(), BridgeError> {
    if input.lesson_id.trim().is_empty() {
        return Err(BridgeError::new(
            "validation-failed",
            "lessonId must not be empty".to_string(),
        ));
    }
    if input.duration_ms == 0 {
        return Err(BridgeError::new(
            "validation-failed",
            "durationMs must be above zero".to_string(),
        ));
    }
    if !(0.0..=100.0).contains(&input.accuracy) {
        return Err(BridgeError::new(
            "validation-failed",
            "accuracy must sit between 0 and 100".to_string(),
        ));
    }
    if !input.wpm.is_finite() || input.wpm < 0.0 {
        return Err(BridgeError::new(
            "validation-failed",
            "wpm must be zero or above".to_string(),
        ));
    }
    Ok(())
}

/// Derive per lesson bests from an attempt list. Best means highest WPM,
/// ties broken by accuracy. Output is ordered by lesson id.
pub fn derive_bests(attempts: &[Attempt]) -> Vec<BestScore> {
    use std::collections::BTreeMap;
    let mut grouped: BTreeMap<&str, &Attempt> = BTreeMap::new();
    let mut counts: BTreeMap<&str, usize> = BTreeMap::new();
    for attempt in attempts {
        *counts.entry(attempt.lesson_id.as_str()).or_insert(0) += 1;
        let replace = match grouped.get(attempt.lesson_id.as_str()) {
            None => true,
            Some(best) => {
                attempt.wpm > best.wpm
                    || (attempt.wpm == best.wpm && attempt.accuracy > best.accuracy)
            }
        };
        if replace {
            grouped.insert(attempt.lesson_id.as_str(), attempt);
        }
    }
    grouped
        .into_iter()
        .map(|(lesson_id, best)| BestScore {
            lesson_id: lesson_id.to_string(),
            wpm: best.wpm,
            accuracy: best.accuracy,
            attempts: counts[lesson_id],
        })
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    fn attempt(lesson: &str, wpm: f64, accuracy: f64) -> Attempt {
        Attempt {
            id: "t".to_string(),
            lesson_id: lesson.to_string(),
            layout: LayoutId::Qwerty,
            started_at: "2026-09-12T00:00:00Z".to_string(),
            duration_ms: 1000,
            wpm,
            accuracy,
            errors: vec![],
            completed: true,
        }
    }

    #[test]
    fn rejects_empty_lesson_id() {
        let mut input = NewAttempt {
            lesson_id: "  ".to_string(),
            layout: LayoutId::Qwerty,
            started_at: "2026-09-12T00:00:00Z".to_string(),
            duration_ms: 1000,
            wpm: 30.0,
            accuracy: 95.0,
            errors: vec![],
            completed: true,
        };
        assert!(validate_attempt(&input).is_err());
        input.lesson_id = "en-home".to_string();
        assert!(validate_attempt(&input).is_ok());
    }

    #[test]
    fn rejects_bad_numbers() {
        let base = NewAttempt {
            lesson_id: "en-home".to_string(),
            layout: LayoutId::Qwerty,
            started_at: "2026-09-12T00:00:00Z".to_string(),
            duration_ms: 1000,
            wpm: 30.0,
            accuracy: 95.0,
            errors: vec![],
            completed: true,
        };
        let mut bad = base.clone();
        bad.accuracy = 101.0;
        assert!(validate_attempt(&bad).is_err());
        let mut bad = base.clone();
        bad.duration_ms = 0;
        assert!(validate_attempt(&bad).is_err());
        let mut bad = base.clone();
        bad.wpm = f64::NAN;
        assert!(validate_attempt(&bad).is_err());
    }

    #[test]
    fn merge_keeps_current_values_and_clamps_size() {
        let current = default_settings();
        let patch = SettingsPatch {
            theme: Some(Theme::Dark),
            prompt_size: Some(999),
            ..Default::default()
        };
        let next = merge_settings(&current, &patch);
        assert_eq!(next.theme, Theme::Dark);
        assert_eq!(next.prompt_size, current.prompt_size);
        assert_eq!(next.layout, current.layout);
    }

    #[test]
    fn bests_pick_top_wpm_then_accuracy() {
        let attempts = vec![
            attempt("a", 20.0, 99.0),
            attempt("a", 30.0, 80.0),
            attempt("b", 10.0, 90.0),
        ];
        let bests = derive_bests(&attempts);
        assert_eq!(bests.len(), 2);
        assert_eq!(bests[0].lesson_id, "a");
        assert_eq!(bests[0].wpm, 30.0);
        assert_eq!(bests[0].attempts, 2);
    }
}
