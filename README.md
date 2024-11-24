# Cool Docs

Cool Docs is a fast, cross-platform desktop application designed for competitive programmers. It helps you easily reference C++ documentation and algorithms while coding or participating in competitions. With support for custom XML files, the possibilities are endless, allowing you to create and extend documentation as needed.

## Features

- **Code Theme Customization**: Choose from multiple themes for code snippets, making it easy to read and adapt to your preferences.
- **Fast and Efficient**: Designed to be lightweight and quick, ensuring smooth performance during time-sensitive coding sessions.
- **Cross-Platform Support**: Run on Windows, macOS, and Linux, providing seamless access to your docs across different operating systems.
- **Custom XML Files**: Add your own XML files to expand the documentation, creating a personalized and versatile resource for your coding needs.

## Incoming Features

- **Search**: Easier ways to find your docs with an improved search functionality.
- **Update Button**: A folder-based structure where a lot of docs can be updated directly through a button in the settings.
- **Support for Other Languages**: Expand documentation in multiple programming languages.
- **Windows Installer**: An installer specifically for Windows users to make installation seamless.
- **Linux Install Script**: A script to simplify installation on Linux systems.
- **Dark Mode**: Support for a dark mode theme to reduce eye strain.
- **More Code Theme Styles**: Additional code theme styles for a personalized experience.
- **Other Programming Languages**: Add documentation for other programming languages.
- **Improved UI**: Enhancements to the user interface for a more intuitive experience.
- **Code Snippet Copy**: Copy code snippets directly to the clipboard for easy pasting into your code editor.
- **md support**: support for markdown files. 


## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/bouajilaProg/cool-docs.git
   ```

2. Navigate to the project directory and run the build for Linux:
   ```bash
   npm run tauri build
   ```
   For building on other platforms, you can check the [Tauri documentation](https://tauri.app/distribute/) for detailed instructions.

3. For testing the app, use:
   ```bash
   npm run tauri dev
   ```

4. After building, go to:
   ```
   src-tauri/target/release/bundle
   ```
   and search for your system to find the appropriate build.

5. **Setting Up Data**: 
   Create a `/data/repo/<your language>` directory, and inside it, add the XML files containing your documentation.

  for now we only support c++ , python , java and c#.



## How to Add New Documentation

To create a new category or documentation file, follow this structure:

1. **Category**: Create a folder for your category (e.g., Algorithms, Data Structures).
2. **Documentation**: Inside the category folder, create an `file.xml` for each document.

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

```

In this XML file:
- Each `<document>` contains a name, category, creator, and content.
- Each `<item>` inside `<content>` can contain multiple `<title>`, `<text>`, and `<code>` elements, and you can add as many items as needed.


## Contributing

Feel free to fork the repository and submit pull requests. If you have suggestions or want to add your own XML documentation, open an issue or create a pull request with your changes.

