use std::fs::File;
use std::io::{self, Read};

fn read_file_contents(file_path: &str) -> io::Result<String> {
    let mut file = File::open(file_path)?;
    let mut contents = String::new();
    file.read_to_string(&mut contents)?;
    Ok(contents)
}

fn main() -> io::Result<()> {
    let filename = "../repos/algorithms/db.xml";
    match read_file_contents(filename) {
        Ok(contents) => println!("File contents: \n{}", contents),
        Err(e) => eprintln!("Error reading file: {}", e),
    }

    Ok(())
}
