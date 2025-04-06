// ActionRegistry is a default export; import it directly, not as a named import
import ActionRegistry from '../action-registry.js';

const printRecipeAction = {
  id: 'print-recipe',
  name: 'Print Recipe',
  icon: 'fas fa-print',
  category: 'utility',
  applicableTo: (item) => item.type === 'recipe',
  render: (container, item) => {
    const btn = document.createElement('button');
    btn.innerHTML = '<i class="fas fa-print"></i> Print';
    btn.onclick = () => printRecipeAction.execute(item);
    container.appendChild(btn);
    return btn;
  },
  execute: (item) => {
    console.log('Printing recipe', item);
    window.print();
  }
};

const exportRecipeAction = {
  id: 'export-recipe',
  name: 'Export Recipe',
  icon: 'fas fa-file-export',
  category: 'utility',
  applicableTo: (item) => item.type === 'recipe',
  render: (container, item) => {
    const btn = document.createElement('button');
    btn.innerHTML = '<i class="fas fa-file-export"></i> Export';
    btn.onclick = () => exportRecipeAction.execute(item);
    container.appendChild(btn);
    return btn;
  },
  execute: (item) => {
    console.log('Exporting recipe', item);
  }
};

const generateShoppingListAction = {
  id: 'generate-shopping-list',
  name: 'Generate Shopping List',
  icon: 'fas fa-shopping-cart',
  category: 'utility',
  applicableTo: (item) => item.type === 'recipe',
  render: (container, item) => {
    const btn = document.createElement('button');
    btn.innerHTML = '<i class="fas fa-shopping-cart"></i> Shopping List';
    btn.onclick = () => generateShoppingListAction.execute(item);
    container.appendChild(btn);
    return btn;
  },
  execute: (item) => {
    console.log('Generating shopping list for', item);
  }
};

const calculateCostsAction = {
  id: 'calculate-costs',
  name: 'Calculate Costs',
  icon: 'fas fa-dollar-sign',
  category: 'utility',
  applicableTo: (item) => item.type === 'recipe',
  render: (container, item) => {
    const btn = document.createElement('button');
    btn.innerHTML = '<i class="fas fa-dollar-sign"></i> Calculate Costs';
    btn.onclick = () => calculateCostsAction.execute(item);
    container.appendChild(btn);
    return btn;
  },
  execute: (item) => {
    console.log('Calculating costs for', item);
  }
};

// Register actions
ActionRegistry.register(printRecipeAction);
ActionRegistry.register(exportRecipeAction);
ActionRegistry.register(generateShoppingListAction);
ActionRegistry.register(calculateCostsAction);