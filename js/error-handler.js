const ErrorHandler = {
  logError: function(error, context = {}) {
    console.error(`[${context.component || 'App'}]`, error, context);
    // Could send to error tracking service
    // if (window.errorTrackingService) { ... }
  },

  showUserError: function(message, options = {}) {
    const { level = 'error', duration = 5000 } = options;
    if (window.showNotification) {
      window.showNotification(message, level, duration);
    } else {
      alert(message);
    }
  },

  handleApiError: function(error, userMessage = 'Operation failed') {
    this.logError(error, { component: 'API' });
    this.showUserError(userMessage);
  }
};

export default ErrorHandler;