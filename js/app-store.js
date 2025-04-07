const AppStore = (function() {
  // Private state
  const state = {
    recipes: [],
    selectedRecipeId: null,
    ingredients: [],
    user: null,
    theme: 'dark',
    editMode: false
  };

  // Subscribers
  const subscribers = [];

  // Notify subscribers
  function notifySubscribers() {
    subscribers.forEach(callback => callback({ ...state }));
  }

  // Public API
  return {
    getState: function() {
      return { ...state }; // Return copy to prevent direct mutation
    },

    subscribe: function(callback) {
      subscribers.push(callback);
      return () => {
        const index = subscribers.indexOf(callback);
        if (index !== -1) subscribers.splice(index, 1);
      };
    },

    updateRecipes: function(recipes) {
      state.recipes = [...recipes];
      notifySubscribers();
    },

    selectRecipe: function(id) {
      state.selectedRecipeId = id;
      notifySubscribers();
    },

    updateUser: function(user) {
      state.user = user;
      notifySubscribers();
    },

    setTheme: function(theme) {
      state.theme = theme;
      notifySubscribers();
    },

    setEditMode: function(enabled) {
      state.editMode = enabled;
      notifySubscribers();
    }
  };
})();

export default AppStore;