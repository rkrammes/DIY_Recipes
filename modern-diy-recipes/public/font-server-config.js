/**
 * Font Server Configuration
 * 
 * This script sets up configuration for the font server URL
 * It should be included before the font-loader.js script
 */
(function() {
  // Create a global ENV object if it doesn't exist
  window.ENV = window.ENV || {};
  
  // Set the font server URL
  // This will be overridden by the server if necessary
  window.ENV.FONT_SERVER_URL = window.ENV.FONT_SERVER_URL || 'http://localhost:3000';
  
  // Log configuration to console
  console.log(`💡 Font server configured: ${window.ENV.FONT_SERVER_URL}`);
})();