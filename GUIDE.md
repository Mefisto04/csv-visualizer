# CSV Viewer Extension Guide

This guide will help you test and use the CSV Viewer extension you've built.

## How to Test the Extension

1. Open this folder in VS Code
2. Press F5 to launch a new Extension Development Host window
3. In the new window, open the sample.csv file that we created
4. Right-click in the editor and select "Open CSV Viewer" from the context menu

## Features to Test

### Viewing CSV Data

- The CSV data should appear in a nicely formatted table
- You should see column headers and data rows

### Sorting

- Click on any column header to sort by that column
- Click the same header again to toggle between ascending and descending order
- Notice the visual indicator showing the sort direction

### Filtering

- Use the filter section at the top to filter data:
  1. Select a column from the dropdown
  2. Choose an operator (contains, equals, etc.)
  3. Enter a filter value
  4. Click "Apply"
- Multiple filters can be applied sequentially
- Click "Clear Filters" to remove all filters

### Column Selection

- Use the "Columns" section to show/hide specific columns
- "Select All" and "Clear All" buttons provide quick options
- Individual column checkboxes toggle visibility

### SQL Query (Partial Implementation)

- Enter a SQL query in the SQL input box
- Click "Run Query" to execute the query
- Note: Full SQL implementation is planned for a future update

### Exporting (Partial Implementation)

- Select an export format from the dropdown
- Click "Export" to initiate an export
- Note: Full export implementation is planned for a future update

## Debugging

If you encounter issues:

- Check the Developer Tools console (Help > Toggle Developer Tools)
- Look at the VS Code "Extension Development Host" output panel
- Ensure all dependencies are correctly installed

## Publishing the Extension

When you're ready to share your extension:

1. Create a publisher account on the VS Code Marketplace
2. Update the `publisher` field in package.json
3. Run `vscode:prepublish` script to create a production build
4. Run `vscode --install-extension csv-viewer-0.0.1.vsix` to test the packaged extension
5. Publish to the VS Code Marketplace using `vsce publish`

## Next Steps

Consider implementing these enhancements:

- Complete the SQL query functionality using sql.js
- Add proper export functionality for different formats
- Add pagination for large CSV files
- Implement data editing capabilities
- Add charts and visualizations
