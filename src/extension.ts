import * as vscode from 'vscode';
import { CsvViewerPanel } from './webview/csvViewerPanel';

export function activate(context: vscode.ExtensionContext) {
    console.log('CSV Viewer extension is now active!');

    // Register the command to open CSV viewer
    const openViewerCommand = vscode.commands.registerCommand('csv-viewer.openViewer', async () => {
        const editor = vscode.window.activeTextEditor;

        // If there's no active editor or it's not a CSV file, show an error
        if (!editor || !editor.document.fileName.toLowerCase().endsWith('.csv')) {
            const fileUri = await vscode.window.showOpenDialog({
                canSelectFiles: true,
                canSelectFolders: false,
                canSelectMany: false,
                filters: {
                    'CSV Files': ['csv']
                },
                title: 'Select CSV File to Open'
            });

            if (!fileUri || fileUri.length === 0) {
                return;
            }

            const document = await vscode.workspace.openTextDocument(fileUri[0]);
            CsvViewerPanel.createOrShow(context.extensionUri, document);
            return;
        }

        CsvViewerPanel.createOrShow(context.extensionUri, editor.document);
    });

    context.subscriptions.push(openViewerCommand);

    // Register a content provider to handle CSV files
    if (vscode.window.registerWebviewPanelSerializer) {
        vscode.window.registerWebviewPanelSerializer(CsvViewerPanel.viewType, {
            async deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel, _state: any) {
                CsvViewerPanel.revive(webviewPanel, context.extensionUri);
            }
        });
    }
}

export function deactivate() { } 