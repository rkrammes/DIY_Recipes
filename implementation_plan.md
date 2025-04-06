# Authentication and Settings Implementation Plan

This document provides a detailed implementation plan for adding an expandable Settings section with authentication, edit mode, and theme selection functionality.

## HTML Structure Changes

### 1. Modify the Header Right Section in index.html

Replace the current theme and edit mode buttons with a single Settings button and collapsible panel:

```html
<div class="header-right">
  <button class="btn btn-header" id="btnSettings" aria-label="Settings" aria-expanded="false">
    Settings <span class="settings-icon">⚙️</span>
  </button>
  
  <!-- Collapsible Settings Panel -->
  <div id="settingsPanel" class="settings-panel collapsible-container" data-color="neutral" aria-expanded="false">
    <div class="collapsible-content" id="settings-content">
      <!-- Authentication Section -->
      <div class="settings-section auth-section">
        <h3>Authentication</h3>
        <div id="authControls">
          <!-- When logged out -->
          <div id="loggedOutView">
            <div id="magicLinkForm">
              <input type="email" id="magicLinkEmail" placeholder="Email" aria-label="Email for magic link" class="input-small"/>
              <button class="btn btn-small" id="btnSendMagicLink">Send Link</button>
            </div>
          </div>
          <!-- When logged in -->
          <div id="loggedInView" style="display: none;">
            <span id="loggedInEmail"></span>
            <button class="btn btn-small" id="btnLogOut">Log Out</button>
          </div>
        </div>
        <div id="statusMessages" aria-live="polite"></div>
      </div>
      
      <!-- Edit Mode Section -->
      <div class="settings-section">
        <h3>Edit Mode</h3>
        <div class="toggle-container">
          <label for="editModeToggle">Edit Mode:</label>
          <button class="btn btn-small" id="btnEditModeToggle" data-active="false">OFF</button>
        </div>
      </div>
      
      <!-- Theme Section -->
      <div class="settings-section">
        <h3>Theme</h3>
        <div class="toggle-container">
          <label for="themeToggle">Theme:</label>
          <button class="btn btn-small" id="btnThemeToggle" data-theme="dark">Dark</button>
        </div>
      </div>
    </div>
  </div>
</div>
```

## CSS Additions

Add the following CSS to style.css:

```css
/* Settings Panel Styles */
.settings-panel {
  position: absolute;
  top: 100%;
  right: 0;
  width: 280px;
  background-color: var(--color-glass-bg);
  backdrop-filter: blur(10px);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-elevation-medium);
  z-index: 1000;
  overflow: hidden;
  transition: max-height 0.3s ease, opacity 0.3s ease;
  max-height: 0;
  opacity: 0;
}

.settings-panel[aria-expanded="true"] {
  max-height: 500px;
  opacity: 1;
}

.settings-panel .collapsible-content {
  padding: var(--spacing-medium);
}

.settings-section {
  margin-bottom: var(--spacing-medium);
  padding-bottom: var(--spacing-small);
  border-bottom: 1px solid var(--color-border);
}

.settings-section:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.settings-section h3 {
  font-size: 1rem;
  margin-top: 0;
  margin-bottom: var(--spacing-small);
}

.toggle-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

#authControls {
  margin-bottom: var(--spacing-small);
}

#magicLinkForm {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-small);
}

#statusMessages {
  font-size: 0.8em;
  margin-top: var(--spacing-small);
  min-height: 1.2em;
}

#loggedInEmail {
  font-weight: bold;
  margin-right: var(--spacing-small);
}

.settings-icon {
  margin-left: var(--spacing-small);
}

/* Auth status indicator */
.auth-status-indicator {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-left: 6px;
}

.auth-status-indicator.logged-in {
  background-color: var(--color-success);
}

.auth-status-indicator.logged-out {
  background-color: var(--color-error);
}
```

## JavaScript Implementation

### 1. Create a new settings-ui.js file

```javascript
// settings-ui.js
import { isLoggedIn, getCurrentUser } from './auth.js';
import { showNotification } from './ui-utils.js';

/**
 * Initialize the settings panel UI and event handlers
 */
export function initSettingsUI() {
  const btnSettings = document.getElementById('btnSettings');
  const settingsPanel = document.getElementById('settingsPanel');
  
  // Toggle settings panel visibility
  if (btnSettings && settingsPanel) {
    btnSettings.addEventListener('click', (e) => {
      e.stopPropagation();
      const isExpanded = settingsPanel.getAttribute('aria-expanded') === 'true';
      toggleSettingsPanel(!isExpanded);
    });
    
    // Close panel when clicking outside
    document.addEventListener('click', (e) => {
      if (!settingsPanel.contains(e.target) && e.target !== btnSettings) {
        toggleSettingsPanel(false);
      }
    });
  }
  
  // Update settings UI to match current state
  updateSettingsUI();
}

/**
 * Toggle the settings panel visibility
 * @param {boolean} show - Whether to show or hide the panel
 */
export function toggleSettingsPanel(show) {
  const btnSettings = document.getElementById('btnSettings');
  const settingsPanel = document.getElementById('settingsPanel');
  
  if (btnSettings && settingsPanel) {
    settingsPanel.setAttribute('aria-expanded', show.toString());
    btnSettings.setAttribute('aria-expanded', show.toString());
    
    // Update content visibility
    const content = settingsPanel.querySelector('.collapsible-content');
    if (content) {
      if (show) {
        content.style.maxHeight = content.scrollHeight + "px";
        content.style.opacity = 1;
        content.style.padding = 'var(--spacing-medium)';
      } else {
        content.style.maxHeight = '0';
        content.style.opacity = 0;
        content.style.padding = '0 var(--spacing-medium)';
      }
    }
  }
}

/**
 * Update the settings UI based on current state
 */
export function updateSettingsUI() {
  updateAuthUI();
  updateEditModeUI();
  updateThemeUI();
}

/**
 * Update the authentication section UI
 */
function updateAuthUI() {
  const loggedOutView = document.getElementById('loggedOutView');
  const loggedInView = document.getElementById('loggedInView');
  const loggedInEmail = document.getElementById('loggedInEmail');
  const btnSettings = document.getElementById('btnSettings');
  
  if (loggedOutView && loggedInView) {
    if (isLoggedIn()) {
      loggedOutView.style.display = 'none';
      loggedInView.style.display = 'block';
      
      // Show user email if available
      const user = getCurrentUser();
      if (loggedInEmail && user && user.email) {
        loggedInEmail.textContent = user.email;
      }
      
      // Add logged-in indicator to settings button
      if (btnSettings) {
        if (!btnSettings.querySelector('.auth-status-indicator')) {
          const indicator = document.createElement('span');
          indicator.className = 'auth-status-indicator logged-in';
          btnSettings.appendChild(indicator);
        } else {
          btnSettings.querySelector('.auth-status-indicator').className = 'auth-status-indicator logged-in';
        }
      }
    } else {
      loggedOutView.style.display = 'block';
      loggedInView.style.display = 'none';
      
      // Update logged-out indicator
      if (btnSettings) {
        if (!btnSettings.querySelector('.auth-status-indicator')) {
          const indicator = document.createElement('span');
          indicator.className = 'auth-status-indicator logged-out';
          btnSettings.appendChild(indicator);
        } else {
          btnSettings.querySelector('.auth-status-indicator').className = 'auth-status-indicator logged-out';
        }
      }
    }
  }
}

/**
 * Update the edit mode section UI
 */
function updateEditModeUI() {
  const btnEditModeToggle = document.getElementById('btnEditModeToggle');
  
  if (btnEditModeToggle) {
    const isActive = btnEditModeToggle.dataset.active === 'true';
    btnEditModeToggle.textContent = isActive ? 'ON' : 'OFF';
    
    // Disable if not logged in
    if (!isLoggedIn()) {
      btnEditModeToggle.disabled = true;
      btnEditModeToggle.title = 'Log in to enable edit mode';
    } else {
      btnEditModeToggle.disabled = false;
      btnEditModeToggle.title = '';
    }
  }
}

/**
 * Update the theme section UI
 */
function updateThemeUI() {
  const btnThemeToggle = document.getElementById('btnThemeToggle');
  
  if (btnThemeToggle) {
    const currentTheme = btnThemeToggle.dataset.theme || 'dark';
    btnThemeToggle.textContent = currentTheme.charAt(0).toUpperCase() + currentTheme.slice(1);
  }
}
```

### 2. Modify auth.js to enhance authentication functionality

```javascript
// auth.js - Enhancements
import { supabaseClient } from './supabaseClient.js';
import { showNotification } from './ui-utils.js';
import { updateSettingsUI } from './settings-ui.js';

// Track the current user
let currentUser = null;

/**
 * Sends a magic link to the user's email.
 * @param {string} email - The user's email address.
 * @returns {Promise<object>} - Result of the operation.
 */
export async function sendMagicLink(email) {
  const { data, error } = await supabaseClient.auth.signInWithOtp({ 
    email,
    options: {
      emailRedirectTo: window.location.href,
    }
  });
  
  if (error) {
    console.error('Error sending magic link:', error);
    throw error;
  }
  
  console.log('Magic link sent successfully:', data);
  return data;
}

/**
 * Signs out the current user.
 * @returns {Promise<void>}
 */
export async function signOut() {
  const { error } = await supabaseClient.auth.signOut();
  if (error) {
    console.error('Error signing out:', error);
    throw error;
  }
  
  currentUser = null;
  console.log('User signed out successfully.');
  updateSettingsUI();
}

/**
 * Check if a user is currently logged in
 * @returns {boolean}
 */
export function isLoggedIn() {
  return !!currentUser;
}

/**
 * Get the current user object
 * @returns {object|null}
 */
export function getCurrentUser() {
  return currentUser;
}

/**
 * Initialize authentication listeners and session handling
 */
export function initAuth() {
  // Check for existing session
  supabaseClient.auth.getSession().then(({ data: { session } }) => {
    currentUser = session?.user || null;
    updateSettingsUI();
  });
  
  // Listen for auth state changes
  supabaseClient.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed:', event);
    
    if (event === 'SIGNED_IN') {
      currentUser = session.user;
      showNotification('Signed in successfully!', 'success');
    } else if (event === 'SIGNED_OUT') {
      currentUser = null;
      showNotification('Signed out successfully.', 'success');
    } else if (event === 'USER_UPDATED') {
      currentUser = session?.user || null;
    }
    
    updateSettingsUI();
  });
  
  // Set up event listeners
  setupAuthEventListeners();
}

/**
 * Set up event listeners for auth-related UI elements
 */
function setupAuthEventListeners() {
  // Send Magic Link button
  const btnSendMagicLink = document.getElementById('btnSendMagicLink');
  const magicLinkEmail = document.getElementById('magicLinkEmail');
  
  if (btnSendMagicLink && magicLinkEmail) {
    btnSendMagicLink.addEventListener('click', async () => {
      const email = magicLinkEmail.value.trim();
      if (!email) {
        showNotification('Please enter your email address.', 'error');
        return;
      }
      
      try {
        await sendMagicLink(email);
        showNotification('Magic link sent! Check your email.', 'success');
      } catch (err) {
        showNotification(`Error: ${err.message}`, 'error');
      }
    });
  }
  
  // Log Out button
  const btnLogOut = document.getElementById('btnLogOut');
  if (btnLogOut) {
    btnLogOut.addEventListener('click', async () => {
      try {
        await signOut();
      } catch (err) {
        showNotification(`Error signing out: ${err.message}`, 'error');
      }
    });
  }
}
```

### 3. Update main.js to initialize the new modules

```javascript
// main.js - Add initialization for settings
import { initSettingsUI } from './settings-ui.js';
import { initAuth } from './auth.js';

// In the DOMContentLoaded event handler, after initUI():
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM fully loaded and parsed. Initializing UI...');
  if (supabaseClient) {
    initUI();
    initAuth();     // Initialize auth with enhanced functionality
    initSettingsUI(); // Initialize settings panel
  } else {
    console.error('Supabase client failed to initialize. Cannot start UI.');
    alert('Error: Could not connect to the backend. Please try refreshing the page.');
  }
});
```

### 4. Update ui.js to integrate with the new settings panel

Modify the following functions in ui.js:

- Remove the `updateAuthButton` function (replaced by settings-ui.js)
- Update the `setEditModeFields` function to work with the new UI
- Remove event listeners for the old auth UI elements

## Testing Plan

1. Test the expandable settings panel:
   - Verify it opens and closes correctly
   - Check that it appears in the correct position
   - Ensure it has proper styling

2. Test authentication:
   - Test login with magic link
   - Test logout functionality
   - Verify auth status indicator updates correctly

3. Test edit mode:
   - Verify it's only available when logged in
   - Check that it toggles correctly
   - Ensure edit mode elements appear/disappear appropriately

4. Test theme selection:
   - Verify theme toggle works
   - Check that theme changes are applied correctly

5. Test integration:
   - Verify all settings components work together
   - Check that authentication state affects edit mode correctly
   - Ensure settings panel closes when clicking outside