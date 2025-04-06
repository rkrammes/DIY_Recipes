# Right Column Action Architecture

## Overview

This document outlines a revised approach for the right column of the DIY Recipes application. The right column is **reserved exclusively for actions** that can be performed on items selected in the navigation (left) column. These actions should be context-sensitive and change dynamically based on what is selected.

## Core Principles

1. **Context Sensitivity**: Actions displayed in the right column should directly relate to what is selected in the navigation column
2. **Action-Oriented**: All items in the right column should be actionable (not informational)
3. **Dynamic Updates**: The right column should refresh its contents whenever a new selection is made
4. **Clear Organization**: Actions should be grouped by purpose and presented in order of likely usage

## Action Categories by Selection Type

### When a Recipe is Selected

#### Recipe Editing Actions
- **Edit Recipe Details**: Modify name, description, etc.
- **Edit Ingredients**: Add, remove, or modify ingredients
- **Adjust Total Volume/Quantity**: Scale the entire recipe up or down
- **Edit Instructions**: Modify the preparation steps
- **Edit Notes**: Add or modify recipe notes

#### Recipe Version Actions
- **Create New Version**: Create a new iteration of the recipe
- **Compare with Previous Version**: View changes from previous version
- **Restore Previous Version**: Roll back to an earlier version

#### Recipe Utility Actions
- **Print Recipe**: Generate a printable version
- **Export Recipe**: Save as PDF or other format
- **Generate Shopping List**: Create a list of needed ingredients
- **Calculate Costs**: Estimate the cost to produce
- **Calculate Shelf Life**: Estimate how long the product will last

#### Recipe Sharing Actions
- **Share Recipe**: Generate a shareable link
- **Export to Social Media**: Format for social platforms

### When an Ingredient is Selected

#### Ingredient Editing Actions
- **Edit Ingredient Details**: Modify name, description, properties
- **Find Substitutes**: View possible ingredient alternatives
- **View Usage**: See which recipes use this ingredient

#### Ingredient Analysis Actions
- **View Properties**: Show pH, solubility, etc.
- **Check Compatibility**: Verify compatibility with other ingredients
- **Calculate Cost**: Show cost per unit

### When No Item is Selected

#### Global Actions
- **Create New Recipe**: Start a new recipe from scratch
- **Import Recipe**: Import from file or URL
- **Manage Categories**: Edit recipe categories/tags
- **Manage Favorites**: View and organize favorites

## UI Implementation

### Action Button Design
- Clear, concise labels
- Consistent styling
- Appropriate icons
- Visual grouping by category

### Action Panel Layout
1. **Primary Actions Panel**: Most common actions at the top
2. **Secondary Actions Panel**: Less common actions below
3. **Utility Actions Panel**: Tools and utilities at the bottom

### Dynamic Loading Pattern
```javascript
// Pseudocode for dynamic action loading
function updateRightColumn(selectedItem) {
  clearRightColumn();
  
  if (!selectedItem) {
    loadGlobalActions();
    return;
  }
  
  if (selectedItem.type === 'recipe') {
    loadRecipeActions(selectedItem);
  } else if (selectedItem.type === 'ingredient') {
    loadIngredientActions(selectedItem);
  }
}
```

## Technical Implementation

### Action Component Structure
Each action should be implemented as a self-contained component that:
1. Renders its own UI
2. Handles its own events
3. Performs its specific function
4. Updates the application state as needed

```javascript
const EditRecipeAction = {
  render: (container, recipe) => {
    // Create the action button
    const button = document.createElement('button');
    button.className = 'action-button primary-action';
    button.innerHTML = '<i class="icon-edit"></i> Edit Recipe Details';
    button.addEventListener('click', () => EditRecipeAction.execute(recipe));
    container.appendChild(button);
  },
  
  execute: (recipe) => {
    // Show edit form
    const form = createEditForm(recipe);
    showModal(form);
  }
};
```

### Action Registration System
Actions should be registered in a central system that knows which actions apply to which item types:

```javascript
const ActionRegistry = {
  recipeActions: [EditRecipeAction, AdjustVolumeAction, /* etc */],
  ingredientActions: [EditIngredientAction, FindSubstitutesAction, /* etc */],
  globalActions: [CreateRecipeAction, ImportRecipeAction, /* etc */],
  
  getActionsForItem(item) {
    if (!item) return this.globalActions;
    if (item.type === 'recipe') return this.recipeActions;
    if (item.type === 'ingredient') return this.ingredientActions;
    return [];
  }
};
```

## Implementation Steps

1. **Clear Current Right Column**: Remove all existing content from the right column
2. **Define Action Registry**: Create the central registry for all actions
3. **Implement Core Actions**: Start with the most essential actions
4. **Create Action Renderer**: Build the system to dynamically render actions
5. **Connect to Navigation Events**: Update actions when navigation selection changes
6. **Style Action UI**: Create consistent, attractive styling for action buttons
7. **Test with Different Selections**: Verify correct actions appear for each selection type

## Design Considerations

- **Responsive Design**: Actions should adapt to available space
- **Progressive Disclosure**: Complex actions can reveal more options when selected
- **Keyboard Accessibility**: All actions should be accessible via keyboard
- **Visual Hierarchy**: Most important actions should be visually prominent

## Next Steps

1. Implement the action registry system
2. Create the core action components
3. Build the dynamic rendering system
4. Connect to navigation selection events
5. Style the action UI components