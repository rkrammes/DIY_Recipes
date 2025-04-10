# DIY Recipes: Application Design Specification

## Overview

This document provides a detailed specification for the DIY Recipes application design, focusing on the user interface, interactions, and features that will create an exceptional experience. This specification translates our user experience vision into concrete design decisions and implementation guidelines.

## Design Language

### Visual Style

The DIY Recipes application will follow a clean, modern design language with these characteristics:

- **Typography**: 
  - Primary Font: Roboto Mono (current font, maintained for brand consistency)
  - Heading Scale: 2rem, 1.75rem, 1.5rem, 1.25rem, 1rem
  - Body Text: 1rem (16px)
  - Line Height: 1.5 for optimal readability

- **Color Palette**:
  - Primary Background: #1A1A1A (dark mode)
  - Secondary Background: #2C2C2C
  - Panel Background: rgba(44, 44, 44, 0.6)
  - Panel Border: rgba(255, 255, 255, 0.15)
  - Text: #FFFFFF
  - Accent Blue: #3498DB
  - Accent Orange: #FF9900
  - Success Green: #2ECC71
  - Warning Yellow: #F1C40F
  - Error Red: #E74C3C

- **Spacing System**:
  - Base Unit: 8px
  - Spacing Scale: 4px, 8px, 16px, 24px, 32px, 48px, 64px
  - Component Padding: 16px (consistent throughout)
  - Section Margins: 24px (consistent separation)

- **Border Radius**:
  - Small Elements: 4px
  - Panels and Cards: 8px
  - Buttons: 4px
  - Pills and Tags: 16px (fully rounded)

- **Shadows**:
  - Panel Shadow: 0 4px 6px rgba(0, 0, 0, 0.1)
  - Elevated Elements: 0 8px 16px rgba(0, 0, 0, 0.15)
  - Modal Shadow: 0 16px 32px rgba(0, 0, 0, 0.25)

- **Icons**:
  - Consistent 24x24px icon set
  - Line weight of 2px
  - Rounded corners (2px radius)
  - Clear metaphors with text labels where needed

### Interaction Design

- **Button States**:
  - Default: Base color
  - Hover: 10% lighter
  - Active: 10% darker
  - Focus: Blue outline (2px)
  - Disabled: 50% opacity

- **Input States**:
  - Default: Subtle border
  - Focus: Accent color border
  - Error: Error red border
  - Disabled: 50% opacity

- **Transitions**:
  - Duration: 150ms for UI elements, 300ms for panels
  - Easing: Ease-in-out for natural feel
  - Properties: opacity, transform, background-color

- **Feedback Patterns**:
  - Success: Green toast notification (auto-dismiss after 3 seconds)
  - Error: Red toast notification (requires dismissal)
  - Loading: Subtle progress indicators
  - Empty States: Helpful guidance and actions

## Layout System

### Application Structure

The DIY Recipes application will use a responsive three-column layout that adapts to different screen sizes:

```
┌─────────────────────────────────────────────────────────┐
│                        Header                           │
├─────────────┬─────────────────────────┬─────────────────┤
│             │                         │                 │
│             │                         │                 │
│   Recipe    │                         │                 │
│   Browser   │      Recipe View        │  Context Panel  │
│             │                         │                 │
│             │                         │                 │
│             │                         │                 │
├─────────────┴─────────────────────────┴─────────────────┤
│                        Footer                           │
└─────────────────────────────────────────────────────────┘
```

**Key Layout Components**:

1. **Header**:
   - Logo/Brand
   - Global Search
   - User Account
   - Settings Button
   - Create New Recipe Button

2. **Recipe Browser** (Left Column):
   - Recipe List (sortable, filterable)
   - Collection/Category Navigation
   - Tag Filters
   - Quick Actions

3. **Recipe View** (Middle Column):
   - Recipe Header (title, image, meta info)
   - Ingredient List
   - Instructions
   - Notes
   - Additional Information

4. **Context Panel** (Right Column):
   - Recipe Actions
   - Version History
   - Related Recipes
   - Ingredient Details
   - Cooking Tools

5. **Footer**:
   - Copyright Information
   - Quick Links
   - Version Information

### Responsive Behavior

The layout will adapt to different screen sizes:

- **Desktop (1200px+)**: Full three-column layout
- **Tablet (768px-1199px)**: Two columns with collapsible panels
- **Mobile (< 768px)**: Single column with navigation menu

Responsive behavior will be implemented through:
- CSS Grid for main layout
- Flexbox for component layouts
- Media queries for breakpoints
- Collapsible panels with smooth transitions

## Component Library

### Core Components

1. **Buttons**:
   - Primary Button: Solid background, white text
   - Secondary Button: Outline style
   - Text Button: No background or border
   - Icon Button: Square with centered icon
   - Button Group: Connected buttons for related actions

2. **Form Controls**:
   - Text Input: Single-line text entry
   - Text Area: Multi-line text entry
   - Select Dropdown: Option selection
   - Checkbox: Boolean selection
   - Radio Button: Single selection from group
   - Toggle Switch: Boolean with visual toggle
   - Number Input: With increment/decrement controls
   - Search Input: With clear and submit actions

3. **Navigation**:
   - Tabs: Horizontal navigation
   - Sidebar: Vertical navigation
   - Breadcrumbs: Hierarchical location
   - Pagination: Results navigation
   - Stepper: Process steps

4. **Content Display**:
   - Card: Container for related content
   - Panel: Sectioned content area
   - List: Vertical arrangement of items
   - Table: Structured data display
   - Accordion: Expandable sections
   - Carousel: Horizontal scrolling content

5. **Feedback**:
   - Toast Notification: Temporary messages
   - Modal Dialog: Focused interaction
   - Alert: Important information
   - Progress Bar: Operation progress
   - Skeleton Loader: Content loading placeholder

### Recipe-Specific Components

1. **Recipe Card**:
   - Thumbnail image
   - Title
   - Quick metadata (time, difficulty)
   - Action buttons (favorite, edit, etc.)

2. **Ingredient List Item**:
   - Quantity
   - Unit
   - Name
   - Optional notes
   - Checkbox for completion

3. **Instruction Step**:
   - Step number
   - Instruction text
   - Optional image
   - Checkbox for completion
   - Timer button (if applicable)

4. **Recipe Header**:
   - Hero image
   - Title
   - Author
   - Rating
   - Preparation time
   - Cooking time
   - Servings adjuster

5. **Tag Pill**:
   - Label
   - Color indicator
   - Remove button (when applicable)

## Feature Specifications

### 1. Recipe Management

#### 1.1 Recipe Creation

**Interface**: A multi-step form with these sections:
- Basic Information (title, description, servings)
- Ingredients
- Instructions
- Additional Information (notes, tags, categories)
- Media (photos, videos)

**Interactions**:
- Auto-save as draft while editing
- Rich text formatting for instructions
- Drag-and-drop reordering of ingredients and steps
- Image upload with preview
- Tag selection with auto-complete

**Data Model**:
```typescript
interface Recipe {
  id: string;
  title: string;
  description: string;
  servings: number;
  prepTime: number;
  cookTime: number;
  ingredients: Ingredient[];
  instructions: Instruction[];
  notes: string;
  tags: Tag[];
  categories: Category[];
  media: Media[];
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  isPublic: boolean;
  rating: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  notes: string;
  isOptional: boolean;
  position: number;
}

interface Instruction {
  id: string;
  text: string;
  media?: Media[];
  position: number;
  timer?: number; // Optional timer in minutes
}
```

#### 1.2 Recipe Organization

**Interface**: Hierarchical navigation with:
- Collections (user-defined groups)
- Categories (predefined types)
- Tags (flexible labeling)
- Smart Filters (based on properties)

**Interactions**:
- Drag-and-drop organization
- Multi-select for batch operations
- Quick filter by clicking tags
- Save custom filters as views

**Data Model**:
```typescript
interface Collection {
  id: string;
  name: string;
  description: string;
  recipeIds: string[];
  userId: string;
  color: string;
  icon: string;
}

interface Category {
  id: string;
  name: string;
  description: string;
  parentId?: string; // For hierarchical categories
}

interface Tag {
  id: string;
  name: string;
  color: string;
}
```

#### 1.3 Recipe Viewing

**Interface**: Clean, focused view with:
- Hero image at top
- Recipe metadata (time, servings, etc.)
- Ingredients list with checkboxes
- Instruction steps with checkboxes
- Additional information in collapsible sections

**Interactions**:
- Adjust servings with automatic quantity recalculation
- Check off ingredients and steps as you go
- Switch to "Cooking Mode" for optimized viewing
- Print or share recipe

### 2. Ingredient Management

#### 2.1 Ingredient Database

**Interface**: Searchable database with:
- Name
- Description
- Properties (nutritional info, etc.)
- Substitutions
- Categories

**Interactions**:
- Search by name or property
- View detailed information
- Add custom ingredients
- Suggest edits to existing ingredients

**Data Model**:
```typescript
interface IngredientDefinition {
  id: string;
  name: string;
  description: string;
  properties: {
    calories?: number;
    protein?: number;
    fat?: number;
    carbs?: number;
    // Other nutritional properties
  };
  substitutions: {
    ingredientId: string;
    ratio: number; // Conversion ratio
    notes: string;
  }[];
  categories: string[]; // Category IDs
  commonUnits: string[]; // Common units of measurement
  isVerified: boolean;
}
```

#### 2.2 Shopping List

**Interface**: Interactive list with:
- Ingredients grouped by category
- Quantity and unit
- Source recipe
- Checkbox for purchased items

**Interactions**:
- Add items from recipes
- Check off purchased items
- Add custom items
- Save and reuse common shopping lists

**Data Model**:
```typescript
interface ShoppingList {
  id: string;
  name: string;
  userId: string;
  items: ShoppingItem[];
  createdAt: Date;
  updatedAt: Date;
}

interface ShoppingItem {
  id: string;
  ingredientId: string;
  name: string; // Denormalized for convenience
  quantity: number;
  unit: string;
  recipeId?: string; // Optional source recipe
  isPurchased: boolean;
  notes: string;
  category: string; // For grouping (produce, dairy, etc.)
}
```

### 3. User Preferences

#### 3.1 Theme Settings

**Interface**: Settings panel with:
- Theme selection (light, dark, high contrast)
- Color accent selection
- Font size adjustment
- Density control (compact, comfortable)

**Interactions**:
- Live preview of changes
- Apply settings immediately
- Reset to defaults option

**Data Model**:
```typescript
interface UserPreferences {
  id: string;
  userId: string;
  theme: 'light' | 'dark' | 'high-contrast';
  accentColor: string;
  fontSize: 'small' | 'medium' | 'large';
  density: 'compact' | 'comfortable';
  // Other preferences
}
```

#### 3.2 Layout Preferences

**Interface**: Settings panel with:
- Default view (list, grid)
- Column visibility toggles
- Panel size adjustments
- Default sorting and filtering

**Interactions**:
- Drag handles for resizing
- Toggle switches for visibility
- Dropdown for default options

### 4. Search & Discovery

#### 4.1 Search Interface

**Interface**: Prominent search bar with:
- Auto-complete suggestions
- Recent searches
- Advanced search options
- Filter chips for active filters

**Interactions**:
- Type-ahead suggestions
- Voice input option
- Filter by multiple criteria
- Save searches as views

**Search Parameters**:
- Text (title, description, ingredients)
- Ingredients (include/exclude)
- Time (preparation, cooking, total)
- Tags and categories
- Rating and difficulty

#### 4.2 Recipe Discovery

**Interface**: Visual browsing interface with:
- Featured recipes
- Recently added
- Personalized suggestions
- Seasonal collections

**Interactions**:
- Infinite scroll for browsing
- Quick preview on hover
- Save to collection button
- Share button

## User Flows

### 1. New User Onboarding

1. **Welcome Screen**:
   - Brief introduction
   - Key features overview
   - Option to import existing recipes

2. **Preference Setup**:
   - Theme selection
   - Basic preferences
   - Optional account creation

3. **First Recipe**:
   - Guided creation of first recipe
   - Introduction to key features
   - Success celebration

### 2. Recipe Creation Flow

1. **Initiate Creation**:
   - Click "New Recipe" button
   - Choose from template or blank

2. **Basic Information**:
   - Enter title, description
   - Set servings, time
   - Add main image

3. **Ingredients**:
   - Add ingredients with auto-complete
   - Specify quantities and units
   - Group ingredients if needed

4. **Instructions**:
   - Add steps with rich formatting
   - Add images to steps if desired
   - Set timers if applicable

5. **Finalize**:
   - Add tags and categories
   - Add notes
   - Preview the complete recipe
   - Publish or save as draft

### 3. Cooking Flow

1. **Recipe Selection**:
   - Browse or search for recipe
   - Quick preview
   - Open full recipe

2. **Preparation**:
   - Review ingredients
   - Adjust servings if needed
   - Check inventory (optional)

3. **Cooking Mode**:
   - Switch to cooking view
   - Larger text and controls
   - Screen always on

4. **Follow Recipe**:
   - Check off ingredients as used
   - Follow step-by-step instructions
   - Use integrated timers if available

5. **Completion**:
   - Mark recipe as cooked
   - Rate the recipe
   - Add notes for next time

## Implementation Guidelines

### Front-End Technologies

- **Framework**: Next.js with React
- **Styling**: Tailwind CSS for utility-first styling
- **State Management**: Zustand for global state
- **Form Handling**: React Hook Form for efficient forms
- **Data Fetching**: SWR for data fetching and caching
- **Animations**: Framer Motion for fluid animations

### Performance Considerations

- **Code Splitting**: Route-based and component-based
- **Image Optimization**: Next.js Image component
- **Lazy Loading**: For off-screen content
- **Memoization**: For expensive calculations
- **Virtualization**: For long lists
- **Prefetching**: For anticipated user actions

### Accessibility Requirements

- **WCAG 2.1 AA Compliance**: All components
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader Support**: Proper ARIA attributes
- **Focus Management**: Clear focus indicators
- **Color Contrast**: 4.5:1 minimum ratio
- **Reduced Motion**: Support for prefers-reduced-motion

## Appendix: UI Mockups

### Home Screen

```
┌─────────────────────────────────────────────────────────────┐
│  DIY Recipes           [Search Bar]          [User] [Settings]│
├─────────────┬─────────────────────────────┬─────────────────┤
│ Collections │                             │                 │
│  • All      │     [Recipe Grid/List]      │  Welcome Back!  │
│  • Favorites│                             │                 │
│  • Recent   │     ┌─────┐ ┌─────┐ ┌─────┐ │  Recent Activity│
│             │     │ Rec │ │ Rec │ │ Rec │ │  • Cooked X     │
│ Categories  │     │  1  │ │  2  │ │  3  │ │  • Added Y      │
│  • Breakfast│     └─────┘ └─────┘ └─────┘ │                 │
│  • Lunch    │                             │  Suggestions    │
│  • Dinner   │     ┌─────┐ ┌─────┐ ┌─────┐ │  • Based on Z   │
│  • Desserts │     │ Rec │ │ Rec │ │ Rec │ │  • Popular      │
│             │     │  4  │ │  5  │ │  6  │ │                 │
│ Tags        │     └─────┘ └─────┘ └─────┘ │                 │
│  • Quick    │                             │                 │
│  • Healthy  │     [Load More...]          │                 │
│  • Vegetarian                             │                 │
└─────────────┴─────────────────────────────┴─────────────────┘
```

### Recipe View

```
┌─────────────────────────────────────────────────────────────┐
│  DIY Recipes           [Search Bar]          [User] [Settings]│
├─────────────┬─────────────────────────────┬─────────────────┤
│ < Back      │                             │                 │
│             │     [Recipe Hero Image]     │  Recipe Actions │
│ Related     │                             │  • Edit         │
│ Recipes     │     Chocolate Chip Cookies  │  • Delete       │
│             │     ★★★★☆  45min  Easy      │  • Share        │
│ • Similar 1 │                             │  • Print        │
│ • Similar 2 │     Ingredients             │                 │
│             │     • 2 cups flour          │  Version History│
│             │     • 1 cup butter          │  • Current      │
│             │     • 1 cup sugar           │  • Yesterday    │
│             │     • 2 eggs                │  • Last week    │
│             │                             │                 │
│             │     Instructions            │  Notes          │
│             │     1. Preheat oven to 350F │  Added by you:  │
│             │     2. Mix dry ingredients  │  "Try with dark │
│             │     3. Cream butter & sugar │   chocolate next│
│             │     4. Add eggs one at a time  time!"         │
│             │     5. Mix wet and dry      │                 │
└─────────────┴─────────────────────────────┴─────────────────┘
```

### Recipe Editor

```
┌─────────────────────────────────────────────────────────────┐
│  DIY Recipes           [Search Bar]          [User] [Settings]│
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Edit Recipe                                [Save] [Cancel] │
│                                                             │
│  [Upload Image]  Title: [Chocolate Chip Cookies          ]  │
│                                                             │
│  Description:                                               │
│  [Classic chocolate chip cookies that are crisp on the    ] │
│  [outside and chewy in the middle.                        ] │
│                                                             │
│  Prep Time: [15] min  Cook Time: [30] min  Servings: [24]   │
│                                                             │
│  Ingredients:                                      [+ Add]  │
│  • [2    ] [cups    ] [all-purpose flour        ] [Delete] │
│  • [1    ] [cup     ] [unsalted butter, softened] [Delete] │
│  • [1    ] [cup     ] [granulated sugar         ] [Delete] │
│  • [2    ] [        ] [large eggs               ] [Delete] │
│                                                             │
│  Instructions:                                    [+ Add]   │
│  1. [Preheat oven to 350°F (175°C).             ] [Delete] │
│  2. [Mix dry ingredients in a bowl.              ] [Delete] │
│  3. [Cream butter and sugar until light.         ] [Delete] │
│                                                             │
│  Tags: [Dessert] [Baking] [Cookies] [+ Add Tag]             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

This design specification provides a comprehensive blueprint for the DIY Recipes application, focusing on delivering a satisfying user experience through thoughtful interface design, intuitive interactions, and powerful features.