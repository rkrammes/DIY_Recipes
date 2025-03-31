// auth.js
import { supabaseClient } from './supabaseClient.js';

/**
 * Sends a magic link to the user's email.
 * @param {string} email - The user's email address.
 * @returns {Promise<object>} - Result of the operation.
 */
export async function sendMagicLink(email) {
  const { data, error } = await supabaseClient.auth.signInWithOtp({ email });
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
  console.log('User signed out successfully.');
}