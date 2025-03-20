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
 * Updates UI based on session state.
 * Sets global window.editMode.
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
  // Reload data to update UI after login state changes.
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
    magicLinkForm.style.display = 'none';
  }
}

/**
 * Toggles edit mode by signing out if already logged in,
 * or showing the magic link form if not.
 */
export function toggleEditMode() {
  const magicLinkForm = document.getElementById('magicLinkForm');
  if (magicLinkForm.style.display === 'none' || magicLinkForm.style.display === '') {
    magicLinkForm.style.display = 'block';
  } else {
    supabaseClient.auth.signOut();
  }
  // Optionally dispatch an event here if needed.
}