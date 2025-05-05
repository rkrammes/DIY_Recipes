# Automated Testing with Puppeteer and Context7 MCPs

This document describes the enhanced automated testing approach for DIY Recipes using the Puppeteer and Context7 MCPs (Model Context Protocol).

## Overview

The testing framework combines:

1. **Puppeteer MCP** - For browser automation and visual testing
2. **Context7 MCP** - For documentation verification and best practices
3. **Custom test runners** - To orchestrate the testing process

This integrated approach provides comprehensive test coverage, combining visual verification, functional testing, and documentation compliance.

## Test Categories

### 1. Basic App Tests

These tests verify the fundamental functionality of the app:

- Navigation and routing
- Theme switching
- Component rendering
- Error handling
- Server-side rendering
- Hydration

### 2. Circular Dependency Tests

Specific tests to verify that circular dependencies have been resolved:

- Provider initialization order
- Theme propagation between providers
- No circular dependency errors in the console

### 3. SSR Tests

Tests focused on server-side rendering correctness:

- Content loading during SSR
- No hydration mismatches
- Browser APIs only used client-side

### 4. Integration Tests

Tests that combine Puppeteer and Context7 MCPs:

- Tailwind CSS implementation verification
- Next.js SSR best practices
- Theme implementation validation

## Running the Tests

### Prerequisites

Make sure you have installed all dependencies:

```bash
npm install
```

### Running All Tests

To run the full test suite:

```bash
npm test
```

This will:
1. Start a test server
2. Run all app tests with Puppeteer MCP
3. Run integration tests with both Puppeteer and Context7 MCPs
4. Generate test reports

### Running Specific Tests

For Puppeteer-only tests:

```bash
npm run test:puppeteer
```

For integration tests with Context7:

```bash
npm run test:integration
```

## Test Reports

Test results are saved to:

- `test-artifacts/` - For basic app tests
- `integration-test-artifacts/` - For integration tests

Each directory contains:
- Screenshots captured during testing
- A Markdown report with test results
- JSON files with detailed test data

## Puppeteer MCP Usage

The Puppeteer MCP is used for:

1. **Browser automation** - Navigating pages, clicking elements, etc.
2. **Visual testing** - Capturing screenshots for different states
3. **DOM inspection** - Checking rendered elements and attributes
4. **JavaScript execution** - Running scripts in the browser context

Example:

```javascript
// Navigate to a page
await puppeteer.navigateToUrl('http://localhost:3000/theme-demo');

// Take a screenshot
const screenshot = await puppeteer.takeScreenshot();

// Click a button
await puppeteer.clickElement('.theme-toggle');

// Execute JavaScript in the browser
const result = await puppeteer.evaluateScript(`
  document.documentElement.getAttribute('data-theme')
`);
```

## Context7 MCP Usage

The Context7 MCP is used for:

1. **Documentation verification** - Checking implementations against official docs
2. **API usage validation** - Ensuring correct API usage
3. **Best practices verification** - Confirming we follow recommended patterns

Example:

```javascript
// Get Tailwind CSS documentation
const tailwindDocs = await context7.getDocumentation('tailwind', 'latest', 'theming');

// Validate code against Next.js API
const validationResult = await context7.validate(code, 'next', 'latest');

// Search for a specific topic
const searchResults = await context7.search('server components', ['next']);
```

## Custom Test Assertions

The testing framework includes custom assertions for:

1. **Theme verification** - Checking if themes are applied correctly
2. **SSR safety** - Ensuring no browser APIs are accessed during SSR
3. **Circular dependency prevention** - Verifying no circular dependencies exist

## Adding New Tests

To add new tests:

1. Create a new test file in the project root
2. Use the Puppeteer and Context7 MCPs as needed
3. Add the test to the appropriate test runner

Example of a new test file:

```javascript
const { getMcpAdapter } = require('./src/lib/mcp/adapters');

async function myNewTest() {
  const puppeteer = getMcpAdapter('puppeteer');
  const context7 = getMcpAdapter('context7');
  
  await puppeteer.connect();
  await context7.connect();
  
  // Test implementation
  // ...
  
  await puppeteer.disconnect();
  await context7.disconnect();
}

module.exports = { myNewTest };
```

## Continuous Integration

These tests can be integrated into a CI pipeline by:

1. Setting up the required MCP servers in the CI environment
2. Running the test scripts with Node.js
3. Using the exit code to determine test success/failure

## Conclusion

This enhanced testing approach provides comprehensive coverage of the DIY Recipes app, ensuring that:

1. Circular dependencies are properly resolved
2. Server-side rendering works correctly
3. Theme implementation follows best practices
4. The app adheres to documentation guidelines