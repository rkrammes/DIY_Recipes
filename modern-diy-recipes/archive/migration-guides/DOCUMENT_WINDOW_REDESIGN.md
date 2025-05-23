# Recipe Document Window Redesign

## First Principles Analysis

After careful examination of the DIY Recipes application, I'm proposing a comprehensive redesign of the active document window based on first principles thinking. The fundamental purpose of this interface is to:

1. **Primary function**: Allow users to clearly view recipes to make them
2. **Secondary function**: Enable iteration and improvement over time
3. **Extended capabilities**: Integrate AI suggestions and version tracking

## Current Implementation Findings

Through analysis and testing, we found that the current implementation:

- Uses a modal-based editing approach creating a disjointed experience
- Treats versioning as an optional feature rather than core functionality
- Places AI suggestions separate from the editing workflow
- Has a complex UI structure that doesn't prioritize the document view
- Lacks seamless transitions between viewing and editing
- Has a disconnected relationship between versions

## Proposed Document-Centric Design

I propose a complete redesign based on a document-centric approach that integrates all functions into a cohesive experience:

### 1. Unified Document View

The redesign centers around a seamless document view with:

- **Inline Editing**: Allow direct editing of all content without mode switching
- **Section-Based Organization**: Clear visual hierarchy with ingredients, instructions, and notes
- **Rich Content**: Support for images, timers, measurements, and formatting
- **Responsive Layout**: Full-width document that adapts to any screen size

### 2. Integrated Version Timeline

Version management becomes a core part of the experience:

- **Horizontal Timeline**: Visual representation of recipe evolution at the top
- **Named Versions**: Support meaningful names beyond version numbers
- **Visual Diff**: Highlight changes between versions
- **Branching Support**: Allow experimental variations while maintaining the main recipe

### 3. Contextual AI Assistance

AI becomes a collaborative partner in recipe creation:

- **Inline Suggestions**: AI suggestions appear next to relevant content
- **One-Click Application**: Apply suggestions with minimal friction
- **Ingredient Optimization**: Specific suggestions for substitutions, improvements
- **Instruction Refinement**: Technique improvements and clarity enhancements

### 4. Smart Components

The interface includes specialized components for recipe content:

- **Interactive Ingredient List**: Scalable quantities, unit conversion
- **Step-by-Step Instructions**: Numbered steps with rich content support
- **Dynamic Timers**: Embedded timers within instruction steps
- **Measurement Converter**: Built-in unit conversion for global usability

## Visual Mockup

Below is a conceptual layout for the new document-centric design:

```
┌─────────────────────────────────────────────────────────────────┐
│ RECIPE: Sourdough Bread                                         │
├─────────────────────────────────────────────────────────────────┤
│ VERSION TIMELINE                                                │
│ [Initial]───[Adjusted Hydration]───[Current: Improved Flavor]   │
│   Jan 5           Jan 12                  Jan 20                │
├─────────────────────────────────────────────────────────────────┤
│                                          ┌───────────────────┐  │
│ DESCRIPTION                              │   RECIPE TOOLS    │  │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━    │ ━━━━━━━━━━━━━━━━━ │  │
│ A crusty artisan sourdough with          │ 📝 Save Changes   │  │
│ complex flavor and open crumb.           │ 🔄 Create Version │  │
│ Fermentation time: 12-16 hours           │ 🤖 Get AI Help    │  │
│                                          │ 📊 Analysis       │  │
│ INGREDIENTS                              │                   │  │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━    │ VERSION CHANGES   │  │
│ • 500g bread flour         [edit]        │ ━━━━━━━━━━━━━━━━━ │  │
│ • 350g water (70%)         [edit]        │ • Added salt      │  │
│ • 100g active starter      [edit]        │ • Increased water │  │
│ • 10g salt                 [edit]        │ • Longer proof    │  │
│                                          │                   │  │
│ 🤖 AI Suggestion: Consider adding 2%     │ RECIPE METRICS    │  │
│    diastatic malt powder to improve      │ ━━━━━━━━━━━━━━━━━ │  │
│    rise and crust color. [Apply][Ignore] │ • Hydration: 70%  │  │
│                                          │ • Difficulty: Med │  │
│ INSTRUCTIONS                             │ • Prep: 30 min    │  │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━    │ • Total: 14 hrs   │  │
│                                          │                   │  │
│ 1. Mix flour and water, rest 30 min.     └───────────────────┘  │
│                                                                  │
│ 2. Add starter and salt, then perform                            │
│    stretch and folds every 30 minutes                            │
│    for 2-3 hours.                                                │
│                                                                  │
│ 3. Bulk ferment 8-10 hours at room                               │
│    temperature, until doubled.                                   │
│                                                                  │
│ 🤖 AI Suggestion: Consider 6-8 hours                             │
│    at room temperature followed by                               │
│    overnight in refrigerator for easier                          │
│    handling and better flavor.                                   │
│    [Apply][Modify][Ignore]                                       │
│                                                                  │
│ NOTES & OBSERVATIONS                                             │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                            │
│ Last time, I found the dough too sticky.                         │
│ Next time try reducing hydration to 68%.                         │
└─────────────────────────────────────────────────────────────────┘
```

## Implementation Plan

### 1. Component Structure

The new implementation will use these core components:

- **RecipeDocument**: Main container handling state and data flow
- **VersionTimeline**: Interactive timeline showing recipe evolution
- **EditableSection**: Base component for inline-editable content
- **IngredientList**: Smart list with quantity handling
- **InstructionSteps**: Numbered, rich text instruction display
- **AIAssistant**: Contextual AI suggestion provider
- **RecipeMetrics**: Dynamic calculation of recipe statistics

### 2. State Management

The state model will include:

- **Document State**: Current recipe data
- **Edit State**: Track which sections are being edited
- **Version State**: Current, previous, and next versions
- **Change Tracking**: Auto-detection of modifications
- **Suggestion State**: Active AI suggestions by section

### 3. Database Integration

The implementation leverages the existing Supabase schema:

- Use the `recipe_iterations` and `iteration_ingredients` tables
- Automatic version creation when edits are saved
- Efficient loading of selected version data
- Comparative loading for showing differences

### 4. Technical Approach

The development approach includes:

1. **Progressive Enhancement**: Start with basic document view
2. **Component Isolation**: Build and test each component separately
3. **State-Driven UI**: Use React state to drive all UI transitions
4. **Optimistic Updates**: Show changes immediately before saving
5. **Feature Detection**: Gracefully handle missing backend features

## Migration Strategy

To move from the current implementation:

1. Develop the new components in parallel
2. Create adapter functions for data compatibility
3. Support both old and new interfaces temporarily
4. Gradually migrate users to the new experience
5. Collect metrics and feedback on the new interface

This document-centric redesign brings all the key functionality together in a cohesive, intuitive interface that prioritizes both viewing and iteration while maintaining strong versioning and AI assistance capabilities.