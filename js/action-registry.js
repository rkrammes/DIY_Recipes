const ActionRegistry = {
  actions: [],

  register(action) {
    if (action && typeof action.applicableTo === 'function') {
      this.actions.push(action);
    }
  },

  getActionsForItem(item) {
    return this.actions.filter(action => {
      try {
        return action.applicableTo(item);
      } catch {
        return false;
      }
    });
  }
};

export default ActionRegistry;