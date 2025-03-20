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
 * Updates the UI based on the authentication state.
 * Sets a global variable for edit mode, updates the Login/Logout button,
 * and enables/disables the Edit Mode checkbox accordingly.
 * Dispatches a custom "authChanged" event for UI to update editing controls immediately.
 * @param {object|null} session - The current authentication session object.
 */
export function handleAuthChange(session) {
  const isLoggedIn = !!(session && session.user);
  const btnLogIn = document.getElementById('btnLogIn');
  const magicLinkForm = document.getElementById('magicLinkForm');
  const editCheckbox = document.getElementById('editModeCheckbox');

  if (isLoggedIn) {
    console.log('User is logged in:', session.user.email);
    if (btnLogIn) {
      btnLogIn.textContent = "Log Out";
      btnLogIn.classList.add("logged-in");
    }
    if (magicLinkForm) {
      magicLinkForm.style.display = 'none';
    }
    if (editCheckbox) {
      editCheckbox.checked = true;
      editCheckbox.disabled = false;
    }
    window.editMode = true;
  } else {
    console.log('No user logged in');
    if (btnLogIn) {
      btnLogIn.textContent = "Log In";
      btnLogIn.classList.remove("logged-in");
    }
    if (editCheckbox) {
      editCheckbox.checked = false;
      editCheckbox.disabled = true;
    }
    window.editMode = false;
  }
  
  // Dispatch custom event to notify UI that auth state has changed.
  window.dispatchEvent(new CustomEvent("authChanged", { detail: { editMode: window.editMode } }));
  
  // Reload data (public read should work for both states).
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
 * Toggles authentication: if logged in, signs out and reloads; if not, shows the login form.
 */
export async function toggleAuth() {
  if (window.editMode) {
    await supabaseClient.auth.signOut();
    window.location.reload();
  } else {
    const magicLinkForm = document.getElementById('magicLinkForm');
    if (magicLinkForm) {
      magicLinkForm.style.display = 'block';
    }
  }
}