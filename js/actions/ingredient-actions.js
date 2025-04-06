import { ActionRegistry } from '../action-registry.js';

const editIngredientDetailsAction = {
  id: 'edit-ingredient-details',
  name: 'Edit Ingredient Details',
  icon: 'fas fa-seedling',
  category: 'primary',
  applicableTo: (item) => item.type === 'ingredient',
  render: (container, item) => {
    const btn = document.createElement('button');
    btn.innerHTML = '<i class="fas fa-seedling"></i> Edit Details';
    btn.onclick = () => editIngredientDetailsAction.execute(item);
    container.appendChild(btn);
    return btn;
  },
  execute: (item) => {
    console.log('Editing ingredient details for', item);
  }
};

const findSubstitutesAction = {
  id: 'find-substitutes',
  name: 'Find Substitutes',
  icon: 'fas fa-exchange-alt',
  category: 'utility',
  applicableTo: (item) => item.type === 'ingredient',
  render: (container, item) => {
    const btn = document.createElement('button');
    btn.innerHTML = '<i class="fas fa-exchange-alt"></i> Find Substitutes';
    btn.onclick = () => findSubstitutesAction.execute(item);
    container.appendChild(btn);
    return btn;
  },
  execute: (item) => {
    console.log('Finding substitutes for', item);
  }
};

const viewUsageAction = {
  id: 'view-usage',
  name: 'View Usage',
  icon: 'fas fa-eye',
  category: 'utility',
  applicableTo: (item) => item.type === 'ingredient',
  render: (container, item) => {
    const btn = document.createElement('button');
    btn.innerHTML = '<i class="fas fa-eye"></i> View Usage';
    btn.onclick = () => viewUsageAction.execute(item);
    container.appendChild(btn);
    return btn;
  },
  execute: (item) => {
    console.log('Viewing usage for', item);
  }
};

// Register actions
ActionRegistry.register(editIngredientDetailsAction);
ActionRegistry.register(findSubstitutesAction);
ActionRegistry.register(viewUsageAction);