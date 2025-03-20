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
 * Sets a global variable for edit mode and updates the Login/Logout button.
 * @param {object|null} session - The current authentication session object.
 */
export function handleAuthChange(session) {
  const isLoggedIn = !!(session && session.user);
  const btnLogIn = document.getElementById('btnLogIn');
  const magicLinkForm = document.getElementById('magicLinkForm');

  if (isLoggedIn) {
    console.log('User is logged in:', session.user.email);
    if (btnLogIn) {
      btnLogIn.textContent = "Log Out";
      btnLogIn.classList.add("logged-in");
    }
    if (magicLinkForm) {
      magicLinkForm.style.display = 'none';
    }
    window.editMode = true;
  } else {
    console.log('No user logged in');
    if (btnLogIn) {
      btnLogIn.textContent = "Log In";
      btnLogIn.classList.remove("logged-in");
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
 * Toggles authentication: if logged in, signs out; if not, shows the login form.
 */
export function toggleAuth() {
  const magicLinkForm = document.getElementById('magicLinkForm');
  // If logged in, sign out.
  if (window.editMode) {
    supabaseClient.auth.signOut();
  } else {
    // Otherwise, show the login form.
    if (magicLinkForm) {
      magicLinkForm.style.display = 'block';
    }
  }
}