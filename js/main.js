// main.js - Application Entry Point

// Import the single, correctly configured Supabase client instance
import { supabaseClient } from './supabaseClient.js';

// Import the UI initializer function
import { initUI } from './ui.js';

// Wait for the DOM to be fully loaded before initializing the UI
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM fully loaded and parsed. Initializing UI...');
  // Check if supabaseClient is available before initializing UI
  if (supabaseClient) {
    initUI(); // Call the UI initialization function
  } else {
    console.error('Supabase client failed to initialize. Cannot start UI.');
    // Optionally display an error message to the user
    alert('Error: Could not connect to the backend. Please try refreshing the page.');
  }
});

// Note: The supabaseClient export from the original main.js is removed
// as the client is now imported from supabaseClient.js where needed (e.g., in api.js, ui.js).