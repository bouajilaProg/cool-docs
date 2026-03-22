# Cool Docs

Cool Docs is a fast, cross-platform (Windows/macOS/Linux) desktop app for browsing your own coding documentation offline. Docs live as local XML files and are displayed with syntax highlighting and selectable code themes.

## Features

- **Syntax Highlighting + Themes**: Render code blocks with highlighting and switch themes.
- **Fast and Lightweight**: Designed to be quick and responsive.
- **Cross-Platform**: Works on Windows, macOS, and Linux (Tauri).
- **Local-First Docs**: Keep documentation in your repo/disk as XML files.


## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/bouajilaProg/cool-docs.git
   ```

2. Install dependencies:
   ```bash
   npm ci
   ```

3. Run the app in development:
   ```bash
   npm run tauri dev
   ```

4. Build a release bundle:
   ```bash
   npm run tauri build
   ```
   After building, go to:
   ```
   src-tauri/target/release/bundle
   ```
   and search for your system to find the appropriate build.

5. Docs live under `src-tauri/data/repo/` (example docs are already included). Add your own docs by creating:
   `src-tauri/data/repo/<language>/<category>/<name>.xml`



## How to Add New Documentation

To create a new category or documentation file, follow this structure:

1. **Category**: Create a folder for your category (e.g., Algorithms, Data Structures).
2. **Documentation**: Inside the category folder, create a `<name>.xml` file for each document.

### Example XML Structure:

```XML
<document>
  <name>Document Name</name>
  <category>Category Name</category>
  <creator>Your Name</creator>
  <content>
    <item>
      <title>Item Title</title>
      <text>Item Description</text>
      <code>Item Code</code>
    </item>
  </content>

</document>

```

In this XML file:
- Each `<document>` contains a name, category, creator, and content.
- Each `<item>` inside `<content>` can contain multiple `<title>`, `<text>`, and `<code>` elements, and you can add as many items as needed.


## Contributing

Feel free to fork the repository and submit pull requests. If you have suggestions or want to add your own XML documentation, open an issue or create a pull request with your changes.

## GitHub Releases (CI)

This repo includes a GitHub Actions workflow that builds the Tauri app and attaches installers/bundles to a GitHub Release.

- Create and push a tag like `v0.1.0` to trigger the release build.
