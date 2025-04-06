import { ActionRegistry } from '../action-registry.js';

const editRecipeDetailsAction = {
  id: 'edit-recipe-details',
  name: 'Edit Recipe Details',
  icon: 'fas fa-edit',
  category: 'primary',
  applicableTo: (item) => item.type === 'recipe',
  render: (container, item) => {
    const btn = document.createElement('button');
    btn.innerHTML = '<i class="fas fa-edit"></i> Edit Details';
    btn.onclick = () => editRecipeDetailsAction.execute(item);
    container.appendChild(btn);
    return btn;
  },
  execute: (item) => {
    console.log('Editing recipe details for', item);
  }
};

const editIngredientsAction = {
  id: 'edit-ingredients',
  name: 'Edit Ingredients',
  icon: 'fas fa-carrot',
  category: 'primary',
  applicableTo: (item) => item.type === 'recipe',
  render: (container, item) => {
    const btn = document.createElement('button');
    btn.innerHTML = '<i class="fas fa-carrot"></i> Edit Ingredients';
    btn.onclick = () => editIngredientsAction.execute(item);
    container.appendChild(btn);
    return btn;
  },
  execute: (item) => {
    console.log('Editing ingredients for', item);
  }
};

const adjustVolumeAction = {
  id: 'adjust-volume',
  name: 'Adjust Volume',
  icon: 'fas fa-balance-scale',
  category: 'primary',
  applicableTo: (item) => item.type === 'recipe',
  render: (container, item) => {
    const btn = document.createElement('button');
    btn.innerHTML = '<i class="fas fa-balance-scale"></i> Adjust Volume';
    btn.onclick = () => adjustVolumeAction.execute(item);
    container.appendChild(btn);
    return btn;
  },
  execute: (item) => {
    console.log('Adjusting volume for', item);
  }
};

const editInstructionsAction = {
  id: 'edit-instructions',
  name: 'Edit Instructions',
  icon: 'fas fa-list-ol',
  category: 'primary',
  applicableTo: (item) => item.type === 'recipe',
  render: (container, item) => {
    const btn = document.createElement('button');
    btn.innerHTML = '<i class="fas fa-list-ol"></i> Edit Instructions';
    btn.onclick = () => editInstructionsAction.execute(item);
    container.appendChild(btn);
    return btn;
  },
  execute: (item) => {
    console.log('Editing instructions for', item);
  }
};

const editNotesAction = {
  id: 'edit-notes',
  name: 'Edit Notes',
  icon: 'fas fa-sticky-note',
  category: 'primary',
  applicableTo: (item) => item.type === 'recipe',
  render: (container, item) => {
    const btn = document.createElement('button');
    btn.innerHTML = '<i class="fas fa-sticky-note"></i> Edit Notes';
    btn.onclick = () => editNotesAction.execute(item);
    container.appendChild(btn);
    return btn;
  },
  execute: (item) => {
    console.log('Editing notes for', item);
  }
};

// Register actions
ActionRegistry.register(editRecipeDetailsAction);
ActionRegistry.register(editIngredientsAction);
ActionRegistry.register(adjustVolumeAction);
ActionRegistry.register(editInstructionsAction);
ActionRegistry.register(editNotesAction);