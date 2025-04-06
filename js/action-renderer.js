const ActionRenderer = {
  render(container, item) {
    // Clear existing actions
    container.innerHTML = '';

    if (!item) {
      return;
    }

    // Get applicable actions
    const actions = ActionRegistry.getActionsForItem(item);

    // Group actions by category
    const groupedActions = this.groupActionsByCategory(actions);

    // Render each group
    for (const [category, actionsInGroup] of Object.entries(groupedActions)) {
      this.renderActionGroup(container, category, actionsInGroup, item);
    }
  },

  groupActionsByCategory(actions) {
    const grouped = {
      primary: [],
      secondary: [],
      utility: []
    };
    for (const action of actions) {
      if (grouped[action.category]) {
        grouped[action.category].push(action);
      } else {
        // Unknown category, treat as secondary
        grouped.secondary.push(action);
      }
    }
    return grouped;
  },

  renderActionGroup(container, category, actions, item) {
    if (actions.length === 0) return;

    const groupContainer = document.createElement('div');
    groupContainer.className = `action-group action-group-${category}`;

    for (const action of actions) {
      const button = action.render
        ? action.render(document.createElement('div'), item)
        : this.createActionButton(action, item);
      button.classList.add('action-button', `action-${category}`);
      groupContainer.appendChild(button);
    }

    container.appendChild(groupContainer);
  },

  createActionButton(action, item) {
    const button = document.createElement('button');
    button.innerText = action.name;
    if (action.icon) {
      button.classList.add(action.icon);
    }
    button.onclick = () => {
      if (typeof action.execute === 'function') {
        action.execute(item);
      }
    };
    return button;
  }
};

window.ActionRenderer = ActionRenderer;