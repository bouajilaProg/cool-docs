use serde::{Deserialize, Serialize};
use std::fs::{self, File, OpenOptions};
use std::io::{self, Read, Write};
use std::path::Path;

const REPO_PATH: &str = "./repo";

#[derive(Debug, Serialize)]
struct Registry {
    list_title: String,
    commands: Vec<String>, // Directly store the list of file names as strings
}

#[derive(Serialize, Deserialize, Debug)]
struct Settings {
    language: String,
    code_theme: String,
}

#[tauri::command]
fn get_registry(lang: String) -> Vec<Registry> {
    let path = format!("repo/{}", lang); // Going up one level to access `repo`

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
            list_title: dir_path.file_name().unwrap().to_string_lossy().into_owned(),
            commands: file_names, // Directly store the file names
        });
    }

    registries
}

#[tauri::command]
fn fetch_doc(lang: String, category: String, name: String) -> String {
    let file_path = format!("{}/{}/{}/{}.xml", REPO_PATH, lang, category, name);

    if Path::new(&file_path).exists() {
        match fs::read_to_string(&file_path) {
            Ok(contents) => {
                println!("File contents: {}", contents); // Debug print
                contents // Return the file contents
            }
            Err(e) => {
                println!("Error reading file: {}", e); // Debug print
                format!("Error reading file: {}", e)
            }
        }
    } else {
        "File not found".to_string()
    }
}

#[tauri::command]
fn update_settings(language: &str, code_theme: &str) {
    // Create a new settings object
    let new_settings = Settings {
        language: language.to_string(),
        code_theme: code_theme.to_string(),
    };

    // Define the file path
    let file_path = "../settings.json";
    let mut file = OpenOptions::new()
        .read(true)
        .write(true)
        .create(true)
        .open(file_path)
        .unwrap();

    // Write the updated settings back to the file
    let json_data = serde_json::to_string_pretty(&new_settings).unwrap();
    file.set_len(0).unwrap(); // Clear existing content
    file.write_all(json_data.as_bytes()).unwrap();

    println!("Settings updated successfully"); // Debug print
}

#[tauri::command]
fn get_settings() -> Settings {
    // Define the file path
    let file_path = "settings.json";

    // Open the file
    let mut file = File::open(file_path).unwrap();

    // Read the file contents into a string
    let mut contents = String::new();
    file.read_to_string(&mut contents).unwrap();

    // Deserialize the JSON data into the Settings struct
    let settings: Settings = serde_json::from_str(&contents).unwrap();

    println!("{:?}", settings);

    settings
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            fetch_doc,
            get_registry,
            update_settings,
            get_settings
        ])
        .run(tauri::generate_context!())
        .expect("error while running Tauri application");
}
