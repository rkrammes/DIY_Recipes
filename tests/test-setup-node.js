// Set up Node.js environment properly for Puppeteer tests
global.showNotification = jest.fn();
global.alert = jest.fn();
global.confirm = jest.fn(() => true); // Default to confirming dialogs

// Other global helpers can be defined here as needed