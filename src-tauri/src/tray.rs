use std::sync::atomic::{AtomicBool, Ordering};
use tauri::{
    image::Image,
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Manager, Runtime, WebviewUrl, WebviewWindowBuilder,
};

pub fn create<R: Runtime>(app: &tauri::AppHandle<R>) -> tauri::Result<()> {
    let toggle = MenuItem::with_id(app, "toggle", "Toggle", true, None::<&str>)?;
    let new_window = MenuItem::with_id(app, "new-window", "New window", true, None::<&str>)?;
    let icon_1 = MenuItem::with_id(app, "icon-1", "Icon 1", true, None::<&str>)?;
    let icon_2 = MenuItem::with_id(app, "icon-2", "Icon 2", true, None::<&str>)?;

    #[cfg(target_os = "macos")]
    let set_title = MenuItem::with_id(app, "set-title", "Set Title", true, None::<&str>)?;

    let switch = MenuItem::with_id(app, "switch-menu", "Switch Menu", true, None::<&str>)?;
    let quit = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
    let remove = MenuItem::with_id(app, "remove-tray", "Remove Tray icon", true, None::<&str>)?;

    let menu1 = Menu::with_items(
        app,
        &[
            &toggle,
            &new_window,
            &icon_1,
            &icon_2,
            #[cfg(target_os = "macos")]
            &set_title,
            &switch,
            &quit,
            &remove,
        ],
    )?;

    let menu2 = Menu::with_items(app, &[&toggle, &new_window, &switch, &quit, &remove])?;

    let is_menu1 = AtomicBool::new(true);

    let _ = TrayIconBuilder::with_id("tray")
        .tooltip("taurisveltekit")
        .icon(app.default_window_icon().unwrap().clone())
        .menu(&menu1)
        .menu_on_left_click(false)
        .on_menu_event(move |app, event| match event.id.as_ref() {
            "quit" => {
                app.exit(0);
            }
            "remove-tray" => {
                app.remove_tray_by_id("tray");
            }
            "toggle" => {
                if let Some(window) = app.get_webview_window("main") {
                    let new_title = if window.is_visible().unwrap_or_default() {
                        let _ = window.hide();
                        "Show"
                    } else {
                        let _ = window.show();
                        let _ = window.set_focus();
                        "Hide"
                    };
                    toggle.set_text(new_title).unwrap();
                }
            }
            "new-window" => {
                let _ = WebviewWindowBuilder::new(app, "new", WebviewUrl::App("index.html".into()))
                    .title("taurisveltekit")
                    .build();
            }
            #[cfg(target_os = "macos")]
            "set-title" => {
                if let Some(tray) = app.tray_by_id("tray") {
                    let _ = tray.set_title(Some("taurisveltekit"));
                }
            }
            i @ "icon-1" | i @ "icon-2" => {
                if let Some(tray) = app.tray_by_id("tray") {
                    let _ = tray.set_icon(Some(if i == "icon-1" {
                        Image::from_bytes(include_bytes!("../icons/icon.ico")).unwrap()
                    } else {
                        Image::from_bytes(include_bytes!("../icons/icon.png")).unwrap()
                    }));
                }
            }
            "switch-menu" => {
                let flag = is_menu1.load(Ordering::Relaxed);
                let (menu, tooltip) = if flag {
                    (menu2.clone(), "Menu 2")
                } else {
                    (menu1.clone(), "taurisveltekit")
                };
                if let Some(tray) = app.tray_by_id("tray") {
                    let _ = tray.set_menu(Some(menu));
                    let _ = tray.set_tooltip(Some(tooltip));
                }
                is_menu1.store(!flag, Ordering::Relaxed);
            }

            _ => {}
        })
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } = event
            {
                let app = tray.app_handle();
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.show();
                    let _ = window.set_focus();
                }
            }
        })
        .build(app);

    Ok(())
}
