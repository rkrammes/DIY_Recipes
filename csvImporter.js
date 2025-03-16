/**
 * File: csvImporter.js
 * Project: Symbolkraft DIY Recipes Web App
 *
 * Description:
 *   This module handles CSV file uploads, parsing, and validation.
 *   It transforms raw CSV data into structured recipe and ingredient objects that
 *   can be stored in the Supabase database.
 *
 * Big Picture:
 *   - The parsed data is forwarded to supabaseConnector.js for database storage.
 *   - This module is essential for efficient batch processing and maintaining data consistency.
 *
 * Related Modules:
 *   - index.js: Uses this module to import CSV data.
 *   - supabaseConnector.js: Receives structured data for further processing.
 *
 * NOTE for ChatGPT & Developers:
 *   Always refer to the overall project context in the global headers of index.js and the README.md.
 *   This file is critical for ensuring that data flows smoothly from raw CSV input to the database.
 *
 * Instructions for Integration:
 *   1. Copy and paste this file into your project as "csvImporter.js".
 *   2. Review and customize the code or comments as necessary.
 *   3. Commit the changes to your GitHub repository.
 *   4. Use this file as a reference to maintain context in future ChatGPT sessions.
 *
 * Version: v1.0 | Last Updated: 2025-03-16
 * Author: [Your Name]
 */

/**
 * Parses a CSV string and returns an array of objects representing recipes or ingredients.
 *
 * @param {string} csvString - The raw CSV data as a string.
 * @returns {Array<Object>} - An array of objects where each object represents a row in the CSV.
 *
 * Big Picture:
 *   This function is responsible for converting raw CSV data into a structured format
 *   that can be seamlessly integrated with the Supabase backend. It assumes that the first
 *   line of the CSV contains header names.
 */
function parseCSV(csvString) {
  // Ensure the input is a string.
  if (typeof csvString !== 'string') {
    throw new Error('Invalid input: CSV data must be a string.');
  }
  
  // Split the CSV string by newline to separate the rows.
  const rows = csvString.trim().split('\n');
  if (rows.length < 2) {
    throw new Error('CSV data must contain at least one header row and one data row.');
  }
  
  // Extract headers from the first row.
  const headers = rows[0].split(',').map(header => header.trim());
  
  // Process each subsequent row to create an object using the headers.
  const data = rows.slice(1).map(row => {
    const values = row.split(',').map(value => value.trim());
    const rowObject = {};
    headers.forEach((header, index) => {
      rowObject[header] = values[index];
    });
    return rowObject;
  });
  
  // Big Picture: Return structured data ready for insertion into the database.
  return data;
}

// Export the parseCSV function so that other modules can use it.
module.exports = {
  parseCSV
};
