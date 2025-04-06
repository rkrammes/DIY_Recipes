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
  const modalOverlay = document.getElementById('modalOverlay');
  
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

  if (modalOverlay) {
    if (show) {
      modalOverlay.classList.add('active');
    } else {
      modalOverlay.classList.remove('active');
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