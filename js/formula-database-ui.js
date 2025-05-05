// formula-database-ui.js - Terminal-styled Formula Database UI
// Adapts recipe functionality with retro sci-fi terminal styling

import { showNotification } from './ui-utils.js';
import { safeSetText } from './ui-utils.js';

// Import MCP hooks if available
let mcpMemory;
try {
  if (window.MemoryMCP) {
    mcpMemory = window.MemoryMCP;
  }
} catch (err) {
  console.warn('Memory MCP not available, using local fallback');
}

// Terminal UI helper functions
function createTerminalElement(type, className, content = '') {
  const element = document.createElement(type);
  element.className = `terminal-ui ${className}`;
  
  // Apply CRT effect class
  element.classList.add('crt-effect');
  
  if (content) {
    element.innerHTML = content;
  }
  return element;
}

function typewriterEffect(element, text, speed = 5) {
  let i = 0;
  element.textContent = '';
  const timer = setInterval(() => {
    if (i < text.length) {
      element.textContent += text.charAt(i);
      i++;
    } else {
      clearInterval(timer);
      // Add cursor blink effect after typing completes
      const cursor = document.createElement('span');
      cursor.className = 'terminal-cursor';
      cursor.textContent = '_';
      element.appendChild(cursor);
    }
  }, speed);
}

/**
 * Create terminal-styled header with sci-fi decorations
 */
function createTerminalHeader(title, containerClass = 'terminal-header') {
  const header = createTerminalElement('div', containerClass);
  
  const leftDecoration = createTerminalElement('div', 'terminal-decoration');
  leftDecoration.innerHTML = '[//]';
  
  const centerTitle = createTerminalElement('h2', 'terminal-title');
  centerTitle.textContent = title;
  
  const rightDecoration = createTerminalElement('div', 'terminal-decoration');
  rightDecoration.innerHTML = '[//]';
  
  header.appendChild(leftDecoration);
  header.appendChild(centerTitle);
  header.appendChild(rightDecoration);
  
  return header;
}

/**
 * Render the list of formulas (recipes) in the navigation matrix
 */
export function renderFormulasMatrix(formulas) {
  const formulaList = document.getElementById('formulaList') || document.getElementById('recipeList');
  if (!formulaList) return;

  // Clear previous content
  formulaList.innerHTML = '';
  
  // Add terminal matrix header
  const matrixHeader = createTerminalHeader('FORMULA DATABASE', 'terminal-matrix-header');
  formulaList.appendChild(matrixHeader);
  
  // Create formula entries container
  const entriesContainer = createTerminalElement('ul', 'terminal-matrix-entries');
  
  // Add formulas
  formulas.forEach((formula, index) => {
    const li = createTerminalElement('li', 'matrix-entry');
    li.dataset.id = formula.id;
    
    // Generate index number with leading zeros for sci-fi effect
    const indexNum = (index + 1).toString().padStart(3, '0');
    
    // Create entry with formula code and name
    li.innerHTML = `
      <span class="entry-index">${indexNum}</span>
      <span class="entry-name">${formula.name || 'UNTITLED FORMULA'}</span>
      <span class="entry-indicator">►</span>
    `;
    
    entriesContainer.appendChild(li);
  });
  
  formulaList.appendChild(entriesContainer);
  
  // Add status line
  const statusLine = createTerminalElement('div', 'terminal-status-line');
  statusLine.textContent = `${formulas.length} FORMULAS INDEXED • SYSTEM READY`;
  formulaList.appendChild(statusLine);
}

/**
 * Initialize formula list click handling
 */
export function initFormulaMatrixUI() {
  const formulaList = document.getElementById('formulaList') || document.getElementById('recipeList');
  if (!formulaList) return;

  formulaList.addEventListener('click', async (event) => {
    const targetLi = event.target.closest('.matrix-entry');
    if (targetLi && targetLi.dataset.id) {
      const formulaId = targetLi.dataset.id;

      // Update selected state with terminal highlighting
      formulaList.querySelectorAll('.matrix-entry').forEach(li => {
        li.classList.remove('selected');
        li.querySelector('.entry-indicator')?.textContent = '►';
      });
      
      targetLi.classList.add('selected');
      const indicator = targetLi.querySelector('.entry-indicator');
      if (indicator) indicator.textContent = '▶';

      // Show loading effect
      const workspace = document.getElementById('formulaWorkspace') || document.getElementById('recipeDetailsView');
      if (workspace) {
        workspace.innerHTML = '';
        const loadingTerminal = createTerminalElement('div', 'terminal-loading');
        loadingTerminal.innerHTML = 'ACCESSING FORMULA DATABASE...';
        workspace.appendChild(loadingTerminal);
        
        // Artificial delay for terminal effect
        await new Promise(resolve => setTimeout(resolve, 800));
      }

      // Show formula details with terminal styling
      await showFormulaDetails(formulaId);

      // Update action panel
      const actionPanel = document.getElementById('actionPanel') || document.getElementById('right-column');
      if (actionPanel && window.ActionRenderer) {
        actionPanel.innerHTML = '';
        const actionHeader = createTerminalHeader('ACTION MATRIX', 'terminal-action-header');
        actionPanel.appendChild(actionHeader);
        
        // Create action container
        const actionContainer = createTerminalElement('div', 'terminal-action-container');
        actionPanel.appendChild(actionContainer);
        
        // Render actions using the action renderer
        window.ActionRenderer.render(actionContainer, window.currentFormula || window.currentRecipe);
      }
    }
  });
}

/**
 * Render the elements (ingredients) table for a formula
 */
export function renderFormulaElementsTable(elements) {
  const tableContainer = document.getElementById('formulaElementsTable') || document.getElementById('recipeIngredientsTable');
  if (!tableContainer) return;
  
  // Clear previous content
  tableContainer.innerHTML = '';
  
  // Create terminal-styled table
  const table = createTerminalElement('table', 'terminal-table elements-table');
  
  // Create header
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  ['ELEMENT ID', 'QUANTITY', 'UNIT', 'PROPERTIES'].forEach(header => {
    const th = document.createElement('th');
    th.textContent = header;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);
  
  // Create body
  const tbody = document.createElement('tbody');
  
  elements.forEach((element, index) => {
    const row = document.createElement('tr');
    
    // Element name cell with sci-fi styling
    const nameCell = document.createElement('td');
    const elementCode = `E-${index.toString().padStart(3, '0')}`;
    nameCell.innerHTML = `<span class="element-code">${elementCode}</span> ${element.name || ''}`;
    row.appendChild(nameCell);
    
    // Quantity cell
    const qtyCell = document.createElement('td');
    qtyCell.textContent = element.quantity || '';
    row.appendChild(qtyCell);
    
    // Unit cell
    const unitCell = document.createElement('td');
    unitCell.textContent = element.unit || '';
    row.appendChild(unitCell);
    
    // Notes/properties cell
    const notesCell = document.createElement('td');
    notesCell.textContent = element.notes || '';
    row.appendChild(notesCell);
    
    tbody.appendChild(row);
  });
  
  table.appendChild(tbody);
  tableContainer.appendChild(table);
  
  // Add element count summary
  const elementCount = createTerminalElement('div', 'terminal-element-count');
  elementCount.textContent = `TOTAL ELEMENTS: ${elements.length}`;
  tableContainer.appendChild(elementCount);
}

/**
 * Update formula statistics UI with terminal styling
 */
export function updateFormulaStats(formula) {
  // Create or update stats panel
  const statsPanel = document.getElementById('formulaStats') || document.getElementById('recipeStats');
  if (!statsPanel) return;
  
  // Clear previous content
  statsPanel.innerHTML = '';
  
  // Create terminal-styled stats panel
  const statsContainer = createTerminalElement('div', 'terminal-stats-panel');
  
  // Stats header
  const statsHeader = createTerminalElement('div', 'terminal-stats-header');
  statsHeader.textContent = 'FORMULA ANALYSIS';
  statsContainer.appendChild(statsHeader);
  
  // Stats grid
  const statsGrid = createTerminalElement('div', 'terminal-stats-grid');
  
  // Define stats to display
  const statsData = [
    { label: 'ENERGY VALUE', value: formula.calories, unit: 'KCAL' },
    { label: 'PROTEIN', value: formula.protein, unit: 'G' },
    { label: 'LIPIDS', value: formula.fat, unit: 'G' },
    { label: 'CARBOHYDRATES', value: formula.carbs, unit: 'G' }
  ];
  
  // Add each stat to the grid
  statsData.forEach(stat => {
    const statItem = createTerminalElement('div', 'terminal-stat-item');
    
    const statLabel = createTerminalElement('div', 'terminal-stat-label');
    statLabel.textContent = stat.label;
    
    const statValue = createTerminalElement('div', 'terminal-stat-value');
    statValue.textContent = stat.value ? `${stat.value} ${stat.unit}` : 'N/A';
    
    statItem.appendChild(statLabel);
    statItem.appendChild(statValue);
    statsGrid.appendChild(statItem);
  });
  
  statsContainer.appendChild(statsGrid);
  statsPanel.appendChild(statsContainer);
}

/**
 * Show detailed info for a formula (recipe) by ID with terminal styling
 */
export async function showFormulaDetails(formulaId) {
  try {
    // Fetch formula details via API or cache
    const formula = window.recipesCache.find(r => r.id === formulaId);
    if (!formula) {
      showNotification('FORMULA NOT FOUND IN DATABASE', 'error');
      return;
    }
    
    // Store current formula for action context
    window.currentFormula = formula;
    // Keep compatibility with existing code
    window.currentRecipe = formula;
    
    // Get workspace container
    const workspace = document.getElementById('formulaWorkspace') || document.getElementById('recipeDetailsView');
    if (!workspace) return;
    
    // Clear previous content
    workspace.innerHTML = '';
    
    // Create terminal-styled workspace with sci-fi elements
    
    // 1. Formula header section
    const headerSection = createTerminalElement('div', 'terminal-formula-header');
    
    // Formula ID and title
    const idBlock = createTerminalElement('div', 'formula-id-block');
    idBlock.innerHTML = `FORMULA ID: <span class="formula-id">${formula.id.substring(0, 8)}</span>`;
    
    const titleBlock = createTerminalElement('h1', 'formula-title');
    titleBlock.textContent = formula.name || 'UNTITLED FORMULA';
    
    // Add typewriter effect to title for sci-fi feel
    setTimeout(() => {
      titleBlock.textContent = '';
      typewriterEffect(titleBlock, formula.name || 'UNTITLED FORMULA', 10);
    }, 100);
    
    headerSection.appendChild(idBlock);
    headerSection.appendChild(titleBlock);
    workspace.appendChild(headerSection);
    
    // 2. Formula description section
    const descriptionSection = createTerminalElement('div', 'terminal-formula-description');
    
    const descriptionHeader = createTerminalElement('div', 'section-header');
    descriptionHeader.textContent = 'FORMULA DESCRIPTION';
    
    const descriptionContent = createTerminalElement('div', 'section-content description-content');
    descriptionContent.textContent = formula.description || 'NO DESCRIPTION AVAILABLE';
    
    descriptionSection.appendChild(descriptionHeader);
    descriptionSection.appendChild(descriptionContent);
    workspace.appendChild(descriptionSection);
    
    // 3. Formula stats panel
    const statsPanel = createTerminalElement('div', 'terminal-formula-stats');
    statsPanel.id = 'formulaStats';
    workspace.appendChild(statsPanel);
    updateFormulaStats(formula);
    
    // 4. Formula elements (ingredients) section
    const elementsSection = createTerminalElement('div', 'terminal-formula-elements');
    
    const elementsHeader = createTerminalElement('div', 'section-header');
    elementsHeader.textContent = 'REQUIRED ELEMENTS';
    
    const elementsTable = createTerminalElement('div', 'elements-table-container');
    elementsTable.id = 'formulaElementsTable';
    
    elementsSection.appendChild(elementsHeader);
    elementsSection.appendChild(elementsTable);
    workspace.appendChild(elementsSection);
    
    renderFormulaElementsTable(formula.ingredients || []);
    
    // 5. Formula notes section
    const notesSection = createTerminalElement('div', 'terminal-formula-notes');
    
    const notesHeader = createTerminalElement('div', 'section-header');
    notesHeader.textContent = 'LABORATORY NOTES';
    
    const notesContent = createTerminalElement('div', 'section-content notes-content');
    notesContent.textContent = formula.notes || 'NO ADDITIONAL NOTES';
    
    notesSection.appendChild(notesHeader);
    notesSection.appendChild(notesContent);
    workspace.appendChild(notesSection);
    
    // 6. Terminal status line
    const statusLine = createTerminalElement('div', 'terminal-workspace-status');
    statusLine.textContent = 'FORMULA DATA LOADED // SYSTEM READY';
    workspace.appendChild(statusLine);

    // Update Memory MCP if available
    if (mcpMemory) {
      mcpMemory.store('activeFormula', formula.id);
      mcpMemory.store('lastAction', 'viewed formula details');
    }
    
  } catch (err) {
    console.error('Error loading formula details:', err);
    showNotification(`DATABASE ERROR: ${err.message}`, 'error');
  }
}

/**
 * Initialize the Formula Database UI
 * This replaces the initUI function for recipes with terminal-styled version
 */
export function initFormulaDatabaseUI() {
  console.log('Initializing Formula Database Terminal Interface');
  
  // Replace the recipe UI with formula database UI
  const main = document.querySelector('main');
  if (!main) return;
  
  // Add terminal-ui class to body for global styling
  document.body.classList.add('terminal-ui-active');
  
  // Transform existing recipe selectors to formula database components
  const recipeList = document.getElementById('recipeList');
  if (recipeList) {
    recipeList.id = 'formulaList';
    recipeList.className = 'terminal-matrix';
  }
  
  const recipeDetails = document.getElementById('recipeDetailsView');
  if (recipeDetails) {
    recipeDetails.id = 'formulaWorkspace';
    recipeDetails.className = 'terminal-workspace';
  }
  
  const rightColumn = document.getElementById('right-column');
  if (rightColumn) {
    rightColumn.id = 'actionPanel';
    rightColumn.className = 'terminal-action-panel';
  }
  
  // Initialize formula matrix UI and replace recipe list handler
  initFormulaMatrixUI();
  
  // Log to Memory MCP if available
  if (mcpMemory) {
    mcpMemory.store('uiState', 'formula database initialized');
  }
}

/**
 * Load formulas from API or cache and render them in the terminal UI
 */
export async function loadAndRenderFormulas() {
  try {
    // Use existing recipes cache if available
    if (window.recipesCache && Array.isArray(window.recipesCache)) {
      renderFormulasMatrix(window.recipesCache);
      
      // Log in MCP Memory if available
      if (mcpMemory) {
        mcpMemory.store('formulaCount', window.recipesCache.length);
      }
      return;
    }
    
    // If no cache available, show empty state
    renderFormulasMatrix([]);
    showNotification('DATABASE CONNECTION ERROR: NO FORMULAS FOUND', 'error');
  } catch (err) {
    console.error('Error loading formulas:', err);
    showNotification(`DATABASE ERROR: ${err.message}`, 'error');
  }
}