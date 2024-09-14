# Web Annotator

## Description

Web Annotator is a Chrome extension that allows you to annotate web pages with highlights and notes. 

## Features

- Highlight text on any web page.
- Add notes to highlighted text.
- Export annotations as a pdf file.
- Search through annotations.
- Keyboard shortcut to toggle the highlighter.

## Installation

1. Clone or download this repository.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable "Developer mode" using the toggle at the top right.
4. Click "Load unpacked" and select the directory containing this extension's files.

## Usage

### Highlighting Text

1. Open the Web Annotator popup by clicking on the extension icon.
2. Select a highlighter color.
3. Click on the "Toggle Highlighter" button or use the keyboard shortcut (Ctrl+Shift+H on Windows/Linux, Command+Shift+H on macOS) to enable highlighting mode.
4. Select text on the web page to highlight it.
5. Click the highlighted text to add a note.

### Exporting Annotations

1. Open the Web Annotator popup.
2. Click on the "Export Annotations" button to download the annotations as a pdf file.

### Searching Annotations

1. Open the Web Annotator popup.
2. Use the search input to filter annotations by text content.

### Keyboard Shortcut

You can use the following keyboard shortcut to toggle the highlighter:

- **Windows/Linux**: `Ctrl+Shift+H`
- **macOS**: `Command+Shift+H`

### Deleting Annotations

To delete an annotation, click the delete icon.

## File Structure

- `manifest.json`: The configuration file for the Chrome extension.
- `popup.html`: The HTML file for the extension's popup.
- `popup.js`: The JavaScript file that handles interactions in the popup.
- `background.js`: The background script for handling extension events.
- `content.js`: The content script that interacts with web pages.
- `mycss.css`: The CSS file for styling the popup and annotations.
- `images/`: Directory containing icon images for the extension.


## Permissions

This extension requires the following permissions:

- `storage`: To store annotations locally.
- `activeTab`: To interact with the current active tab.
- `scripting`: To inject scripts into web pages.
- `unlimitedStorage`: To allow for a large number of annotations.

## Credits

This extension uses the [html2pdf.js](https://github.com/eKoopmans/html2pdf.js) library for exporting annotations as PDF.