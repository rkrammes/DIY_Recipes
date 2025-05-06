# How to Test the Document-Centric Formulation Interface

This guide explains how to test the document-centric formulation interface that has been implemented for DIY recipes.

## Available Testing Routes

1. **Simple Document View** - A minimal implementation for basic testing:
   ```
   http://localhost:3000/simple-doc
   ```
   
2. **Document Test Page** - A testing page with mock data for iterations:
   ```
   http://localhost:3000/document-test
   ```
   
3. **Full Document View** - The complete implementation (requires database):
   ```
   http://localhost:3000/document-view?id=1
   ```

## Testing with Puppeteer

Several test scripts have been created to verify functionality:

1. **Test the Simple Document View**:
   ```bash
   node test-simple-doc-fixed.js
   ```
   
2. **Test the Document Test Page with Iterations**:
   ```bash
   node test-document-iterations-complete.js
   ```

These tests will generate screenshots in the `test-artifacts` directory and create test reports.

## Key Features to Test

1. **Making Mode**:
   - Click the "Making Mode" button
   - Navigate through steps with Next/Previous buttons
   - Try scaling ingredients with the 2× button in Making Mode
   - Exit Making Mode

2. **Version Timeline** (in document-test):
   - Click on different version buttons (v1, v2, v3)
   - Observe content changes between versions
   - Try the "Create New Version" button

3. **Print Functionality**:
   - Locate the Print button in the header
   - Try Print Preview (opens in a new tab)
   - Check print styling with your browser's print preview

## Troubleshooting

If you encounter issues:

1. **Database Connectivity**: The full document view requires database connectivity. Use the document-test page for testing without a database.

2. **Missing Functionality**: If certain features don't appear, try the simplified view at `/simple-doc` which has the core Making Mode functionality.

3. **Test Failures**: Check the test reports in the `test-artifacts` directory for details on what failed.

## Implementation Summary

The document-centric formulation interface provides:

- A unified document view for DIY formulations
- Making Mode with step-by-step guidance
- Version timeline for navigating between iterations
- Print support for physical reference

The implementation prioritizes the needs of DIY makers who want to follow steps while creating products, while also providing version management for iterative improvement of formulations.