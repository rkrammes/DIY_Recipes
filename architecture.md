alri# Right Column Action Architecture for DIY Recipes

## Overview

This document outlines the actions that would be useful in the right column when a DIY home product recipe (skin/hair care, etc.) is selected in the left column. The right column serves two primary purposes:

1. **Making Products**: Facilitate the creation of products based on the current recipe
2. **Recipe Iteration**: Support editing recipes to create the next iteration/version

## Proposed Right Column Actions

### 1. Product Creation Actions

#### 1.1 Scale Recipe Quantities
- **Purpose**: Adjust all ingredient quantities proportionally based on desired batch size
- **UI Element**: Slider or numeric input with "×0.5", "×1", "×2", "×5" quick options
- **Output**: Updated quantities in the recipe view

#### 1.2 Convert Units
- **Purpose**: Switch between measurement systems (metric/imperial)
- **UI Element**: Toggle button (Metric/Imperial)
- **Output**: Converted measurements in the recipe view

#### 1.3 Check Ingredient Availability
- **Purpose**: Verify if all ingredients are available or suggest substitutes
- **UI Element**: "Check Availability" button with results list
- **Output**: List of missing ingredients with possible substitutions

#### 1.4 Calculate Cost
- **Purpose**: Estimate the cost of making the product
- **UI Element**: "Calculate Cost" button
- **Output**: Estimated total cost and cost per unit/application

#### 1.5 Print/Export Recipe
- **Purpose**: Generate printable/shareable version
- **UI Element**: "Print" and "Export" (PDF/Image) buttons
- **Output**: Formatted recipe for physical use or sharing

#### 1.6 Create Shopping List
- **Purpose**: Generate a list of ingredients to purchase
- **UI Element**: "Create Shopping List" button
- **Output**: Exportable list of required ingredients

#### 1.7 Shelf-life Calculator
- **Purpose**: Estimate how long the product will last
- **UI Element**: Input for environmental factors (temperature, exposure)
- **Output**: Estimated shelf life and storage recommendations

### 2. Recipe Iteration Actions

#### 2.1 Create New Version
- **Purpose**: Start a new iteration of the recipe
- **UI Element**: "Create New Version" button
- **Output**: New recipe version with current recipe as baseline

#### 2.2 Ingredient Substitution
- **Purpose**: Replace ingredients with alternatives
- **UI Element**: Ingredient editor with substitute suggestions
- **Output**: Updated recipe with substituted ingredients

#### 2.3 Adjust Properties
- **Purpose**: Modify recipe properties (texture, scent, etc.)
- **UI Element**: Property sliders with suggestions for ingredient changes
- **Output**: Ingredient adjustment recommendations

#### 2.4 Add Notes/Results
- **Purpose**: Document observations from previous batches
- **UI Element**: Notes field with date stamps
- **Output**: Chronological record of recipe performance

#### 2.5 Compare Versions
- **Purpose**: See differences between recipe iterations
- **UI Element**: "Compare Versions" dropdown
- **Output**: Side-by-side or highlighted diff view of versions

#### 2.6 Rate Results
- **Purpose**: Score the outcome of a recipe iteration
- **UI Element**: Star rating system with criteria (effectiveness, scent, texture)
- **Output**: Performance metrics across versions

#### 2.7 Tag/Categorize
- **Purpose**: Organize recipes with metadata
- **UI Element**: Tag input field with autocomplete
- **Output**: Filterable tags for recipe organization

### 3. Advanced Features

#### 3.1 Ingredient Analysis
- **Purpose**: Review ingredient properties and interactions
- **UI Element**: "Analyze Ingredients" button
- **Output**: Compatibility check, pH estimation, potential reactions

#### 3.2 Share/Collaborate
- **Purpose**: Allow others to view or edit the recipe
- **UI Element**: "Share" button with permission options
- **Output**: Shareable link with specified permissions

#### 3.3 Recipe Timeline
- **Purpose**: Track the evolution of a recipe over time
- **UI Element**: Visual timeline of iterations
- **Output**: Interactive history of recipe development

#### 3.4 Batch Tracking
- **Purpose**: Record specific batches made from a recipe
- **UI Element**: "Record Batch" button with date and quantity
- **Output**: Log of all batches with dates and notes

## UI Design Recommendations

1. **Collapsible Sections**: Group related actions into collapsible panels for clean organization
2. **Context-Sensitive Display**: Show only relevant actions based on the selected recipe type
3. **Visual Hierarchy**: Prioritize common actions with prominent placement and styling
4. **Consistent Styling**: Maintain the orange accent color scheme for the right column
5. **Responsive Design**: Ensure actions remain accessible on smaller screens

## Implementation Considerations

1. **State Management**: Actions should update the UI immediately but only persist changes when explicitly saved
2. **Calculation Logic**: Unit conversions and scaling should handle rounding appropriately
3. **Data Structure**: Recipe versions should maintain relationship to parent recipes
4. **Performance**: Heavy calculations (like ingredient analysis) should be asynchronous

## Next Steps

1. Prioritize actions based on user needs and development complexity
2. Create wireframes for the right column layout incorporating the key actions
3. Develop UI components with appropriate styling to match the application theme
4. Implement the core functionality with proper state management