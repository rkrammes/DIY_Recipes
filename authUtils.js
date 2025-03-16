/**
 * File: authUtils.js
 * Project: Symbolkraft DIY Recipes Web App
 *
 * Description:
 *   This module handles user authentication and security functions.
 *   It provides methods for hashing passwords using bcryptjs and verifying
 *   user credentials during login.
 *
 * Big Picture:
 *   - Ensures that user passwords are securely hashed before storage.
 *   - Supports user login by comparing provided credentials with stored hashes.
 *   - Plays a critical role in maintaining the overall security and integrity of the app.
 *
 * Related Modules:
 *   - index.js: Integrates authentication endpoints that use this module.
 *
 * NOTE for ChatGPT & Developers:
 *   Refer to this header to re-establish the context of user authentication within the app.
 *   This module is crucial for secure access control.
 *
 * Instructions for Integration:
 *   1. Copy and paste this file into your project as "authUtils.js".
 *   2. Review and modify as necessary to match your project’s security requirements.
 *   3. Commit the changes to your GitHub repository.
 *   4. Use this file as a reference for maintaining security context in future sessions.
 *
 * Version: v1.0 | Last Updated: 2025-03-16
 * Author: [Your Name]
 */

const bcrypt = require('bcryptjs');

/**
 * Hashes a plaintext password.
 *
 * @param {string} plainPassword - The user’s plaintext password.
 * @returns {Promise<string>} - A promise that resolves to the hashed password.
 *
 * Big Picture:
 *   Ensures that user passwords are stored securely in the database,
 *   protecting sensitive user data from potential breaches.
 */
async function hashPassword(plainPassword) {
  try {
    const saltRounds = 10; // Number of rounds for salt generation (can be adjusted as needed)
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
    return hashedPassword;
  } catch (error) {
    console.error('Error hashing password:', error);
    throw new Error('Password hashing failed.');
  }
}

/**
 * Compares a plaintext password with a hashed password.
 *
 * @param {string} plainPassword - The user’s plaintext password.
 * @param {string} hash - The hashed password stored in the database.
 * @returns {Promise<boolean>} - A promise that resolves to true if the passwords match, false otherwise.
 *
 * Big Picture:
 *   This function verifies user credentials during login,
 *   ensuring that only authenticated users can access the system.
 */
async function comparePassword(plainPassword, hash) {
  try {
    const isMatch = await bcrypt.compare(plainPassword, hash);
    return isMatch;
  } catch (error) {
    console.error('Error comparing passwords:', error);
    throw new Error('Password comparison failed.');
  }
}

/**
 * Authenticates a user by comparing the provided credentials with stored data.
 *
 * @param {string} username - The user’s username.
 * @param {string} password - The user’s plaintext password.
 * @returns {Promise<boolean>} - A promise that resolves to true if authentication is successful.
 *
 * Big Picture:
 *   Integrates the hashing and comparison functions to authenticate users.
 *   This is the entry point for user login in the app.
 */
async function authenticate(username, password) {
  // NOTE: Replace this with your actual user lookup and retrieval logic.
  // For demonstration purposes, we're using a hardcoded user.
  const userRecord = {
    username: 'demoUser',
    // Replace 'sampleHash' with the actual hashed password stored in your database.
    passwordHash: '$2a$10$e0MYzXyjpJS7Pd0RVvHwHeFxv3QZXKXa8.lsS5G5/fYlE8bJ61l1W' // sample hash
  };

  if (username !== userRecord.username) {
    return false;
  }
  
  // Compare the provided password with the stored hash.
  const isAuthenticated = await comparePassword(password, userRecord.passwordHash);
  return isAuthenticated;
}

// Export the authentication functions for use in other modules.
module.exports = {
  hashPassword,
  comparePassword,
  authenticate
};
