use std::process::{Child, Command};
use std::net::TcpListener;

pub fn get_available_port() -> Option<u16> {
    (3000..4000).find(|port| port_is_available(*port))
}

fn port_is_available(port: u16) -> bool {
    TcpListener::bind(("127.0.0.1", port)).is_ok()
}

pub fn start_server(_port: u16) -> Result<Child, std::io::Error> {
    let port = 3000; // Force port 3000 as it's hardcoded in tauri.conf.json
    
    let exe_dir = std::env::current_exe()?
        .parent()
        .ok_or_else(|| std::io::Error::new(std::io::ErrorKind::NotFound, "No parent dir"))?
        .to_path_buf();
    
    // Try multiple possible locations for server.js
    let possible_paths = vec![
        // Standard Tauri resources path on Windows
        exe_dir.join("resources").join(".next").join("standalone").join("server.js"),
        // Some installers might flatten or change structure
        exe_dir.join("_up_").join("resources").join(".next").join("standalone").join("server.js"),
        // Path in target/release folder (maps ../.next to _up_/.next)
        exe_dir.join("_up_").join(".next").join("standalone").join("server.js"),
        // Flattened structure (common in some installers)
        exe_dir.join(".next").join("standalone").join("server.js"),
        // Direct development/unbundled path
        exe_dir.join("..").join("..").join("..").join(".next").join("standalone").join("server.js"),
    ];

    let server_path = possible_paths.into_iter()
        .find(|p| p.exists())
        .ok_or_else(|| std::io::Error::new(
            std::io::ErrorKind::NotFound,
            format!("Could not find server.js in any expected location. Checked: resources/.next/standalone/server.js and others relative to {:?}", exe_dir)
        ))?;

    let working_dir = server_path.parent().unwrap();

    // Create a log file for the server output to help debugging
    let log_file = std::fs::File::create(exe_dir.join("server-debug.log")).ok();

    let mut command = Command::new("node");
    command.arg(&server_path)
        .env("PORT", port.to_string())
        .env("HOSTNAME", "127.0.0.1")
        .current_dir(working_dir);
        
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        const CREATE_NO_WINDOW: u32 = 0x08000000;
        command.creation_flags(CREATE_NO_WINDOW);
    }

    if let Some(log) = log_file {
        command.stdout(log.try_clone().unwrap());
        command.stderr(log);
    }

    command.spawn()
}
