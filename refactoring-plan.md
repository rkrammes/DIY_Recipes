# DIY Recipes: Immediate Refactoring Plan

This document outlines high-priority refactoring tasks that can be implemented on the current codebase to improve maintainability and performance before the full modernization effort begins. These changes will make the eventual migration easier while providing immediate benefits.

## 1. CSS Architecture Improvements

### Current Issues:
- Z-index conflicts requiring complex workarounds
- Inconsistent styling patterns
- Hard-coded color values
- Specificity issues requiring `!important` flags

### Refactoring Tasks:

#### 1.1 Implement CSS Custom Properties
```css
:root {
  /* Colors */
  --primary-bg-dark: #1A1A1A;
  --secondary-bg-dark: #2C2C2C;
  --panel-bg-dark: rgba(44, 44, 44, 0.6);
  --panel-border-dark: rgba(255, 255, 255, 0.15);
  --text-dark: #FFFFFF;
  --accent-blue-dark: #3498DB;
  --accent-orange-dark: #FF9900;
  
  /* Z-index Layers */
  --z-base: 1;
  --z-dropdown: 10;
  --z-sticky: 100;
  --z-overlay: 1000;
  --z-modal: 2000;
  --z-popover: 5000;
  --z-toast: 9000;
  
  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
}
```

#### 1.2 Create a Z-index Management System
```css
/* Base elements */
.content-area {
  z-index: var(--z-base);
}

/* Interactive elements */
.dropdown {
  z-index: var(--z-dropdown);
}

/* Fixed elements */
.sticky-header {
  z-index: var(--z-sticky);
}

/* Overlays */
.modal-overlay {
  z-index: var(--z-overlay);
}

/* Modal containers */
.modal-container {
  z-index: var(--z-modal);
}

/* Settings panel */
#settings-portal {
  z-index: var(--z-popover);
}

/* Toast notifications */
.notification-toast {
  z-index: var(--z-toast);
}
```

#### 1.3 Implement Component-Based CSS Classes
Organize CSS by component rather than feature, using consistent naming conventions:

```css
/* Button component */
.btn {
  /* Base button styles */
}

.btn--primary {
  /* Primary button variant */
}

.btn--secondary {
  /* Secondary button variant */
}

/* Panel component */
.panel {
  /* Base panel styles */
}

.panel--glass {
  /* Glass panel variant */
}
```

## 2. JavaScript Modularization

### Current Issues:
- Overlapping responsibilities between modules
- Inconsistent module patterns
- Manual DOM manipulation scattered across files
- Implicit dependencies between modules

### Refactoring Tasks:

#### 2.1 Implement a Proper Module Pattern
Create a consistent module pattern across all JavaScript files:

```javascript
// recipe-module.js
const RecipeModule = (function() {
  // Private variables
  let recipes = [];
  
  // Private functions
  function processRecipe(recipe) {
    // Implementation
  }
  
  // Public API
  return {
    initialize: function() {
      // Setup code
    },
    getRecipes: function() {
      return [...recipes]; // Return a copy
    },
    addRecipe: function(recipe) {
      // Implementation
    }
  };
})();

export default RecipeModule;
```

#### 2.2 Implement a Simple Event Bus
Create a centralized event system to reduce direct dependencies:

```javascript
// event-bus.js
const EventBus = (function() {
  const events = {};
  
  return {
    subscribe: function(event, callback) {
      if (!events[event]) {
        events[event] = [];
      }
      events[event].push(callback);
      return () => this.unsubscribe(event, callback);
    },
    
    unsubscribe: function(event, callback) {
      if (events[event]) {
        events[event] = events[event].filter(cb => cb !== callback);
      }
    },
    
    publish: function(event, data) {
      if (events[event]) {
        events[event].forEach(callback => {
          callback(data);
        });
      }
    }
  };
})();

export default EventBus;
```

#### 2.3 Create UI Component Factories
Implement factory functions for UI components to centralize DOM creation:

```javascript
// ui-factory.js
const UIFactory = {
  createButton: function(text, options = {}) {
    const button = document.createElement('button');
    button.textContent = text;
    button.className = options.className || 'btn';
    
    if (options.onClick) {
      button.addEventListener('click', options.onClick);
    }
    
    return button;
  },
  
  createPanel: function(content, options = {}) {
    const panel = document.createElement('div');
    panel.className = options.className || 'panel';
    
    if (typeof content === 'string') {
      panel.innerHTML = content;
    } else if (content instanceof HTMLElement) {
      panel.appendChild(content);
    }
    
    return panel;
  }
};

export default UIFactory;
```

## 3. State Management Improvements

### Current Issues:
- State scattered across multiple modules
- No single source of truth
- Manual DOM updates based on state changes
- Inconsistent state update patterns

### Refactoring Tasks:

#### 3.1 Implement a Simple Store
Create a centralized store for application state:

```javascript
// app-store.js
const AppStore = (function() {
  // Private state
  const state = {
    recipes: [],
    selectedRecipeId: null,
    ingredients: [],
    user: null,
    theme: 'dark',
    editMode: false
  };
  
  // Subscribers
  const subscribers = [];
  
  // Notify subscribers
  function notifySubscribers() {
    subscribers.forEach(callback => callback(state));
  }
  
  // Public API
  return {
    getState: function() {
      return {...state}; // Return copy to prevent direct mutation
    },
    
    subscribe: function(callback) {
      subscribers.push(callback);
      return () => {
        const index = subscribers.indexOf(callback);
        if (index !== -1) subscribers.splice(index, 1);
      };
    },
    
    updateRecipes: function(recipes) {
      state.recipes = [...recipes];
      notifySubscribers();
    },
    
    selectRecipe: function(id) {
      state.selectedRecipeId = id;
      notifySubscribers();
    },
    
    updateUser: function(user) {
      state.user = user;
      notifySubscribers();
    },
    
    setTheme: function(theme) {
      state.theme = theme;
      notifySubscribers();
    },
    
    setEditMode: function(enabled) {
      state.editMode = enabled;
      notifySubscribers();
    }
  };
})();

export default AppStore;
```

#### 3.2 Create State-Based UI Renderers
Implement functions that render UI based on state changes:

```javascript
// recipe-renderer.js
import AppStore from './app-store.js';

const RecipeRenderer = (function() {
  function renderRecipeList(recipes) {
    const recipeList = document.getElementById('recipeList');
    recipeList.innerHTML = '';
    
    recipes.forEach(recipe => {
      const item = document.createElement('li');
      item.textContent = recipe.title;
      item.dataset.id = recipe.id;
      recipeList.appendChild(item);
    });
  }
  
  function renderRecipeDetails(recipe) {
    // Implementation
  }
  
  // Initialize
  function initialize() {
    // Subscribe to store updates
    AppStore.subscribe(state => {
      renderRecipeList(state.recipes);
      
      const selectedRecipe = state.recipes.find(
        recipe => recipe.id === state.selectedRecipeId
      );
      
      if (selectedRecipe) {
        renderRecipeDetails(selectedRecipe);
      }
    });
  }
  
  return {
    initialize
  };
})();

export default RecipeRenderer;
```

## 4. API Layer Refactoring

### Current Issues:
- Direct Supabase calls scattered throughout the codebase
- Inconsistent error handling
- No clear API abstraction layer
- Missing types for API responses

### Refactoring Tasks:

#### 4.1 Create a Centralized API Client

```javascript
// api-client.js
import { supabaseClient } from './supabaseClient.js';

const ApiClient = {
  // Recipe endpoints
  recipes: {
    getAll: async function() {
      try {
        const { data, error } = await supabaseClient
          .from('recipes')
          .select('*');
          
        if (error) throw error;
        return { data, error: null };
      } catch (error) {
        console.error('Error fetching recipes:', error);
        return { data: null, error };
      }
    },
    
    getById: async function(id) {
      try {
        const { data, error } = await supabaseClient
          .from('recipes')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) throw error;
        return { data, error: null };
      } catch (error) {
        console.error(`Error fetching recipe ${id}:`, error);
        return { data: null, error };
      }
    },
    
    create: async function(recipe) {
      // Implementation
    },
    
    update: async function(id, updates) {
      // Implementation
    },
    
    delete: async function(id) {
      // Implementation
    }
  },
  
  // Ingredient endpoints
  ingredients: {
    // Similar pattern as recipes
  },
  
  // User endpoints
  user: {
    // Authentication methods
  }
};

export default ApiClient;
```

#### 4.2 Implement Consistent Response Handling

```javascript
// response-handler.js
export function handleApiResponse(promise, successCallback, errorCallback) {
  return promise
    .then(({ data, error }) => {
      if (error) {
        console.error('API Error:', error);
        if (errorCallback) errorCallback(error);
        return null;
      }
      
      if (successCallback) successCallback(data);
      return data;
    })
    .catch(unexpectedError => {
      console.error('Unexpected error:', unexpectedError);
      if (errorCallback) errorCallback(unexpectedError);
      return null;
    });
}
```

## 5. Performance Optimizations

### Current Issues:
- No code splitting
- Inefficient DOM manipulation
- Unnecessary re-renders
- No lazy loading

### Refactoring Tasks:

#### 5.1 Implement Basic Code Splitting
Split JavaScript into core and feature-specific files:

```html
<!-- Core JS (always loaded) -->
<script type="module" src="js/core/main.js"></script>

<!-- Feature-specific JS (loaded on demand) -->
<script type="module" src="js/features/recipe-editor.js" defer></script>
<script type="module" src="js/features/recipe-analysis.js" defer></script>
```

#### 5.2 Optimize DOM Updates
Implement a simple virtual DOM-like approach:

```javascript
// dom-diff.js
export function updateElement(parent, newNode, oldNode, index = 0) {
  // Implementation of a basic DOM diffing algorithm
}

// Usage example
const recipeList = document.getElementById('recipeList');
const oldState = [...recipeList.children];
const newState = createRecipeListElements(recipes);
updateElement(recipeList, newState, oldState);
```

#### 5.3 Implement Throttling and Debouncing
Add utility functions for performance-sensitive event handlers:

```javascript
// performance-utils.js
export function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

export function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}
```

## 6. Error Handling Improvements

### Current Issues:
- Inconsistent error handling
- Missing error feedback to users
- Console errors not properly logged
- No error boundary concept

### Refactoring Tasks:

#### 6.1 Implement Centralized Error Handling

```javascript
// error-handler.js
const ErrorHandler = {
  // Log error to console with context
  logError: function(error, context = {}) {
    console.error(`[${context.component || 'App'}]`, error, context);
    
    // Could send to error tracking service
    // if (window.errorTrackingService) { ... }
  },
  
  // Show user-friendly error message
  showUserError: function(message, options = {}) {
    const { level = 'error', duration = 5000 } = options;
    
    // Use existing notification system
    if (window.showNotification) {
      window.showNotification(message, level, duration);
    } else {
      alert(message);
    }
  },
  
  // Handle API errors
  handleApiError: function(error, userMessage = 'Operation failed') {
    this.logError(error, { component: 'API' });
    this.showUserError(userMessage);
  }
};

export default ErrorHandler;
```

#### 6.2 Create Error Boundaries for UI Sections

```javascript
// ui-error-boundary.js
export function createErrorBoundary(containerId, renderFunction) {
  const container = document.getElementById(containerId);
  
  try {
    renderFunction(container);
  } catch (error) {
    console.error(`Error in ${containerId}:`, error);
    container.innerHTML = `
      <div class="error-boundary">
        <h3>Something went wrong</h3>
        <p>There was an error loading this section.</p>
        <button class="btn" onclick="window.location.reload()">
          Reload Page
        </button>
      </div>
    `;
  }
}
```

## 7. Accessibility Improvements

### Current Issues:
- Inconsistent ARIA attributes
- Missing focus management
- Color contrast issues
- Keyboard navigation problems

### Refactoring Tasks:

#### 7.1 Add Proper ARIA Roles and Attributes

Audit and update HTML to include proper ARIA attributes:

```html
<button 
  aria-expanded="false"
  aria-controls="recipe-details"
  id="recipe-toggle">
  Show Details
</button>

<div 
  id="recipe-details" 
  role="region" 
  aria-labelledby="recipe-toggle"
  hidden>
  <!-- Content -->
</div>
```

#### 7.2 Implement Focus Management

```javascript
// focus-manager.js
const FocusManager = {
  // Save the current focus state
  saveFocus: function() {
    this.lastFocusedElement = document.activeElement;
  },
  
  // Restore focus to the previously focused element
  restoreFocus: function() {
    if (this.lastFocusedElement) {
      this.lastFocusedElement.focus();
    }
  },
  
  // Trap focus within a container (for modals)
  trapFocus: function(container) {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    // Focus the first element
    firstElement.focus();
    
    // Set up event listener
    container.addEventListener('keydown', function(e) {
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    });
  }
};

export default FocusManager;
```

## 8. Testing Improvements

### Current Issues:
- Incomplete test coverage
- Outdated tests
- No integration tests
- No accessibility testing

### Refactoring Tasks:

#### 8.1 Update Test Configuration
Update Jest configuration for better coverage reporting:

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  collectCoverage: true,
  collectCoverageFrom: [
    'js/**/*.js',
    '!js/vendor/**/*.js'
  ],
  coverageThreshold: {
    global: {
      statements: 70,
      branches: 60,
      functions: 70,
      lines: 70
    }
  }
};
```

#### 8.2 Create Component Test Helpers

```javascript
// test-helpers.js
export function createTestContainer() {
  const container = document.createElement('div');
  container.id = 'test-container';
  document.body.appendChild(container);
  return container;
}

export function cleanupTestContainer() {
  const container = document.getElementById('test-container');
  if (container) {
    document.body.removeChild(container);
  }
}

export function simulateEvent(element, eventName, options = {}) {
  const event = new Event(eventName, {
    bubbles: true,
    cancelable: true,
    ...options
  });
  element.dispatchEvent(event);
}
```

## Implementation Priority

1. **CSS Architecture Improvements** - Highest priority, addresses immediate pain points
2. **Error Handling Improvements** - Improves stability and user experience
3. **State Management Improvements** - Lays groundwork for better architecture
4. **API Layer Refactoring** - Centralizes data access
5. **JavaScript Modularization** - Improves code organization
6. **Accessibility Improvements** - Ensures compliance and usability
7. **Performance Optimizations** - Enhances user experience
8. **Testing Improvements** - Ensures stability during refactoring

## Conclusion

These refactoring tasks will significantly improve the codebase's maintainability, performance, and user experience without requiring a complete rewrite. They address the most critical issues while laying the groundwork for the eventual migration to a modern architecture.

The refactoring should be implemented incrementally, with thorough testing after each change to ensure stability. This approach will provide immediate benefits while making the eventual migration to the modern stack smoother and less risky.