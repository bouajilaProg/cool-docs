use std::fs::File;
use std::io::{self, Read};
use std::path::Path;

const REPO_PATH: &str = "./repo";

fn read_file_contents(file_path: &str) -> io::Result<String> {
    let mut file = File::open(file_path)?;
    let mut contents = String::new();
    file.read_to_string(&mut contents)?;
    Ok(contents)
}

#[tauri::command]
fn fetch_doc(lang: String, category: String, name: String) -> String {
    let file_path = format!("{}/{}/{}/{}.xml", REPO_PATH, lang, category, name);

    if Path::new(&file_path).exists() {
        match read_file_contents(&file_path) {
            Ok(contents) => contents,
            Err(e) => format!("Error reading file: {}", e),
        }
    } else {
        "File not found".to_string()
    }
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![fetch_doc])
        .run(tauri::generate_context!())
        .expect("error while running Tauri application");
}
