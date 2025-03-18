// auth.js
import { supabaseClient } from './supabaseClient.js';
import { loadRecipes, loadAllIngredients } from './api.js';

/**
 * Initializes authentication by listening to auth state changes and checking the current session.
 */
export function initAuth() {
  // Listen for auth changes
  supabaseClient.auth.onAuthStateChange((event, session) => {
    handleAuthChange(session);
  });

  // Check for an existing session on load
  supabaseClient.auth.getSession().then(({ data: { session } }) => {
    handleAuthChange(session);
  });
}

/**
 * Updates the UI based on whether the user is logged in or not.
 * Also sets a global variable for Edit Mode.
 * @param {object|null} session - The current authentication session object.
 */
export function handleAuthChange(session) {
  const isLoggedIn = !!(session && session.user);
  const btnEditMode = document.getElementById('btnEditMode');
  const magicLinkForm = document.getElementById('magicLinkForm');

  if (isLoggedIn) {
    console.log('User is logged in:', session.user.email);
    btnEditMode.textContent = 'Edit Mode: ON';
    magicLinkForm.style.display = 'none';
    window.editMode = true;
  } else {
    console.log('No user logged in');
    btnEditMode.textContent = 'Edit Mode: OFF';
    window.editMode = false;
  }
  
  // Refresh recipes and ingredients to update the UI
  loadRecipes();
  loadAllIngredients();
}

/**
 * Sends a magic link to the provided email address for passwordless authentication.
 */
export async function sendMagicLink() {
  console.log('🔔 sendMagicLink() invoked');
  const emailInput = document.getElementById('magicLinkEmail');
  const email = emailInput.value.trim();

  if (!email) {
    alert('Please enter an email address.');
    return;
  }

  console.log('📧 Attempting to send magic link to:', email);

  const { data, error } = await supabaseClient.auth.signInWithOtp({ email });
  console.log('Supabase response →', data, 'Error →', error);

  if (error) {
    alert(`Error sending magic link: ${error.message}`);
  } else {
    alert('✅ Magic link sent — check your inbox (or spam folder).');
    document.getElementById('magicLinkForm').style.display = 'none';
  }
}

/**
 * Toggles edit mode. If the user is not logged in, it shows the magic link form.
 * If already visible (or user is logged in), it signs out the user.
 * Also dispatches an event to update UI elements.
 */
export function toggleEditMode() {
  const magicLinkForm = document.getElementById('magicLinkForm');
  
  if (magicLinkForm.style.display === 'none' || magicLinkForm.style.display === '') {
    magicLinkForm.style.display = 'block';
  } else {
    supabaseClient.auth.signOut();
  }
  // Dispatch event so UI can update (e.g., show/hide Remove buttons)
  window.dispatchEvent(new CustomEvent("editModeChanged"));
}
