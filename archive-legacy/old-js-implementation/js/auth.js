// auth.js - Enhanced Authentication Module
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