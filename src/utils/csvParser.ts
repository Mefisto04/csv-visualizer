import * as vscode from 'vscode';
import { parse } from 'csv-parse/sync';

export interface CsvData {
    headers: string[];
    rows: string[][];
}

export class CsvParser {
    /**
     * Parse a CSV document into headers and rows
     * @param document The VSCode document containing CSV content
     * @returns Parsed CSV data with headers and rows
     */
    public static parseDocument(document: vscode.TextDocument): CsvData {
        const text = document.getText();
        return this.parseText(text);
    }

    /**
     * Parse CSV text content into headers and rows
     * @param text The CSV text content
     * @returns Parsed CSV data with headers and rows
     */
    public static parseText(text: string): CsvData {
        try {
            // Parse the CSV with the csv-parse library
            const records = parse(text, {
                columns: false,
                skip_empty_lines: true,
                trim: true
            }) as string[][];

            if (records.length === 0) {
                return { headers: [], rows: [] };
            }

            // Extract headers and rows
            const headers = records[0];
            const rows = records.slice(1);

            return { headers, rows };
        } catch (error) {
            console.error('Error parsing CSV:', error);
            throw new Error(`Failed to parse CSV: ${error}`);
        }
    }
} 