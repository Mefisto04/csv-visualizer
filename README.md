# CSV Viewer

A Visual Studio Code extension for visualizing CSV files with advanced features including sorting, filtering, column selection and SQL query support.

## Features

- **Table View**: Display CSV files in a clean, tabular format
- **Sort**: Click on column headers to sort data ascending or descending
- **Filter**: Apply filters to any column with various comparison operators
- **Column Selection**: Show/hide specific columns
- **SQL Support**: Run SQL queries against your CSV data
- **Export**: Export data to different formats (CSV, JSON, Excel)

## Usage

To use the CSV Viewer:

1. Open a CSV file in VS Code
2. Right-click in the editor and select "Open CSV Viewer" from the context menu
3. Alternatively, right-click on a CSV file in the Explorer and select "Open CSV Viewer"
4. Use the various features in the viewer interface to explore and manipulate your data

## Requirements

- Visual Studio Code version 1.60.0 or higher

## Extension Settings

This extension doesn't add any VS Code settings.

## Future Enhancements

- Complete SQL query support
- Enhanced filtering capabilities
- Improved export options
- Customization of table appearance

## Development

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Setup

1. Clone the repository
2. Run `npm install` to install dependencies
3. Run `npm run compile` to compile the TypeScript code
4. Press F5 to launch the extension in a new VS Code window

### Building

To build a VSIX package:

```bash
npm run package
```

## License

MIT
