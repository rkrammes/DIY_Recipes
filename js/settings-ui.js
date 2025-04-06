// settings-ui.js
import { isLoggedIn, getCurrentUser } from './auth.js';
import { showNotification } from './ui-utils.js';

/**
 * Initialize the settings panel UI and event handlers
 */
export function initSettingsUI() {
  const btnSettings = document.getElementById('btnSettings');
  const settingsPanel = document.getElementById('settingsPanel');
  const settingsPortal = document.getElementById('settings-portal');
  
  // Create overlay element
  const overlay = document.createElement('div');
  overlay.id = 'settings-overlay';
  document.body.appendChild(overlay);
  
  // Move the original settings panel DOM node into the portal container
  if (settingsPanel && settingsPortal) {
    settingsPortal.appendChild(settingsPanel);
    setupPanelEventListeners(settingsPanel);
  }
  
  // Toggle settings panel visibility
  if (btnSettings && settingsPortal) {
    btnSettings.addEventListener('click', (e) => {
      e.stopPropagation();
      const panel = settingsPortal.querySelector('.settings-panel');
      if (panel) {
        const isActive = panel.classList.contains('active');
        toggleSettingsPanel(!isActive);
      }
    });
    
    // Close panel when clicking overlay
    overlay.addEventListener('click', () => {
      toggleSettingsPanel(false);
    });
    
    // Close panel when clicking outside
    document.addEventListener('click', (e) => {
      const panel = settingsPortal.querySelector('.settings-panel');
      if (panel && !panel.contains(e.target) && e.target !== btnSettings) {
        toggleSettingsPanel(false);
      }
    });
  }
  
  updateSettingsUI();
}

/**
 * Set up event listeners for the cloned panel elements
 */
function setupPanelEventListeners(panel) {
  const btnSendMagicLink = panel.querySelector('#btnSendMagicLink');
  const magicLinkEmail = panel.querySelector('#magicLinkEmail');
  const btnLogOut = panel.querySelector('#btnLogOut');
  
  if (btnSendMagicLink && magicLinkEmail) {
    btnSendMagicLink.addEventListener('click', handleMagicLinkRequest);
  }
  
  if (btnLogOut) {
    btnLogOut.addEventListener('click', handleLogout);
  }
  
  const btnEditModeToggle = panel.querySelector('#btnEditModeToggle');
  if (btnEditModeToggle) {
    btnEditModeToggle.addEventListener('click', handleEditModeToggle);
  }
  
  const btnThemeToggle = panel.querySelector('#btnThemeToggle');
  if (btnThemeToggle) {
    btnThemeToggle.addEventListener('click', handleThemeToggle);
  }
}

/**
 * Toggle the settings panel visibility
 * @param {boolean} show - Whether to show or hide the panel
 */
export function toggleSettingsPanel(show) {
  const settingsPortal = document.getElementById('settings-portal');
  const overlay = document.getElementById('settings-overlay');
  const panel = settingsPortal ? settingsPortal.querySelector('.settings-panel') : null;
  
  if (panel && overlay) {
    if (show) {
      panel.classList.add('active');
      overlay.classList.add('active');
    } else {
      panel.classList.remove('active');
      overlay.classList.remove('active');
    }
  }
}

// Event handler implementations
function handleMagicLinkRequest() {
  // Implementation for sending magic link
}

function handleLogout() {
  // Implementation for logout
}

function handleEditModeToggle() {
  // Implementation for edit mode toggle
}

function handleThemeToggle() {
  // Implementation for theme toggle
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