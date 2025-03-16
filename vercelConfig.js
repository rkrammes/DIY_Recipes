/**
 * File: vercelConfig.js
 * Project: Symbolkraft DIY Recipes Web App
 *
 * Description:
 *   This module stores and provides deployment-specific configuration settings.
 *   It includes environment variables that are used throughout the application,
 *   such as the port number, Supabase URL, and Supabase key.
 *
 * Big Picture:
 *   - Acts as the centralized configuration hub for the application’s deployment on Vercel.
 *   - Ensures that sensitive credentials and deployment settings are managed securely
 *     via environment variables.
 *
 * Related Modules:
 *   - index.js: Retrieves deployment configurations from this module.
 *   - supabaseConnector.js: Uses the Supabase credentials defined here.
 *
 * NOTE for ChatGPT & Developers:
 *   This file is critical for managing deployment settings. Ensure that all environment variables
 *   are correctly set in your development and production environments.
 *
 * Instructions for Integration:
 *   1. Copy and paste this file into your project as "vercelConfig.js".
 *   2. Verify that your environment variables (e.g., PORT, SUPABASE_URL, SUPABASE_KEY) are correctly set.
 *   3. Commit the changes to your GitHub repository.
 *   4. Use this file as a reference to maintain consistent deployment configurations.
 *
 * Version: v1.0 | Last Updated: 2025-03-16
 * Author: [Your Name]
 */

// Create a configuration object that holds environment and build settings.
const config = {
  env: {
    // Use the PORT defined in environment variables or default to 3000.
    PORT: process.env.PORT || 3000,
    // Supabase credentials are retrieved from environment variables for security.
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_KEY: process.env.SUPABASE_KEY,
    // Add any additional environment variables as needed.
  },
  build: {
    // Build-specific configurations can be defined here if necessary.
    // For example, you might define build commands, caching settings, etc.
  },
};

module.exports = config;
