// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod server;

use tauri::api::dialog;
use tauri::Manager;
use std::process::Child;

// Show native save dialog and return selected path
#[tauri::command]
async fn show_save_dialog(default_name: String, filters: Vec<(String, Vec<String>)>) -> Result<Option<String>, String> {
    let mut dialog_builder = dialog::blocking::FileDialogBuilder::new()
        .set_file_name(&default_name);
    
    // Add filters
    for (name, extensions) in filters {
        dialog_builder = dialog_builder.add_filter(&name, &extensions.iter().map(|s| s.as_str()).collect::<Vec<&str>>());
    }
    
    let path = dialog_builder.save_file();
    
    Ok(path.map(|p| p.to_string_lossy().to_string()))
}

// Show native open dialog
#[tauri::command]
async fn show_open_dialog(filters: Vec<(String, Vec<String>)>) -> Result<Option<String>, String> {
    let mut dialog_builder = dialog::blocking::FileDialogBuilder::new();
    
    // Add filters
    for (name, extensions) in filters {
        dialog_builder = dialog_builder.add_filter(&name, &extensions.iter().map(|s| s.as_str()).collect::<Vec<&str>>());
    }
    
    let path = dialog_builder.pick_file();
    
    Ok(path.map(|p| p.to_string_lossy().to_string()))
}

// Show native message dialog
#[tauri::command]
async fn show_message(title: String, message: String) -> Result<(), String> {
    dialog::blocking::MessageDialogBuilder::new(title, message)
        .show();
    Ok(())
}

// Show native confirmation dialog
#[tauri::command]
async fn show_confirm(title: String, message: String) -> Result<bool, String> {
    let result = dialog::blocking::MessageDialogBuilder::new(title, message)
        .buttons(dialog::MessageDialogButtons::OkCancel)
        .show();
    Ok(result)
}

// Open URL in default browser
#[tauri::command]
async fn open_url(url: String) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        std::process::Command::new("cmd")
            .args(&["/C", "start", &url])
            .spawn()
            .map_err(|e| e.to_string())?;
    }
    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("open")
            .arg(&url)
            .spawn()
            .map_err(|e| e.to_string())?;
    }
    #[cfg(target_os = "linux")]
    {
        std::process::Command::new("xdg-open")
            .arg(&url)
            .spawn()
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}

fn main() {
    // Start Next.js server
    let mut server_process: Option<Child> = None;

    
    let port = 3000;
    match server::start_server(port) {
        Ok(child) => {
            server_process = Some(child);
            // Wait a bit for server to start
            std::thread::sleep(std::time::Duration::from_secs(2));
        }
        Err(e) => {
            let msg = format!("Failed to start Next.js server: {}\n\nPlease ensure Node.js is installed and the app is installed correctly.", e);
            dialog::blocking::MessageDialogBuilder::new("Startup Error", msg)
                .kind(dialog::MessageDialogKind::Error)
                .show();
        }
    }

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            show_save_dialog,
            show_open_dialog,
            show_message,
            show_confirm,
            open_url
        ])
        .on_window_event(|event| {
            if let tauri::WindowEvent::Destroyed = event.event() {
                // Kill server when window closes
                std::process::exit(0);
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
    
    // Cleanup server process
    if let Some(mut process) = server_process {
        let _ = process.kill();
    }
}
