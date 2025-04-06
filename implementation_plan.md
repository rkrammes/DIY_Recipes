# Implementation Plan for Right Column Actions

This document outlines the implementation strategy for the right column actions described in `architecture.md`. The plan breaks down the work into specific tasks that can be assigned to appropriate modes.

## Implementation Phases

### Phase 1: Core Infrastructure (Boomerang → Code)

The Boomerang mode should coordinate this phase, delegating the technical implementation to Code mode.

#### 1.1 Data Model Enhancement

**Task:** Extend the current data model to support new action requirements

**Code mode tasks:**
- Add version tracking to recipe data structure
- Create schema for batch records
- Implement ingredient substitution mapping
- Design cost calculation data structure

**Files to modify:**
- `js/api.js` - Add new data structures and API methods
- `js/main.js` - Update initialization code
- Create new file: `js/recipe-actions.js` for action-specific logic

#### 1.2 UI Component Framework

**Task:** Create reusable UI components for right column actions

**Code mode tasks:**
- Develop collapsible action panels
- Create input controls (sliders, toggles, etc.)
- Implement result display components

**Files to modify:**
- `js/ui.js` - Add component creation functions
- `style.css` - Add styling for new components

### Phase 2: Basic Action Implementation (Simple Code)

Simple Code mode can handle these more straightforward implementation tasks.

#### 2.1 Product Creation Actions

**Task:** Implement core product creation features

**Simple Code tasks:**
- Build recipe scaling functionality
- Create unit conversion system
- Implement print/export feature
- Develop shopping list generator

**Files to create/modify:**
- Create new file: `js/product-actions.js`
- Update `index.html` to include new UI elements
- Extend `style.css` with new component styles

#### 2.2 Recipe Iteration Actions

**Task:** Implement basic recipe editing features

**Simple Code tasks:**
- Create version creation workflow
- Build basic ingredient substitution UI
- Implement notes/results tracking
- Develop simple version comparison

**Files to create/modify:**
- Create new file: `js/recipe-iteration.js`
- Update `index.html` with iteration UI elements
- Extend `js/ui.js` with new rendering functions

### Phase 3: Advanced Features (Code)

Code mode should handle these more complex implementation tasks.

#### 3.1 Advanced Analysis

**Task:** Implement sophisticated analysis features

**Code mode tasks:**
- Develop ingredient analysis algorithm
- Create recipe timeline visualization
- Build batch tracking system
- Implement shelf-life calculator

**Files to create/modify:**
- Create new file: `js/recipe-analysis.js`
- Update `js/api.js` with analysis methods
- Extend `js/ui.js` with visualization components

#### 3.2 Integration & Polish

**Task:** Ensure all components work together seamlessly

**Code mode tasks:**
- Integrate all action components
- Implement state management
- Optimize performance
- Add responsive design adjustments

**Files to modify:**
- All JavaScript files for integration
- `style.css` for responsive design
- `index.html` for final structure

### Phase 4: Testing & Refinement (Debug)

Debug mode should handle validation and refinement of the implementation.

#### 4.1 Functional Testing

**Task:** Verify all actions work as expected

**Debug mode tasks:**
- Test each action individually
- Verify data persistence
- Check calculations accuracy
- Validate UI behavior

#### 4.2 Edge Case Handling

**Task:** Ensure robustness in unusual scenarios

**Debug mode tasks:**
- Test with minimal/empty data
- Verify error handling
- Check boundary conditions (very large recipes, etc.)
- Test performance with many recipes/versions

## Implementation Strategy

### Component Structure

The right column actions should be implemented as modular components following this pattern:

```javascript
// Action component pattern
const ActionComponent = {
  render: (container, recipe) => {
    // Create and append UI elements
    // Return reference to component
  },
  
  handleEvent: (event, recipe) => {
    // Process user interaction
    // Update UI as needed
  },
  
  update: (recipe) => {
    // Update component with new recipe data
  }
};
```

### State Management

Use a publish/subscribe pattern to maintain state across components:

```javascript
// Event system
const Events = {
  subscribe: (event, callback) => { /* ... */ },
  publish: (event, data) => { /* ... */ },
  unsubscribe: (event, callback) => { /* ... */ }
};

// Example usage
Events.subscribe('recipe:scaled', (newQuantities) => {
  // Update UI with new quantities
});
```

### Styling Approach

Follow these principles for consistent styling:

1. Use existing color variables from `style.css`
2. Create specific classes for each action component
3. Follow the established pattern for the right column (orange accents)
4. Use CSS Grid for layout within action panels

## Task Assignment for Modes

### Boomerang Mode
- Coordinate overall implementation
- Delegate specific tasks to appropriate modes
- Track progress and integration points
- Ensure architectural consistency

### Code Mode
- Implement complex algorithms (analysis, calculations)
- Develop core infrastructure
- Create advanced UI components
- Handle state management

### Simple Code Mode
- Implement straightforward UI components
- Build basic action functionality
- Create styling for new elements
- Integrate with existing UI

### Debug Mode
- Test all functionality
- Identify and fix issues
- Optimize performance
- Ensure cross-browser compatibility

## Next Steps

1. Pass this implementation plan to Boomerang mode to begin coordination
2. Start with Phase 1 (Core Infrastructure) using Code mode
3. Proceed through phases sequentially, with appropriate mode assignments
4. Conduct regular integration tests to ensure components work together