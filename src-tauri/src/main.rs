use base64::{engine::general_purpose, Engine as _};
use serde::{Deserialize, Serialize};
use std::fs::{self, File, OpenOptions};
use std::io::{Cursor, Read, Write};
use std::path::Path;
use zip::ZipArchive;

const REPO_PATH: &str = "data/repo";

#[derive(Debug, Serialize)]
struct Registry {
    list_title: String,
    commands: Vec<String>,
}

#[derive(Serialize, Deserialize, Debug)]
struct Settings {
    language: String,
    code_theme: String,
}

#[derive(Deserialize, Debug)]
struct ImportDoc {
    name: String,
    category: String,
    creator: String,
    lang: String,
    items: Vec<ImportItem>,
}

#[derive(Deserialize, Debug)]
struct ImportItem {
    title: Option<String>,
    text: Option<String>,
    code: Option<String>,
}

#[tauri::command]
fn get_registry(lang: String) -> Vec<Registry> {
    if lang.is_empty() {
        return Vec::new();
    }

    let path = format!("{}/{}", REPO_PATH, lang);
    println!("{}", path);

    let mut registries: Vec<Registry> = Vec::new();

    let main_dir = match fs::read_dir(&path) {
        Ok(dir) => dir,
        Err(_) => return Vec::new(),
    };

    for entry in main_dir {
        let entry = match entry {
            Ok(e) => e,
            Err(_) => continue,
        };
        let dir_path = entry.path();

        if !dir_path.is_dir() {
            continue;
        }

        let mut file_names: Vec<String> = Vec::new();

        let sub_dir = match fs::read_dir(&dir_path) {
            Ok(dir) => dir,
            Err(_) => continue,
        };

        for file_entry in sub_dir {
            let file_entry = match file_entry {
                Ok(e) => e,
                Err(_) => continue,
            };
            let file_path = file_entry.path();
            if is_xml_file(&file_path) {
                if let Ok(file_name) = file_entry.file_name().into_string() {
                    file_names.push(file_name);
                }
            }
        }

        if file_names.is_empty() {
            continue;
        }

        registries.push(Registry {
            list_title: dir_path.file_name().unwrap().to_string_lossy().into_owned(),
            commands: file_names,
        });
    }

    registries
}

#[tauri::command]
fn get_languages() -> Vec<String> {
    let mut languages: Vec<String> = Vec::new();

    let base_dir = match fs::read_dir(REPO_PATH) {
        Ok(dir) => dir,
        Err(_) => return Vec::new(),
    };

    for entry in base_dir {
        let entry = match entry {
            Ok(e) => e,
            Err(_) => continue,
        };

        let lang_path = entry.path();
        if !lang_path.is_dir() {
            continue;
        }

        if lang_has_docs(&lang_path) {
            if let Some(lang) = lang_path.file_name().and_then(|name| name.to_str()) {
                languages.push(lang.to_string());
            }
        }
    }

    languages.sort();
    languages
}

#[tauri::command]
fn fetch_doc(lang: String, category: String, name: String) -> String {
    let file_path = format!("{}/{}/{}/{}.xml", REPO_PATH, lang, category, name);

    println!("{}", file_path);
    if Path::new(&file_path).exists() {
        match fs::read_to_string(&file_path) {
            Ok(contents) => contents,
            Err(e) => format!("Error reading file: {}", e),
        }
    } else {
        "File not found".to_string()
    }
}

#[tauri::command]
fn update_settings(language: String, code_theme: String) {
    let new_settings = Settings {
        language,
        code_theme,
    };

    let file_path = "data/settings.json";

    // Ensure data directory exists
    fs::create_dir_all("data").ok();

    let mut file = OpenOptions::new()
        .read(true)
        .write(true)
        .create(true)
        .truncate(true)
        .open(file_path)
        .unwrap();

    let json_data = serde_json::to_string_pretty(&new_settings).unwrap();
    file.write_all(json_data.as_bytes()).unwrap();
}

#[tauri::command]
fn get_settings() -> Settings {
    let file_path = "data/settings.json";

    match File::open(file_path) {
        Ok(mut file) => {
            println!("File opened successfully!");
            let mut contents = String::new();
            file.read_to_string(&mut contents).unwrap();
            serde_json::from_str(&contents).unwrap_or(Settings {
                language: "en".to_string(),
                code_theme: "github-dark".to_string(),
            })
        }
        Err(_) => Settings {
            language: "en".to_string(),
            code_theme: "github-dark".to_string(),
        },
    }
}

#[tauri::command]
fn import_json_data(json_content: String) -> Result<String, String> {
    let docs: Vec<ImportDoc> =
        serde_json::from_str(&json_content).map_err(|e| format!("Failed to parse JSON: {}", e))?;

    for doc in docs {
        let dir_path = format!("{}/{}/{}", REPO_PATH, doc.lang, doc.category);
        fs::create_dir_all(&dir_path).map_err(|e| format!("Failed to create directory: {}", e))?;

        let xml_content = doc_to_xml(&doc);
        let file_path = format!(
            "{}/{}.xml",
            dir_path,
            doc.name.to_lowercase().replace(" ", "-")
        );

        fs::write(&file_path, xml_content).map_err(|e| format!("Failed to write file: {}", e))?;
    }

    Ok("Import successful".to_string())
}

#[tauri::command]
fn import_zip_data(zip_base64: String) -> Result<String, String> {
    let zip_bytes = general_purpose::STANDARD
        .decode(&zip_base64)
        .map_err(|e| format!("Failed to decode base64: {}", e))?;

    let cursor = Cursor::new(zip_bytes);
    let mut archive = ZipArchive::new(cursor).map_err(|e| format!("Failed to open zip: {}", e))?;

    for i in 0..archive.len() {
        let mut file = archive
            .by_index(i)
            .map_err(|e| format!("Failed to read zip entry: {}", e))?;

        let outpath = match file.enclosed_name() {
            Some(path) => Path::new(REPO_PATH).join(path),
            None => continue,
        };

        if file.name().ends_with('/') {
            fs::create_dir_all(&outpath)
                .map_err(|e| format!("Failed to create directory: {}", e))?;
        } else {
            if let Some(p) = outpath.parent() {
                fs::create_dir_all(p)
                    .map_err(|e| format!("Failed to create parent directory: {}", e))?;
            }
            let mut outfile =
                File::create(&outpath).map_err(|e| format!("Failed to create file: {}", e))?;
            std::io::copy(&mut file, &mut outfile)
                .map_err(|e| format!("Failed to write file: {}", e))?;
        }
    }

    Ok("Import successful".to_string())
}

fn doc_to_xml(doc: &ImportDoc) -> String {
    let mut xml = String::from("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<document>\n");
    xml.push_str(&format!("  <name>{}</name>\n", escape_xml(&doc.name)));
    xml.push_str(&format!(
        "  <category>{}</category>\n",
        escape_xml(&doc.category)
    ));
    xml.push_str(&format!(
        "  <creator>{}</creator>\n",
        escape_xml(&doc.creator)
    ));
    xml.push_str("  <content>\n");

    for item in &doc.items {
        xml.push_str("    <item>\n");
        if let Some(title) = &item.title {
            xml.push_str(&format!("      <title>{}</title>\n", escape_xml(title)));
        }
        if let Some(text) = &item.text {
            xml.push_str(&format!("      <text>{}</text>\n", escape_xml(text)));
        }
        if let Some(code) = &item.code {
            xml.push_str(&format!("      <code>{}</code>\n", escape_xml(code)));
        }
        xml.push_str("    </item>\n");
    }

    xml.push_str("  </content>\n</document>");
    xml
}

fn escape_xml(s: &str) -> String {
    s.replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
        .replace('"', "&quot;")
        .replace('\'', "&apos;")
}

fn is_xml_file(path: &Path) -> bool {
    path.is_file()
        && path
            .extension()
            .and_then(|ext| ext.to_str())
            .map(|ext| ext.eq_ignore_ascii_case("xml"))
            .unwrap_or(false)
}

fn lang_has_docs(lang_path: &Path) -> bool {
    let categories = match fs::read_dir(lang_path) {
        Ok(dir) => dir,
        Err(_) => return false,
    };

    for category in categories {
        let category = match category {
            Ok(c) => c,
            Err(_) => continue,
        };

        let category_path = category.path();
        if !category_path.is_dir() {
            continue;
        }

        let files = match fs::read_dir(&category_path) {
            Ok(dir) => dir,
            Err(_) => continue,
        };

        for file_entry in files {
            let file_entry = match file_entry {
                Ok(f) => f,
                Err(_) => continue,
            };
            if is_xml_file(&file_entry.path()) {
                return true;
            }
        }
    }

    false
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            fetch_doc,
            get_registry,
            update_settings,
            get_settings,
            get_languages,
            import_json_data,
            import_zip_data
        ])
        .run(tauri::generate_context!())
        .expect("error while running Tauri application");
}
