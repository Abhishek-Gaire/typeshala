//! End to end command tests through a mock Tauri app (spec 0002).
//!
//! One sequential test, not four parallel ones: every step shares the
//! single store file, so parallel steps would overwrite each other.
//! Covers AC-1, AC-2, AC-3, AC-4, AC-5 against the real store plugin.

#[cfg(test)]
mod e2e {
    use crate::commands::{lessons, progress, settings};
    use crate::models::{LayoutId, NewAttempt, SettingsPatch, Theme, STORE_FILE};
    use tauri::test::{mock_builder, mock_context, noop_assets, MockRuntime};
    use tauri::{AppHandle, Manager};

    fn mock_app() -> AppHandle<MockRuntime> {
        let app = mock_builder()
            .plugin(tauri_plugin_store::Builder::new().build())
            .build(mock_context(noop_assets()))
            .expect("mock app builds");
        app.handle().clone()
    }

    fn new_attempt(lesson: &str, wpm: f64) -> NewAttempt {
        NewAttempt {
            lesson_id: lesson.to_string(),
            layout: LayoutId::Qwerty,
            started_at: "2026-09-12T00:00:00Z".to_string(),
            duration_ms: 60_000,
            wpm,
            accuracy: 96.0,
            errors: vec![4],
            completed: true,
        }
    }

    /// Remove any store file plus backups from earlier runs.
    fn clean(app: &AppHandle<MockRuntime>) {
        let dir = app.path().app_data_dir().expect("app data dir resolves");
        let _ = std::fs::remove_file(dir.join(STORE_FILE));
        if let Ok(entries) = std::fs::read_dir(&dir) {
            for entry in entries.filter_map(|e| e.ok()) {
                let name = entry.file_name().to_string_lossy().into_owned();
                if name.starts_with("typeshala.json.bak.") {
                    let _ = std::fs::remove_file(entry.path());
                }
            }
        }
    }

    #[test]
    fn store_commands_end_to_end() {
        let app = mock_app();
        clean(&app);

        // Lessons: bundled content loads ordered, bad id errors (AC-2).
        let all = lessons::load_lessons(app.clone(), None).expect("lessons load");
        assert!(all.len() >= 8);
        assert!(all.windows(2).all(|w| w[0].order <= w[1].order));
        let romanized =
            lessons::load_lessons(app.clone(), Some(LayoutId::Romanized)).expect("romanized load");
        assert_eq!(romanized.len(), 5);
        assert!(romanized.iter().all(|l| l.layout == LayoutId::Romanized));
        let one = lessons::get_lesson(app.clone(), "en-home".to_string()).expect("one lesson");
        assert!(!one.prompt.is_empty());
        assert!(lessons::get_lesson(app.clone(), "nope".to_string()).is_err());

        // Settings: defaults, then patch merge plus clamp, then persist (AC-3).
        let fresh = settings::get_settings(app.clone()).expect("defaults load");
        assert_eq!(fresh.schema_version, 1);
        let next = settings::save_settings(
            app.clone(),
            SettingsPatch {
                theme: Some(Theme::Dark),
                prompt_size: Some(999),
                ..Default::default()
            },
        )
        .expect("patch saves");
        assert_eq!(next.theme, Theme::Dark);
        assert_eq!(next.prompt_size, fresh.prompt_size);
        let again = settings::get_settings(app.clone()).expect("settings persist");
        assert_eq!(again.theme, Theme::Dark);

        // Attempts: save assigns id, bad payloads rejected (AC-1).
        let saved =
            progress::save_result(app.clone(), new_attempt("en-home", 32.5)).expect("save works");
        assert_eq!(saved.lesson_id, "en-home");
        assert!(!saved.id.is_empty());
        let mut bad = new_attempt("en-home", 32.5);
        bad.accuracy = 101.0;
        assert!(progress::save_result(app.clone(), bad).is_err());
        assert!(progress::save_result(app.clone(), new_attempt("missing-lesson", 30.0)).is_err());

        // Progress: filters, derived bests, limit (AC-1, AC-5).
        progress::save_result(app.clone(), new_attempt("en-home", 40.0))
            .expect("second save works");
        let all_progress =
            progress::get_progress(app.clone(), None, None, None).expect("progress reads");
        assert!(all_progress.attempts.len() >= 2);
        let best = all_progress
            .bests
            .iter()
            .find(|b| b.lesson_id == "en-home")
            .expect("best exists");
        assert_eq!(best.wpm, 40.0);
        let filtered = progress::get_progress(app.clone(), Some("en-top".to_string()), None, None)
            .expect("filtered reads");
        assert!(filtered.attempts.is_empty());
        let limited =
            progress::get_progress(app.clone(), None, None, Some(1)).expect("limited reads");
        assert_eq!(limited.attempts.len(), 1);

        // Corrupt recovery: defaults plus empty history plus backup (AC-4).
        let dir = app.path().app_data_dir().expect("app data dir resolves");
        let file = dir.join(STORE_FILE);
        assert!(file.exists(), "store file must exist on disk");
        std::fs::write(&file, "{ not valid json").expect("corrupt the file");
        let app2 = mock_app();
        let recovered = settings::get_settings(app2.clone()).expect("recovers on defaults");
        assert_eq!(recovered.theme, crate::models::Theme::System);
        let history = progress::get_progress(app2, None, None, None).expect("history reads");
        assert!(history.attempts.is_empty());
        let backups: Vec<_> = std::fs::read_dir(&dir)
            .expect("read dir")
            .filter_map(|e| e.ok())
            .map(|e| e.file_name().to_string_lossy().into_owned())
            .filter(|n| n.starts_with("typeshala.json.bak."))
            .collect();
        assert!(!backups.is_empty(), "backup file must exist");
        clean(&app);
    }
}
