// ActionRegistry is a default export; import it directly, not as a named import
import ActionRegistry from '../action-registry.js';

const newRecipeAction = {
  id: 'new-recipe',
  name: 'New Recipe',
  icon: 'fas fa-plus',
  category: 'primary',
  applicableTo: () => true,
  render: (container, item) => {
    const btn = document.createElement('button');
    btn.innerHTML = '<i class="fas fa-plus"></i> New Recipe';
    btn.onclick = () => newRecipeAction.execute(item);
    container.appendChild(btn);
    return btn;
  },
  execute: () => {
    console.log('Creating new recipe');
  }
};

const importRecipeAction = {
  id: 'import-recipe',
  name: 'Import Recipe',
  icon: 'fas fa-file-import',
  category: 'primary',
  applicableTo: () => true,
  render: (container, item) => {
    const btn = document.createElement('button');
    btn.innerHTML = '<i class="fas fa-file-import"></i> Import Recipe';
    btn.onclick = () => importRecipeAction.execute(item);
    container.appendChild(btn);
    return btn;
  },
  execute: () => {
    console.log('Importing recipe');
  }
};

const manageCategoriesAction = {
  id: 'manage-categories',
  name: 'Manage Categories',
  icon: 'fas fa-tags',
  category: 'utility',
  applicableTo: () => true,
  render: (container, item) => {
    const btn = document.createElement('button');
    btn.innerHTML = '<i class="fas fa-tags"></i> Manage Categories';
    btn.onclick = () => manageCategoriesAction.execute(item);
    container.appendChild(btn);
    return btn;
  },
  execute: () => {
    console.log('Managing categories');
  }
};

// Register actions
ActionRegistry.register(newRecipeAction);
ActionRegistry.register(importRecipeAction);
ActionRegistry.register(manageCategoriesAction);