# DIY_Recipes Testing Documentation

This directory contains tests for the DIY_Recipes web application, focusing on the collapsible UI components and three-column layout.

## Test Files

- `collapsible.test.js`: Jest tests for the collapsible UI components
- `layout.test.js`: Jest tests for the three-column layout
- `puppeteer.test.js`: Placeholder for Puppeteer tests
- `puppeteer-ui-tests.js`: Implementation of Puppeteer UI tests using the MCP server

## Running the Tests

### Jest Tests

To run the Jest tests:

```bash
npm test
```

This will run all the Jest tests in the `tests` directory.

To run a specific test file:

```bash
npm test -- tests/collapsible.test.js
```

### Puppeteer UI Tests

The Puppeteer UI tests are implemented using the Puppeteer MCP server. To run these tests:

1. Make sure the application server is running:

```bash
npm start
```

2. Use the Puppeteer MCP server to run the tests:

```javascript
// Example of using the Puppeteer MCP server to run the tests
const { runPuppeteerTests } = require('./tests/puppeteer-ui-tests');
runPuppeteerTests();
```

## Test Coverage

The tests cover the following aspects of the application:

### Collapsible UI Components

- Rendering of collapsible sections with correct structure and accessibility attributes
- Color coding of collapsible sections
- Expanding and collapsing individual sections
- Keyboard navigation for accessibility
- Group toggling with "Expand All" / "Collapse All" buttons
- Multiple sections open simultaneously

### Three-Column Layout

- Correct rendering of the three-column layout structure
- Header with recipe title and remove button
- Left column with ingredients and quick stats
- Middle column with instructions summary and collapsible sections
- Right column with collapsible sections and color coding
- Toggle buttons for expanding and collapsing all sections in a group
- Individual toggling of collapsible sections
- Responsive layout changes

### Puppeteer UI Tests

- Navigation to the application
- Screenshots of the initial layout
- Interaction with recipe items
- Expanding and collapsing collapsible sections
- Screenshots after interactions
- Testing responsive behavior by resizing the viewport

## Adding New Tests

When adding new tests, follow these guidelines:

1. Use the appropriate test file based on the feature being tested
2. Follow the existing test patterns for consistency
3. Ensure tests are isolated and don't depend on the state of other tests
4. Include appropriate assertions to verify the expected behavior
5. Add comments to explain the purpose of each test