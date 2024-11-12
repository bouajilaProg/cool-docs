use serde::Serialize;
use serde_json::to_string_pretty;
use std::fs;
use std::fs::File;
use std::io::{self, Read};
use std::path::Path;

const REPO_PATH: &str = "./repo";

#[derive(Debug, Serialize)]
struct Registry {
    lang: String,
    commands: Vec<String>, // Directly store the list of file names as strings
}

fn read_file_contents(file_path: &str) -> io::Result<String> {
    let mut file = File::open(file_path)?;
    let mut contents = String::new();
    file.read_to_string(&mut contents)?;
    Ok(contents)
}

#[tauri::command]
fn get_registry(lang: String) -> Vec<Registry> {
    let path = format!("repo/{}", lang); // Going up one level to access `repo`
    println!("Looking for directory at: {}", path); // Debug print

    let mut registries: Vec<Registry> = Vec::new();

    let main_dir = fs::read_dir(&path).unwrap(); // Unwrap here, no error handling

    for entry in main_dir {
        let entry = entry.unwrap();
        let dir_path = entry.path(); // Full path of the subdirectory

        let mut file_names: Vec<String> = Vec::new();

        let sub_dir = fs::read_dir(&dir_path).unwrap(); // Unwrap here, no error handling

        for file_entry in sub_dir {
            let file_entry = file_entry.unwrap();
            let file_name = file_entry.file_name().into_string().unwrap(); // Unwrap here, no error handling
            file_names.push(file_name);
        }

        registries.push(Registry {
            lang: dir_path.file_name().unwrap().to_string_lossy().into_owned(),
            commands: file_names, // Directly store the file names
        });
    }

    registries
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
        .invoke_handler(tauri::generate_handler![fetch_doc, get_registry])
        .run(tauri::generate_context!())
        .expect("error while running Tauri application");
}
