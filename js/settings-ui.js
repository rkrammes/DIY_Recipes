// settings-ui.js
import { isLoggedIn, getCurrentUser } from './auth.js';
import { showNotification } from './ui-utils.js';

/**
 * Initialize the settings panel UI and event handlers
 */
export function initSettingsUI() {
  console.log('Initializing Settings UI');
  const btnSettings = document.getElementById('btnSettings');
  const settingsPortal = document.getElementById('settings-portal');
  
  // Create overlay element
  const overlay = document.createElement('div');
  overlay.id = 'settings-overlay';
  document.body.appendChild(overlay);
  
  // Create the settings panel from scratch with proper ID
  const settingsPanel = document.createElement('div');
  settingsPanel.id = 'settingsPanel'; // Match the ID used in CSS
  settingsPanel.className = 'settings-panel'; // Add class for CSS targeting
  
  // Create the panel content
  settingsPanel.innerHTML = `
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
        <label for="btnEditModeToggle">Edit Mode:</label>
        <button class="btn btn-small" id="btnEditModeToggle" data-active="false">OFF</button>
      </div>
    </div>
    
    <!-- Theme Section -->
    <div class="settings-section">
      <h3>Theme</h3>
      <div class="toggle-container">
        <label for="btnThemeToggle">Theme:</label>
        <button class="btn btn-small" id="btnThemeToggle" data-theme="dark">Dark</button>
      </div>
    </div>
  `;
  
  // Add the panel to the portal
  if (settingsPortal) {
    settingsPortal.appendChild(settingsPanel);
    setupPanelEventListeners(settingsPanel);
    console.log('Settings panel created and added to portal container');
  } else {
    console.error('Failed to create settings panel: settings-portal not found');
  }
  
  // Set up event listeners for opening/closing the panel
  if (btnSettings) {
    btnSettings.addEventListener('click', function(e) {
      console.log('Settings button clicked');
      e.stopPropagation();
      toggleSettingsPanel();
    });
    
    // Close panel when clicking overlay
    overlay.addEventListener('click', function() {
      console.log('Overlay clicked');
      toggleSettingsPanel(false);
    });
    
    // Close panel when clicking outside
    document.addEventListener('click', function(e) {
      const panel = document.getElementById('settings-panel');
      if (panel && !panel.contains(e.target) && e.target !== btnSettings) {
        toggleSettingsPanel(false);
      }
    });
  }
  
  updateSettingsUI();
}

/**
 * Set up event listeners for the panel elements
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
  const panel = document.getElementById('settingsPanel');
  const overlay = document.getElementById('settings-overlay');
  const btnSettings = document.getElementById('btnSettings');
  
  // If show parameter is not provided, toggle based on current state
  if (show === undefined) {
    show = !panel.classList.contains('active');
  }
  
  console.log('Toggling settings panel:', show ? 'show' : 'hide');
  
  if (panel && overlay) {
    if (show) {
      // Apply direct styles for immediate visibility
      panel.style.position = 'fixed';
      panel.style.top = '60px';
      panel.style.right = '20px';
      panel.style.width = '280px';
      panel.style.backgroundColor = '#2a2a2a';
      panel.style.color = 'white';
      panel.style.padding = '15px';
      panel.style.borderRadius = '6px';
      panel.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
      panel.style.zIndex = '1000000';
      panel.style.display = 'block';
      panel.style.opacity = '1';
      panel.style.visibility = 'visible';
      panel.style.transform = 'none';
      panel.style.pointerEvents = 'auto';
      
      // Ensure overlay is visible
      overlay.style.display = 'block';
      overlay.style.opacity = '0.5';
      overlay.style.pointerEvents = 'auto';
      
      // Add active classes
      panel.classList.add('active');
      overlay.classList.add('active');
      
      // Update button state
      if (btnSettings) {
        btnSettings.setAttribute('aria-expanded', 'true');
      }
    } else {
      // Hide the panel
      panel.classList.remove('active');
      overlay.classList.remove('active');
      
      panel.style.opacity = '0';
      panel.style.transform = 'translateY(-10px)';
      overlay.style.opacity = '0';
      overlay.style.pointerEvents = 'none';
      
      // Update button state
      if (btnSettings) {
        btnSettings.setAttribute('aria-expanded', 'false');
      }
      
      // After transition completes, hide completely
      setTimeout(() => {
        if (!panel.classList.contains('active')) {
          panel.style.display = 'none';
          overlay.style.display = 'none';
        }
      }, 300);
    }
  } else {
    console.error('Cannot toggle panel: panel or overlay not found');
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