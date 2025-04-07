/**
 * Utility functions for UI operations in DIY Recipes
 * @module ui-utils
 */

/**
 * Display a temporary notification message.
 * @param {string} message - The message to display.
 * @param {'info'|'success'|'error'} [type='info'] - Notification type.
 */
export function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.innerText = message;

  notification.style.position = 'fixed';
  notification.style.bottom = '20px';
  notification.style.right = '20px';
  notification.style.padding = '10px 15px';
  notification.style.borderRadius = '5px';
  notification.style.color = '#fff';
  notification.style.fontSize = '14px';
  notification.style.zIndex = 1000;
  notification.style.opacity = '0.95';

  if (type === 'success') {
    notification.style.backgroundColor = '#4CAF50';
  } else if (type === 'error') {
    notification.style.backgroundColor = '#f44336';
  } else {
    notification.style.backgroundColor = '#2196F3';
  }

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 3000);
}

/**
 * Safely set the text content of an element by ID, with optional fallback.
 * @param {string} elementId - The DOM element ID.
 * @param {string} value - The text to set.
 * @param {string} [fallback=''] - Fallback text if value is falsy.
 */
export function safeSetText(elementId, value, fallback = '') {
  const el = document.getElementById(elementId);
  if (el) {
    el.textContent = value || fallback;
  }
}