# TESTING.md

## Overview
This document provides guidelines and instructions for testing the Symbolkraft DIY Recipes Web App. It outlines recommended testing practices, frameworks, and commands to ensure that all modules and features of the application function correctly.

## Testing Objectives
- **Unit Testing:**  
  Ensure that individual modules (e.g., csvImporter.js, authUtils.js, aiSuggestion.js, supabaseConnector.js) function as expected.
  
- **Integration Testing:**  
  Verify that modules interact correctly (e.g., CSV data is properly parsed and stored in Supabase).
  
- **End-to-End Testing (E2E):**  
  Simulate user interactions with the application (if applicable) to confirm that the overall workflow is working as intended.

## Recommended Testing Frameworks
- **Unit Testing:**  
  Consider using **Jest** or **Mocha/Chai** for unit tests.
  
- **Integration/E2E Testing:**  
  Tools like **Supertest** (for API endpoints) and **Cypress** (for full application tests) can be used.

## Setting Up Testing
1. **Install a Testing Framework:**
   - For Jest:
     ```bash
     npm install --save-dev jest
     ```
   - For Mocha/Chai:
     ```bash
     npm install --save-dev mocha chai
     ```
     
2. **Update package.json:**
   - Add a test script to your `package.json`. For example, if using Jest:
     ```json
     "scripts": {
       "test": "jest"
     }
     ```
   - For Mocha:
     ```json
     "scripts": {
       "test": "mocha"
     }
     ```

## Writing Tests
- **Unit Tests:**  
  Create test files in a `tests/` directory. For each module (e.g., `csvImporter.js`), create a corresponding test file (e.g., `csvImporter.test.js`) that imports the module and runs assertions on its functions.

- **Integration Tests:**  
  Write tests to simulate interactions between modules. For example, test that parsed CSV data is correctly stored using the functions in `supabaseConnector.js`.

- **End-to-End Tests:**  
  If applicable, create E2E tests that simulate user actions (e.g., using Supertest or Cypress) to test API endpoints and UI flows.

## Running Tests
- **Unit/Integration Tests:**  
  Run the test command defined in your `package.json`:
  ```bash
  npm test
