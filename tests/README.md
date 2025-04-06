# DIY_Recipes Testing Documentation

This directory contains tests for the DIY_Recipes web application, focusing on the collapsible UI components and three-column layout.

## Test Files

### Core UI Tests
- `collapsible.test.js`: Jest tests for the collapsible UI components
- `layout.test.js`: Jest tests for the three-column layout
- `ui-rendering.test.js`: Jest tests for UI rendering components

### API and Data Tests
- `api.test.js`: Jest tests for API functions
- `api-interactions.test.js`: Jest tests for API interactions with Supabase, focusing on error handling and edge cases

### Feature Tests
- `recipe-actions.test.js`: Jest tests for recipe action components
- `recipe-analysis.test.js`: Jest tests for recipe analysis functionality
- `recipe-iteration.test.js`: Jest tests for recipe versioning and iteration
- `product-actions.test.js`: Jest tests for product action functionality

### Integration Tests
- `right-column-integration.test.js`: Jest tests for integration between right column components
- `component-integration.test.js`: Jest tests for integration between different UI components
- `error-handling.test.js`: Jest tests for error handling and edge cases

### End-to-End Tests
- `puppeteer.test.js`: Placeholder for Puppeteer tests
- `puppeteer-ui-tests.js`: Implementation of Puppeteer UI tests using the MCP server
- `regression.test.js`: Puppeteer tests for critical user flows and regression testing

## Running the Tests

### Jest Tests

To run all Jest tests:

```bash
npm test
```

This will run all the Jest tests in the `tests` directory.

To run a specific test file:

```bash
npm test -- tests/collapsible.test.js
```

To run tests with a specific pattern in their names:

```bash
npm test -- -t "renders correctly"
```

To run tests with coverage reporting:

```bash
npm test -- --coverage
```

### Running Specific Test Categories

#### UI Component Tests:
```bash
npm test -- tests/ui-rendering.test.js tests/collapsible.test.js tests/layout.test.js
```

#### API Tests:
```bash
npm test -- tests/api.test.js tests/api-interactions.test.js
```

#### Integration Tests:
```bash
npm test -- tests/component-integration.test.js tests/right-column-integration.test.js
```

#### Error Handling Tests:
```bash
npm test -- tests/error-handling.test.js
```

### End-to-End and Regression Tests

The project includes two types of end-to-end tests:

1. **Puppeteer UI Tests with MCP Server**: These tests use the Puppeteer MCP server for integration with the application.
2. **Regression Tests**: These are standalone Puppeteer tests that verify critical user flows.

#### Running Puppeteer MCP Tests

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

#### Running Regression Tests

1. Make sure the application server is running:

```bash
npm start
```

2. Run the regression tests:

```bash
npm test -- tests/regression.test.js
```

These tests will launch a browser, navigate to the application, and perform a series of interactions to verify that critical user flows are working correctly.

> **Note**: The regression tests require a running application server on http://localhost:3000. They will fail if the server is not running or is running on a different port.

## Test Coverage

The tests cover the following aspects of the application:

### UI Components and Rendering

- Rendering of collapsible sections with correct structure and accessibility attributes
- Color coding of collapsible sections
- Expanding and collapsing individual sections
- Keyboard navigation for accessibility
- Group toggling with "Expand All" / "Collapse All" buttons
- Multiple sections open simultaneously
- Rendering recipe lists with proper structure and sorting
- Rendering global ingredients lists
- Updating UI elements based on authentication state
- Creating and handling editable ingredient rows

### Layout and Structure

- Correct rendering of the three-column layout structure
- Header with recipe title and remove button
- Left column with ingredients and quick stats
- Middle column with instructions summary and collapsible sections
- Right column with collapsible sections and color coding
- Toggle buttons for expanding and collapsing all sections in a group
- Individual toggling of collapsible sections
- Responsive layout changes

### API and Data Handling

- Basic CRUD operations for recipes and ingredients
- Error handling for network issues and validation errors
- Processing empty or malformed responses
- Handling special characters and extremely long input
- Managing large result sets and empty inputs
- Supabase client interactions and error handling
- Recipe analysis and timeline generation
- Batch history tracking and shelf-life estimation

### Integration and User Flows

- Recipe selection updating UI across all columns
- Authentication state changes affecting UI visibility
- Edit mode toggle updating relevant UI elements
- Theme toggling functionality
- Collapsible sections expanding and collapsing correctly
- Error states and graceful degradation
- Component interactions and state management
- Race conditions in concurrent operations

### End-to-End Testing

- Navigation to the application
- Screenshots of the initial layout
- Interaction with recipe items
- Expanding and collapsing collapsible sections
- Screenshots after interactions
- Testing responsive behavior by resizing the viewport
- Critical user flows for recipe management
- Responsive design testing across different viewport sizes

## Adding New Tests

When adding new tests, follow these guidelines:

### General Testing Guidelines

1. **Organization**: Use the appropriate test file based on the feature being tested, or create a new file if needed
2. **Consistency**: Follow the existing test patterns for consistency in naming, structure, and assertions
3. **Isolation**: Ensure tests are isolated and don't depend on the state of other tests
4. **Documentation**: Add comments to explain the purpose of each test and any complex test setup
5. **Assertions**: Include specific assertions that verify the expected behavior, not just that code runs without errors

### Unit Testing Best Practices

1. **Single Responsibility**: Each test should focus on testing one specific behavior or feature
2. **Arrange-Act-Assert**: Structure tests with clear setup, action, and verification phases
3. **Mocking Dependencies**: Use Jest's mocking capabilities to isolate the code being tested
4. **Edge Cases**: Include tests for edge cases and error conditions
5. **Coverage**: Aim for high code coverage, but prioritize meaningful tests over coverage numbers

### Integration Testing Guidelines

1. **Component Interactions**: Focus on testing how components interact with each other
2. **State Management**: Verify that state is properly maintained across components
3. **Event Handling**: Test that events are properly propagated between components
4. **API Interactions**: Test that components correctly interact with API functions
5. **Error Propagation**: Verify that errors are properly handled and propagated

### End-to-End Testing Guidelines

1. **User Flows**: Focus on testing critical user flows from start to finish
2. **Browser Compatibility**: Test across different browsers if possible
3. **Responsive Design**: Test at different viewport sizes
4. **Performance**: Consider adding performance measurements for critical paths
5. **Accessibility**: Include tests for accessibility features

### Continuous Integration

1. **Automated Testing**: Ensure tests can run automatically in CI/CD pipelines
2. **Test Speed**: Keep tests fast to enable quick feedback
3. **Flaky Tests**: Identify and fix flaky tests that intermittently fail
4. **Test Reports**: Generate and review test coverage reports
5. **Test Maintenance**: Regularly review and update tests as the application evolves