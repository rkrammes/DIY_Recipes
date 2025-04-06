import { supabaseClient } from './supabaseClient.js';
import { showNotification } from './ui-utils.js';

/**
 * Update the login/logout button text based on auth state.
 */
export function updateAuthButton() {
  const btnLogIn = document.getElementById('btnLogIn');
  if (btnLogIn) {
    btnLogIn.textContent = window.isLoggedIn ? 'Log Out' : 'Log In';
  }
}

/**
 * Check if edit mode is enabled.
 * @returns {boolean}
 */
export function isEditMode() {
  const editModeCheckbox = document.getElementById('editModeCheckbox');
  return editModeCheckbox ? editModeCheckbox.checked : false;
}

/**
 * Set edit mode fields visibility based on login state or override.
 * @param {boolean|null} active
 */
export function setEditModeFields(active = null) {
  const isActive = active !== null ? active : window.isLoggedIn;
  const editElements = document.querySelectorAll('.edit-mode');
  editElements.forEach(el => {
    el.style.display = isActive ? '' : 'none';
  });
}

/**
 * Initialize authentication UI: event listeners and auth state handling.
 */
export function initAuthUI() {
  supabaseClient.auth.onAuthStateChange((event, session) => {
    const magicLinkForm = document.getElementById('magicLinkForm');
    const previousIsLoggedIn = window.isLoggedIn;

    if (event === 'SIGNED_IN') {
      window.isLoggedIn = true;
      if (magicLinkForm) magicLinkForm.style.display = 'none';
    } else if (event === 'SIGNED_OUT') {
      window.isLoggedIn = false;
    }
    if (event === 'INITIAL_SESSION') {
      window.isLoggedIn = !!session;
      updateAuthButton();
      setEditModeFields();
    }

    const loggedInStateChanged = previousIsLoggedIn !== window.isLoggedIn;

    updateAuthButton();
    setEditModeFields();

    if (loggedInStateChanged && !window.isLoggedIn) {
      const recipeDetailsView = document.getElementById('recipeDetailsView');
      if (recipeDetailsView) recipeDetailsView.style.display = 'none';
      const noRecipeSelectedView = document.getElementById('noRecipeSelectedView');
      if (noRecipeSelectedView) noRecipeSelectedView.style.display = 'block';
      const recipeHeaderSection = document.getElementById('recipeHeaderSection');
      if (recipeHeaderSection) recipeHeaderSection.style.display = 'none';

      const rightColumn = document.getElementById('right-column');
      if (rightColumn && window.ActionRenderer) {
        window.ActionRenderer.render(rightColumn, null);
      }

      const recipeList = document.getElementById('recipeList');
      if (recipeList) {
        recipeList.querySelectorAll('.recipe-item.selected').forEach(li => li.classList.remove('selected'));
      }
    }
  });

  const btnLogIn = document.getElementById('btnLogIn');
  if (btnLogIn) {
    btnLogIn.addEventListener('click', async () => {
      if (window.isLoggedIn) {
        try {
          const { error } = await supabaseClient.auth.signOut();
          if (error) throw error;
          showNotification('Logged out successfully.', 'success');
        } catch (err) {
          console.error('Error signing out:', err);
          showNotification(`Error signing out: ${err.message}`, 'error');
        }
      } else {
        const magicLinkForm = document.getElementById('magicLinkForm');
        if (magicLinkForm) {
          btnLogIn.dataset.showForm = btnLogIn.dataset.showForm === 'true' ? 'false' : 'true';
          magicLinkForm.style.display = btnLogIn.dataset.showForm === 'true' ? 'block' : 'none';
        }
      }
    });
  }

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
        const { error } = await supabaseClient.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: window.location.href,
          },
        });
        if (error) throw error;
        showNotification('Magic link sent! Check your email.', 'success');
      } catch (err) {
        console.error('Error sending magic link:', err);
        showNotification(`Error: ${err.message}`, 'error');
      }
    });
  }
}