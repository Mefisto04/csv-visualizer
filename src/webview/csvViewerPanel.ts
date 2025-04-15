import * as vscode from 'vscode';
import { CsvParser, CsvData } from '../utils/csvParser';

export class CsvViewerPanel {
    /**
     * Track the currently panel. Only allow a single panel to exist at a time.
     */
    public static currentPanel: CsvViewerPanel | undefined;

    public static readonly viewType = 'csvViewer';

    private readonly _panel: vscode.WebviewPanel;
    private readonly _extensionUri: vscode.Uri;
    private _document: vscode.TextDocument;
    private _disposables: vscode.Disposable[] = [];

    /**
     * Create or show a CSV viewer panel
     * @param extensionUri The extension URI
     * @param document The CSV document to display
     */
    public static createOrShow(extensionUri: vscode.Uri, document: vscode.TextDocument) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        // If we already have a panel, show it
        if (CsvViewerPanel.currentPanel) {
            CsvViewerPanel.currentPanel._panel.reveal(column);
            CsvViewerPanel.currentPanel.updateContent(document);
            return;
        }

        // Otherwise, create a new panel
        const panel = vscode.window.createWebviewPanel(
            CsvViewerPanel.viewType,
            'CSV Viewer',
            column || vscode.ViewColumn.One,
            {
                // Enable JavaScript in the webview
                enableScripts: true,
                // Restrict the webview to only load resources from the extension's directory
                localResourceRoots: [extensionUri]
            }
        );

        CsvViewerPanel.currentPanel = new CsvViewerPanel(panel, extensionUri, document);
    }

    /**
     * Revive the panel after VS Code restart
     * @param panel The webview panel to revive
     * @param extensionUri The extension URI
     */
    public static revive(panel: vscode.WebviewPanel, _extensionUri: vscode.Uri) {
        // We don't have a document to display here, so we'll show an error
        panel.webview.html = CsvViewerPanel.getErrorHtml('Please reopen a CSV file.');
    }

    /**
     * Create the CSV viewer panel
     * @param panel The webview panel
     * @param extensionUri The extension URI
     * @param document The CSV document to display
     */
    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, document: vscode.TextDocument) {
        this._panel = panel;
        this._extensionUri = extensionUri;
        this._document = document;

        // Set the webview's initial html content
        this.updateContent(document);

        // Listen for when the panel is disposed
        // This happens when the user closes the panel or when the panel is closed programmatically
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

        // Handle messages from the webview
        this._panel.webview.onDidReceiveMessage(
            message => {
                switch (message.command) {
                    case 'executeQuery':
                        this.handleSqlQuery(message.query);
                        break;
                    case 'filterData':
                        this.applyFilters(message.filters);
                        break;
                    case 'exportData':
                        this.exportData(message.format);
                        break;
                }
            },
            null,
            this._disposables
        );
    }

    /**
     * Update the webview content with the CSV data
     * @param document The CSV document to display
     */
    public updateContent(document: vscode.TextDocument) {
        this._document = document;
        try {
            const csvData = CsvParser.parseDocument(document);
            this._panel.webview.html = this.getWebviewContent(csvData);
            this._panel.title = `CSV Viewer: ${document.fileName.split(/[\\/]/).pop()}`;
        } catch (error) {
            this._panel.webview.html = CsvViewerPanel.getErrorHtml(`Error parsing CSV: ${error}`);
        }
    }

    /**
     * Execute a SQL query on the CSV data
     * @param query The SQL query to execute
     */
    private handleSqlQuery(_query: string) {
        // In a real implementation, we would use sql.js here to execute the query
        // For now, we'll just send a message back to the webview with mock data
        this._panel.webview.postMessage({
            command: 'queryResult',
            result: 'Query execution not implemented yet.'
        });
    }

    /**
     * Apply filters to the CSV data
     * @param filters The filters to apply
     */
    private applyFilters(filters: any) {
        // In a real implementation, we would filter the data here
        // For now, we'll just log the filters
        console.log('Filters applied:', filters);
    }

    /**
     * Export the CSV data to a different format
     * @param format The format to export to
     */
    private exportData(format: string) {
        // In a real implementation, we would export the data here
        vscode.window.showInformationMessage(`Export to ${format} not implemented yet.`);
    }

    /**
     * Get the HTML content for the webview
     * @param csvData The parsed CSV data
     * @returns The HTML content
     */
    private getWebviewContent(csvData: CsvData): string {
        const { headers, rows } = csvData;

        // Convert the CSV data to JSON for the webview
        const dataJson = JSON.stringify({ headers, rows });

        return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>CSV Viewer</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
                padding: 0;
                margin: 0;
            }
            .container {
                display: flex;
                flex-direction: column;
                height: 100vh;
            }
            .toolbar {
                padding: 10px;
                background-color: var(--vscode-editor-background);
                border-bottom: 1px solid var(--vscode-panel-border);
                display: flex;
                justify-content: space-between;
                flex-wrap: wrap;
            }
            .filters {
                display: flex;
                gap: 10px;
                align-items: center;
                flex-wrap: wrap;
            }
            .filter-section {
                display: flex;
                align-items: center;
                gap: 5px;
            }
            .columns-section {
                margin-top: 10px;
                border-top: 1px solid var(--vscode-panel-border);
                padding-top: 10px;
                width: 100%;
            }
            .sql-section {
                display: flex;
                align-items: center;
                gap: 5px;
                margin-top: 10px;
                width: 100%;
            }
            .sql-input {
                flex-grow: 1;
                padding: 5px;
                border: 1px solid var(--vscode-input-border);
                background-color: var(--vscode-input-background);
                color: var(--vscode-input-foreground);
            }
            button {
                background-color: var(--vscode-button-background);
                color: var(--vscode-button-foreground);
                border: none;
                padding: 5px 10px;
                cursor: pointer;
            }
            button:hover {
                background-color: var(--vscode-button-hoverBackground);
            }
            .table-container {
                flex-grow: 1;
                overflow: auto;
                border-top: 1px solid var(--vscode-panel-border);
            }
            table {
                width: 100%;
                border-collapse: collapse;
                table-layout: fixed;
            }
            th {
                position: sticky;
                top: 0;
                background-color: var(--vscode-editor-background);
                padding: 8px;
                text-align: left;
                border-bottom: 1px solid var(--vscode-panel-border);
                cursor: pointer;
                user-select: none;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            th.sorted {
                background-color: var(--vscode-list-activeSelectionBackground);
                color: var(--vscode-list-activeSelectionForeground);
            }
            td {
                padding: 8px;
                border-bottom: 1px solid var(--vscode-panel-border);
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            tr:nth-child(even) {
                background-color: var(--vscode-list-hoverBackground);
            }
            select, input[type="text"] {
                padding: 5px;
                border: 1px solid var(--vscode-input-border);
                background-color: var(--vscode-input-background);
                color: var(--vscode-input-foreground);
            }
            .column-select {
                display: flex;
                flex-wrap: wrap;
                gap: 5px;
                margin-top: 5px;
            }
            .column-checkbox {
                display: flex;
                align-items: center;
                gap: 3px;
                margin-right: 10px;
            }
            .status-bar {
                padding: 5px 10px;
                background-color: var(--vscode-statusBar-background);
                color: var(--vscode-statusBar-foreground);
                display: flex;
                justify-content: space-between;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="toolbar">
                <div class="filters">
                    <div class="filter-section">
                        <label for="filter-column">Filter:</label>
                        <select id="filter-column">
                            <option value="">Select column...</option>
                            ${headers.map((header, index) => `<option value="${index}">${header}</option>`).join('')}
                        </select>
                        <select id="filter-operator">
                            <option value="contains">contains</option>
                            <option value="equals">equals</option>
                            <option value="startsWith">starts with</option>
                            <option value="endsWith">ends with</option>
                            <option value="greaterThan">greater than</option>
                            <option value="lessThan">less than</option>
                        </select>
                        <input type="text" id="filter-value" placeholder="Value">
                        <button id="apply-filter">Apply</button>
                        <button id="clear-filters">Clear Filters</button>
                    </div>
                    <div class="filter-section">
                        <button id="export-btn">Export</button>
                        <select id="export-format">
                            <option value="csv">CSV</option>
                            <option value="json">JSON</option>
                            <option value="excel">Excel</option>
                        </select>
                    </div>
                </div>
                <div class="columns-section">
                    <div class="filter-section">
                        <label>Columns:</label>
                        <button id="select-all-columns">Select All</button>
                        <button id="clear-all-columns">Clear All</button>
                    </div>
                    <div class="column-select" id="column-select">
                        ${headers.map((header, index) => `
                            <div class="column-checkbox">
                                <input type="checkbox" id="col-${index}" name="column" value="${index}" checked>
                                <label for="col-${index}">${header}</label>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="sql-section">
                    <label for="sql-query">SQL:</label>
                    <input type="text" id="sql-query" class="sql-input" placeholder="Enter SQL query...">
                    <button id="run-query">Run Query</button>
                </div>
            </div>
            <div class="table-container">
                <table id="csv-table">
                    <thead>
                        <tr>
                            ${headers.map(header => `<th data-sortable="true">${header}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${rows.map(row => `
                            <tr>
                                ${row.map(cell => `<td>${cell}</td>`).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            <div class="status-bar">
                <div id="row-count">${rows.length} rows</div>
                <div id="status-message"></div>
            </div>
        </div>
        <script>
            (function() {
                // CSV data from the backend
                const csvData = ${dataJson};
                let displayData = [...csvData.rows];
                let activeFilters = [];
                let sortColumn = -1;
                let sortAscending = true;
                const vscode = acquireVsCodeApi();
                
                // DOM elements
                const table = document.getElementById('csv-table');
                const tbody = table.querySelector('tbody');
                const rowCount = document.getElementById('row-count');
                const filterColumn = document.getElementById('filter-column');
                const filterOperator = document.getElementById('filter-operator');
                const filterValue = document.getElementById('filter-value');
                const applyFilterBtn = document.getElementById('apply-filter');
                const clearFiltersBtn = document.getElementById('clear-filters');
                const sqlQuery = document.getElementById('sql-query');
                const runQueryBtn = document.getElementById('run-query');
                const exportBtn = document.getElementById('export-btn');
                const exportFormat = document.getElementById('export-format');
                const selectAllColumnsBtn = document.getElementById('select-all-columns');
                const clearAllColumnsBtn = document.getElementById('clear-all-columns');
                const columnCheckboxes = document.querySelectorAll('input[name="column"]');
                const statusMessage = document.getElementById('status-message');
                
                // Initialize table sort
                document.querySelectorAll('th[data-sortable="true"]').forEach((th, index) => {
                    th.addEventListener('click', () => {
                        if (sortColumn === index) {
                            sortAscending = !sortAscending;
                        } else {
                            sortColumn = index;
                            sortAscending = true;
                        }
                        
                        // Remove sorted class from all headers
                        document.querySelectorAll('th').forEach(el => el.classList.remove('sorted'));
                        
                        // Add sorted class to current header
                        th.classList.add('sorted');
                        th.setAttribute('data-sort-direction', sortAscending ? 'asc' : 'desc');
                        
                        // Sort the data
                        sortData();
                        renderTable();
                    });
                });
                
                // Sort data based on the selected column
                function sortData() {
                    if (sortColumn >= 0) {
                        displayData.sort((a, b) => {
                            const aVal = a[sortColumn];
                            const bVal = b[sortColumn];
                            
                            // Try to convert to numbers for numeric sorting
                            const aNum = parseFloat(aVal);
                            const bNum = parseFloat(bVal);
                            
                            if (!isNaN(aNum) && !isNaN(bNum)) {
                                return sortAscending ? aNum - bNum : bNum - aNum;
                            }
                            
                            // Fall back to string comparison
                            const aStr = String(aVal).toLowerCase();
                            const bStr = String(bVal).toLowerCase();
                            
                            if (aStr < bStr) return sortAscending ? -1 : 1;
                            if (aStr > bStr) return sortAscending ? 1 : -1;
                            return 0;
                        });
                    }
                }
                
                // Apply filter to the data
                applyFilterBtn.addEventListener('click', () => {
                    const column = filterColumn.value;
                    const operator = filterOperator.value;
                    const value = filterValue.value.trim();
                    
                    if (column === '' || value === '') {
                        return;
                    }
                    
                    // Add new filter
                    activeFilters.push({
                        column: parseInt(column),
                        operator,
                        value
                    });
                    
                    // Apply all filters
                    applyFilters();
                    renderTable();
                    
                    // Update status message
                    statusMessage.textContent = 'Filter applied';
                    setTimeout(() => { statusMessage.textContent = ''; }, 2000);
                });
                
                // Clear all filters
                clearFiltersBtn.addEventListener('click', () => {
                    activeFilters = [];
                    displayData = [...csvData.rows];
                    if (sortColumn >= 0) {
                        sortData();
                    }
                    renderTable();
                    
                    // Update status message
                    statusMessage.textContent = 'Filters cleared';
                    setTimeout(() => { statusMessage.textContent = ''; }, 2000);
                });
                
                // Apply all active filters
                function applyFilters() {
                    displayData = csvData.rows.filter(row => {
                        return activeFilters.every(filter => {
                            const cellValue = String(row[filter.column]).toLowerCase();
                            const filterValue = filter.value.toLowerCase();
                            
                            switch (filter.operator) {
                                case 'contains':
                                    return cellValue.includes(filterValue);
                                case 'equals':
                                    return cellValue === filterValue;
                                case 'startsWith':
                                    return cellValue.startsWith(filterValue);
                                case 'endsWith':
                                    return cellValue.endsWith(filterValue);
                                case 'greaterThan':
                                    return parseFloat(cellValue) > parseFloat(filterValue);
                                case 'lessThan':
                                    return parseFloat(cellValue) < parseFloat(filterValue);
                                default:
                                    return true;
                            }
                        });
                    });
                    
                    // Notify VSCode
                    vscode.postMessage({
                        command: 'filterData',
                        filters: activeFilters
                    });
                }
                
                // Run SQL Query
                runQueryBtn.addEventListener('click', () => {
                    const query = sqlQuery.value.trim();
                    if (query) {
                        statusMessage.textContent = 'Executing query...';
                        vscode.postMessage({
                            command: 'executeQuery',
                            query
                        });
                    }
                });
                
                // Export data
                exportBtn.addEventListener('click', () => {
                    const format = exportFormat.value;
                    statusMessage.textContent = 'Exporting data...';
                    vscode.postMessage({
                        command: 'exportData',
                        format
                    });
                });
                
                // Column visibility
                selectAllColumnsBtn.addEventListener('click', () => {
                    columnCheckboxes.forEach(cb => { cb.checked = true; });
                    updateColumnVisibility();
                });
                
                clearAllColumnsBtn.addEventListener('click', () => {
                    columnCheckboxes.forEach(cb => { cb.checked = false; });
                    updateColumnVisibility();
                });
                
                columnCheckboxes.forEach(cb => {
                    cb.addEventListener('change', updateColumnVisibility);
                });
                
                function updateColumnVisibility() {
                    const visibleColumns = Array.from(columnCheckboxes)
                        .map((cb, i) => ({ index: i, visible: cb.checked }));
                    
                    // Hide/show table columns
                    document.querySelectorAll('tr').forEach(row => {
                        const cells = row.querySelectorAll('th, td');
                        visibleColumns.forEach(col => {
                            if (cells[col.index]) {
                                cells[col.index].style.display = col.visible ? '' : 'none';
                            }
                        });
                    });
                }
                
                // Render the table with current display data
                function renderTable() {
                    // Clear the table body
                    tbody.innerHTML = '';
                    
                    // Add rows
                    displayData.forEach(row => {
                        const tr = document.createElement('tr');
                        row.forEach(cell => {
                            const td = document.createElement('td');
                            td.textContent = cell;
                            tr.appendChild(td);
                        });
                        tbody.appendChild(tr);
                    });
                    
                    // Update row count
                    rowCount.textContent = displayData.length + ' rows';
                    
                    // Apply column visibility
                    updateColumnVisibility();
                }
                
                // Handle messages from the extension
                window.addEventListener('message', event => {
                    const message = event.data;
                    switch (message.command) {
                        case 'queryResult':
                            statusMessage.textContent = message.result;
                            break;
                    }
                });
            })();
        </script>
    </body>
    </html>`;
    }

    /**
     * Get HTML for an error page
     * @param errorMessage The error message to display
     * @returns HTML for the error page
     */
    private static getErrorHtml(errorMessage: string): string {
        return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Error</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
                padding: 20px;
                text-align: center;
            }
            .error {
                color: #cc0000;
                font-size: 16px;
                margin-bottom: 20px;
            }
        </style>
    </head>
    <body>
        <div>
            <h2>CSV Viewer Error</h2>
            <div class="error">${errorMessage}</div>
            <p>Please try opening a different CSV file.</p>
        </div>
    </body>
    </html>`;
    }

    /**
     * Dispose of the panel and clean up resources
     */
    public dispose() {
        CsvViewerPanel.currentPanel = undefined;

        // Clean up our resources
        this._panel.dispose();

        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }
} 