# Right Column Implementation Plan

This document outlines the implementation strategy for the revised right column approach described in `right_column_actions.md`. The plan focuses on creating a dynamic action panel that responds to navigation selections.

## Implementation Phases

### Phase 1: Clear and Prepare (Code)

#### 1.1 Remove Existing Content

**Task:** Remove all current content and functionality from the right column

**Code tasks:**
- Remove existing right column HTML elements from index.html
- Remove or comment out related JavaScript code
- Remove or comment out related CSS styles

**Files to modify:**
- `index.html` - Remove right column content
- `js/ui.js` - Remove right column functionality
- `style.css` - Retain only structural styling for the right column

#### 1.2 Create Action Registry System

**Task:** Build the central registry for managing available actions

**Code tasks:**
- Create action registry data structure
- Implement methods to register actions
- Implement methods to retrieve actions by selection type

**Files to create/modify:**
- Create new file: `js/action-registry.js`
- Update `js/main.js` to initialize the registry

### Phase 2: Core Action Components (Simple Code)

#### 2.1 Recipe Editing Actions

**Task:** Implement the basic recipe editing actions

**Simple Code tasks:**
- Create edit recipe details action
- Create edit ingredients action
- Create adjust volume action
- Create edit instructions action
- Create edit notes action

**Files to create/modify:**
- Create new file: `js/actions/recipe-edit-actions.js`
- Update `js/action-registry.js` to register these actions

#### 2.2 Recipe Utility Actions

**Task:** Implement utility actions for recipes

**Simple Code tasks:**
- Create print recipe action
- Create export recipe action
- Create generate shopping list action
- Create calculate costs action

**Files to create/modify:**
- Create new file: `js/actions/recipe-utility-actions.js`
- Update `js/action-registry.js` to register these actions

#### 2.3 Ingredient Actions

**Task:** Implement actions for when ingredients are selected

**Simple Code tasks:**
- Create edit ingredient details action
- Create find substitutes action
- Create view usage action

**Files to create/modify:**
- Create new file: `js/actions/ingredient-actions.js`
- Update `js/action-registry.js` to register these actions

#### 2.4 Global Actions

**Task:** Implement actions for when nothing is selected

**Simple Code tasks:**
- Create new recipe action
- Create import recipe action
- Create manage categories action

**Files to create/modify:**
- Create new file: `js/actions/global-actions.js`
- Update `js/action-registry.js` to register these actions

### Phase 3: Action Rendering System (Code)

#### 3.1 Action Renderer

**Task:** Create the system to dynamically render appropriate actions

**Code tasks:**
- Implement action rendering engine
- Create action button component
- Implement action grouping logic
- Create action panel component

**Files to create/modify:**
- Create new file: `js/action-renderer.js`
- Update `js/ui.js` to use the renderer

#### 3.2 Navigation Integration

**Task:** Connect action system to navigation selection events

**Code tasks:**
- Implement selection change event handling
- Update right column when selection changes
- Clear actions when selection is cleared

**Files to modify:**
- `js/ui.js` - Add selection change handling
- `js/main.js` - Connect navigation events to action system

### Phase 4: UI Styling and Refinement (Simple Code)

#### 4.1 Action Button Styling

**Task:** Create consistent, attractive styling for action buttons

**Simple Code tasks:**
- Design action button styles
- Implement primary/secondary/utility action styles
- Create action group styling
- Implement responsive layouts for action panels

**Files to modify:**
- `style.css` - Add action button and panel styles

#### 4.2 Progressive Disclosure

**Task:** Implement expandable actions for complex operations

**Simple Code tasks:**
- Create expandable action component
- Implement sub-action rendering
- Create transition animations

**Files to modify:**
- `js/action-renderer.js` - Add expandable action support
- `style.css` - Add styles for expandable actions

### Phase 5: Testing and Optimization (Debug)

#### 5.1 Functional Testing

**Task:** Test all actions with different selection types

**Debug tasks:**
- Test recipe actions with various recipe types
- Test ingredient actions with different ingredients
- Test global actions with no selection
- Verify correct actions appear for each selection

#### 5.2 Edge Case Handling

**Task:** Ensure robustness in unusual scenarios

**Debug tasks:**
- Test with incomplete recipe data
- Verify error handling for all actions
- Test with many actions visible at once
- Ensure performance remains good

## Implementation Strategy

### Action Component Pattern

All actions should follow this component pattern:

```javascript
const SomeAction = {
  id: 'unique-action-id',
  name: 'Human Readable Name',
  icon: 'icon-class',
  category: 'primary', // or 'secondary', 'utility'
  applicableTo: (item) => boolean, // Determines if action applies to this item
  
  render: (container, item) => {
    // Create action button and append to container
    return buttonElement;
  },
  
  execute: (item) => {
    // Perform the action
    // Return a promise if async
  }
};
```

### Action Registry Pattern

The action registry should follow this pattern:

```javascript
const ActionRegistry = {
  actions: [], // All registered actions
  
  register: (action) => {
    // Add action to registry
  },
  
  getActionsForItem: (item) => {
    // Filter actions by applicableTo
    return filteredActions;
  }
};
```

### Action Renderer Pattern

The action renderer should follow this pattern:

```javascript
const ActionRenderer = {
  render: (container, item) => {
    // Get applicable actions
    const actions = ActionRegistry.getActionsForItem(item);
    
    // Group actions by category
    const groupedActions = this.groupActionsByCategory(actions);
    
    // Render each group
    for (const [category, actions] of Object.entries(groupedActions)) {
      this.renderActionGroup(container, category, actions, item);
    }
  },
  
  groupActionsByCategory: (actions) => {
    // Group actions by their category
    return groupedActions;
  },
  
  renderActionGroup: (container, category, actions, item) => {
    // Create group container
    // Render each action in the group
  }
};
```

## Task Assignment for Modes

### Architect Mode
- Design the overall action system architecture
- Define component patterns and interfaces
- Ensure architectural consistency

### Code Mode
- Implement the action registry system
- Create the action rendering engine
- Implement navigation integration
- Handle complex action logic

### Simple Code Mode
- Implement individual action components
- Create action UI elements
- Style action buttons and panels
- Implement basic action functionality

### Debug Mode
- Test all actions with different selections
- Identify and fix issues
- Optimize performance
- Ensure cross-browser compatibility

## Next Steps

1. Begin with Phase 1 to clear the right column and create the action registry
2. Proceed with implementing core action components
3. Build the action rendering system
4. Connect to navigation events
5. Style and refine the action UI
6. Test thoroughly with different selection types