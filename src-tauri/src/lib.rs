#[cfg(desktop)]
mod tray;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
use tauri_plugin_log::{Target, TargetKind};
use tauri_plugin_store::StoreBuilder;

// #[tauri::command]
// fn greet(name: &str) -> String {
//     format!("Hello, {}! You've been greeted from Rust!", name)
// }

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(
            tauri_plugin_log::Builder::new()
                .targets([
                    Target::new(TargetKind::Stdout),
                    Target::new(TargetKind::LogDir { file_name: None }),
                    Target::new(TargetKind::Webview),
                ])
                .build(),
        )
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_process::init())
        // .invoke_handler(tauri::generate_handler![greet])
        .setup(|app| {
            let mut store = StoreBuilder::new("settings.json").build(app.handle().clone());

            let _ = store.load();

            #[cfg(desktop)]
            {
                tray::create(app.handle())?;

                // app.handle().plugin(tauri_plugin_cli::init())?;
                app.handle()
                    .plugin(tauri_plugin_global_shortcut::Builder::new().build())?;
                app.handle()
                    .plugin(tauri_plugin_updater::Builder::new().build())?;
                app.handle()
                    .plugin(tauri_plugin_updater::Builder::new().build())?;
            }

            #[cfg(mobile)]
            {
                app.handle().plugin(tauri_plugin_barcode_scanner::init())?;
                app.handle().plugin(tauri_plugin_nfc::init())?;
                app.handle().plugin(tauri_plugin_biometric::init())?;
            }

            // let mut webview_window_builder =
            //     WebviewWindowBuilder::new(app, "main", WebviewUrl::default());

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
