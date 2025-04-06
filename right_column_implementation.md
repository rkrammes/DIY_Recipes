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
