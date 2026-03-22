[![GitHub stars](https://img.shields.io/github/stars/bouajilaProg/cool-docs?style=flat&logo=github)](https://github.com/bouajilaProg/cool-docs)
[![Issues](https://img.shields.io/github/issues/bouajilaProg/cool-docs?style=flat&logo=github)](https://github.com/bouajilaProg/cool-docs/issues)
[![License: MIT](https://img.shields.io/badge/license-MIT-brightgreen?style=flat)](LICENSE)
[![Build Status](https://img.shields.io/github/actions/workflow/status/bouajilaProg/cool-docs/release.yml?branch=main&style=flat&logo=github)](https://github.com/bouajilaProg/cool-docs/actions)
[![Rust](https://img.shields.io/badge/Rust-1.70%2B-orange?style=flat&logo=rust)](https://www.rust-lang.org/)

# Cool Docs

License: MIT

Cool Docs is a local-first developer documentation app for Windows, macOS, and Linux. Import docs from JSON or ZIP files, browse them offline with syntax highlighting, and switch between doc sets inside the app.

Table of contents

- About
- Features
- Technical stack
- Setup
- Development
- Importing documentation
- Roadmap
- Contributing
- License

About

Cool Docs is designed for engineers who want a fast, offline doc viewer for internal playbooks, API notes, and development guides. You control the content by importing structured documentation files locally.

Features

- Local-first documentation with offline access
- Import docs from JSON or ZIP archives
- Multi-set navigation with a sidebar switcher
- Syntax highlighting and switchable code themes
- Cross-platform desktop app (Tauri)
- Auto-build GitHub releases on tags

Technical stack

| Component   | Technology |
|-------------|------------|
| Framework   | Tauri 2.x |
| Backend     | Rust |
| Frontend    | HTML, CSS, JavaScript |
| Highlighting| Highlight.js |

Setup

Requirements

- Node.js v20 or newer
- Rust toolchain (stable)
- Tauri system prerequisites (GTK/WebKit on Linux)

Local development

```bash
git clone https://github.com/bouajilaProg/cool-docs.git
cd cool-docs
npm ci
npm run tauri dev
```

Development

Build a release bundle locally:

```bash
npm run tauri build
```

Artifacts will be under:

```
src-tauri/target/release/bundle
```

Importing documentation

You can import documentation from the Settings page using either:

- JSON: A list of document objects
- ZIP: A folder structure of XML files

Sample JSON is provided at `src-tauri/data/sample-import.json`.

JSON format

```json
[
  {
    "name": "HTTP Basics",
    "category": "networking",
    "creator": "Cool Docs",
    "lang": "backend",
    "items": [
      { "title": "Request lifecycle", "text": "...", "code": "curl -i https://api.example.com/health" }
    ]
  }
]
```

ZIP format

Place XML documents under:

```
<lang>/<category>/<name>.xml
```

Example XML structure:

```xml
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

Roadmap

- [ ] Search across docs
- [ ] Markdown import support
- [ ] Theme editor
- [ ] Sync docs from a remote source

Contributing

Feel free to fork the repository and submit pull requests. If you add new documentation sets or importers, include an example file to make it easy for others to try.

License

MIT
