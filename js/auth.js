// auth.js
import { supabaseClient } from './supabaseClient.js';
import { loadRecipes, loadAllIngredients } from './api.js';

/**
 * Initializes authentication by listening for auth state changes.
 */
export function initAuth() {
  supabaseClient.auth.onAuthStateChange((event, session) => {
    handleAuthChange(session);
  });
  supabaseClient.auth.getSession().then(({ data: { session } }) => {
    handleAuthChange(session);
  });
}

/**
 * Updates the UI based on whether the user is logged in.
 * Sets a global variable for Edit Mode.
 * @param {object|null} session - The current authentication session object.
 */
export function handleAuthChange(session) {
  const isLoggedIn = !!(session && session.user);
  const editModeCheckbox = document.getElementById('editModeCheckbox');
  const magicLinkForm = document.getElementById('magicLinkForm');

  if (isLoggedIn) {
    console.log('User is logged in:', session.user.email);
    if (editModeCheckbox) {
      // Automatically check the Edit Mode checkbox if logged in.
      editModeCheckbox.checked = true;
    }
    if (magicLinkForm) {
      magicLinkForm.style.display = 'none';
    }
    window.editMode = true;
  } else {
    console.log('No user logged in');
    if (editModeCheckbox) {
      editModeCheckbox.checked = false;
    }
    window.editMode = false;
  }
  
  // Refresh recipes and ingredients to update the UI.
  loadRecipes();
  loadAllIngredients();
}

/**
 * Sends a magic link for passwordless authentication.
 */
export async function sendMagicLink() {
  console.log('sendMagicLink() invoked');
  const emailInput = document.getElementById('magicLinkEmail');
  const email = emailInput.value.trim();
  if (!email) {
    alert('Please enter an email address.');
    return;
  }
  console.log('Attempting to send magic link to:', email);
  const { data, error } = await supabaseClient.auth.signInWithOtp({ email });
  console.log('Supabase response:', data, 'Error:', error);
  if (error) {
    alert(`Error sending magic link: ${error.message}`);
  } else {
    alert('Magic link sent—check your inbox!');
    if (document.getElementById('magicLinkForm')) {
      document.getElementById('magicLinkForm').style.display = 'none';
    }
  }
}

/**
 * Toggles edit mode by showing the magic link form if not logged in,
 * or signing out if already logged in.
 */
export function toggleEditMode() {
  const magicLinkForm = document.getElementById('magicLinkForm');
  if (magicLinkForm) {
    if (magicLinkForm.style.display === 'none' || magicLinkForm.style.display === '') {
      magicLinkForm.style.display = 'block';
    } else {
      supabaseClient.auth.signOut();
    }
  }
}