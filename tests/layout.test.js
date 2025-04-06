/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { fireEvent } from '@testing-library/dom';

describe('Three-column layout with collapsibles', () => {
  let contentGrid, leftColumn, middleColumn, rightColumn;

  beforeEach(() => {
    document.body.innerHTML = '';
    
    // Create the three-column layout
    const layout = createTestLayout();
    contentGrid = layout.contentGrid;
    leftColumn = layout.leftColumn;
    middleColumn = layout.middleColumn;
    rightColumn = layout.rightColumn;
    
    // Create header
    const header = document.createElement('header');
    header.id = 'recipe-header';
    header.setAttribute('role', 'banner');

    const title = document.createElement('h1');
    title.id = 'recipe-title';
    title.textContent = 'DIY All-Purpose Cleaner';

    const removeBtn = document.createElement('button');
    removeBtn.id = 'remove-recipe';
    removeBtn.setAttribute('aria-label', 'Remove recipe');
    removeBtn.textContent = 'Remove';

    header.appendChild(title);
    header.appendChild(removeBtn);
    document.body.insertBefore(header, contentGrid);
    
    // Add content to left column
    leftColumn.innerHTML = `
      <h2>Ingredients</h2>
      <ul id="currentRecipeIngredients">
        <li>White Vinegar</li>
        <li>Baking Soda</li>
        <li>Essential Oil</li>
        <li>Distilled Water</li>
      </ul>
      <div class="quick-stats-container">
        <h3 class="section-title">Quick Stats</h3>
        <div id="quickStats" class="quick-stats">
          <div class="stat-item">
            <span class="stat-label">Preparation Time:</span>
            <span class="stat-value" id="prepTime">5 min</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Shelf Life:</span>
            <span class="stat-value" id="cookTime">3 months</span>
          </div>
        </div>
      </div>
    `;
    
    // Add content to middle column
    middleColumn.innerHTML = `
      <div class="instructions-summary">
        <h3 class="section-title">Instructions Summary</h3>
        <div id="instructionsSummary" class="summary-content">
          <p>Mix ingredients in spray bottle, shake well before use.</p>
        </div>
      </div>
    `;
    
    // Add collapsible sections to middle column
    const middleColumnCollapsibles = document.createElement('div');
    middleColumnCollapsibles.className = 'collapsible-group';
    middleColumnCollapsibles.id = 'middleColumnCollapsibles';
    
    const toggleMiddleColumnBtn = document.createElement('button');
    toggleMiddleColumnBtn.id = 'toggleMiddleColumnBtn';
    toggleMiddleColumnBtn.className = 'btn-expand-collapse';
    toggleMiddleColumnBtn.setAttribute('aria-label', 'Toggle all middle column sections');
    toggleMiddleColumnBtn.innerHTML = `
      <span class="icon">⊕</span>
      <span class="label">Expand All</span>
    `;
    middleColumnCollapsibles.appendChild(toggleMiddleColumnBtn);
    
    // Create and add collapsible sections to middle column
    const detailedInstructions = createTestCollapsible(
      'Detailed Instructions',
      '<ol><li>Add vinegar and water to spray bottle</li><li>Add baking soda slowly</li><li>Add essential oil for fragrance</li><li>Shake well before use</li></ol>',
      'detailed-instructions',
      'blue'
    );
    
    const notes = createTestCollapsible(
      'Notes',
      '<p>For stronger cleaning power, add more vinegar.</p>',
      'notes',
      'blue'
    );
    
    middleColumnCollapsibles.appendChild(detailedInstructions);
    middleColumnCollapsibles.appendChild(notes);
    middleColumn.appendChild(middleColumnCollapsibles);
    
    // Add collapsible sections to right column
    const rightColumnCollapsibles = document.createElement('div');
    rightColumnCollapsibles.className = 'collapsible-group';
    rightColumnCollapsibles.id = 'rightColumnCollapsibles';
    
    const toggleRightColumnBtn = document.createElement('button');
    toggleRightColumnBtn.id = 'toggleRightColumnBtn';
    toggleRightColumnBtn.className = 'btn-expand-collapse';
    toggleRightColumnBtn.setAttribute('aria-label', 'Toggle all right column sections');
    toggleRightColumnBtn.innerHTML = `
      <span class="icon">⊕</span>
      <span class="label">Expand All</span>
    `;
    rightColumnCollapsibles.appendChild(toggleRightColumnBtn);
    
    // Create and add collapsible sections to right column
    const sections = [
      { title: 'Version History', content: '<p>Version 1.0</p>', id: 'version-history', color: 'orange' },
      { title: 'Iteration Management', content: '<p>No iterations yet.</p>', id: 'iteration-management', color: 'orange' },
      { title: 'AI Suggestions', content: '<p>Consider using lemon juice for citrus scent.</p>', id: 'ai-suggestions', color: 'neutral' },
      { title: 'Media', content: '<img src="cleaner.jpg" alt="All-purpose cleaner photo">', id: 'media', color: 'neutral' },
      { title: 'Comments', content: '<p>Works great on kitchen counters!</p>', id: 'comments', color: 'neutral' }
    ];
    
    sections.forEach(sec => {
      const coll = createTestCollapsible(sec.title, sec.content, sec.id, sec.color);
      rightColumnCollapsibles.appendChild(coll);
    });
    
    rightColumn.appendChild(rightColumnCollapsibles);
    
    // Set up toggle functionality for middle column
    toggleMiddleColumnBtn.addEventListener('click', () => {
      const containers = middleColumnCollapsibles.querySelectorAll('.collapsible-container');
      const shouldExpand = toggleMiddleColumnBtn.querySelector('.label').textContent === 'Expand All';
      
      containers.forEach(container => {
        container.setAttribute('aria-expanded', String(shouldExpand));
        const header = container.querySelector('.collapsible-header');
        if (header) header.setAttribute('aria-expanded', String(shouldExpand));
        container.classList.toggle('expanded', shouldExpand);
      });
      
      toggleMiddleColumnBtn.querySelector('.label').textContent = shouldExpand ? 'Collapse All' : 'Expand All';
      toggleMiddleColumnBtn.setAttribute('aria-pressed', String(shouldExpand));
      toggleMiddleColumnBtn.querySelector('.icon').textContent = shouldExpand ? '⊖' : '⊕';
    });
    
    // Set up toggle functionality for right column
    toggleRightColumnBtn.addEventListener('click', () => {
      const containers = rightColumnCollapsibles.querySelectorAll('.collapsible-container');
      const shouldExpand = toggleRightColumnBtn.querySelector('.label').textContent === 'Expand All';
      
      containers.forEach(container => {
        container.setAttribute('aria-expanded', String(shouldExpand));
        const header = container.querySelector('.collapsible-header');
        if (header) header.setAttribute('aria-expanded', String(shouldExpand));
        container.classList.toggle('expanded', shouldExpand);
      });
      
      toggleRightColumnBtn.querySelector('.label').textContent = shouldExpand ? 'Collapse All' : 'Expand All';
      toggleRightColumnBtn.setAttribute('aria-pressed', String(shouldExpand));
      toggleRightColumnBtn.querySelector('.icon').textContent = shouldExpand ? '⊖' : '⊕';
    });
  });

  test('Three-column layout structure is correctly rendered', () => {
    // Test grid container
    expect(contentGrid).toBeInTheDocument();
    expect(contentGrid).toHaveClass('content-grid');
    
    // Test columns
    expect(leftColumn).toBeInTheDocument();
    expect(middleColumn).toBeInTheDocument();
    expect(rightColumn).toBeInTheDocument();
    
    expect(leftColumn).toHaveClass('left-column');
    expect(middleColumn).toHaveClass('middle-column');
    expect(rightColumn).toHaveClass('right-column');
    
    // Test column IDs
    expect(leftColumn).toHaveAttribute('id', 'left-column');
    expect(middleColumn).toHaveAttribute('id', 'middle-column');
    expect(rightColumn).toHaveAttribute('id', 'right-column');
  });

  test('Header contains recipe title and remove button with accessibility attributes', () => {
    const header = document.getElementById('recipe-header');
    expect(header).toBeInTheDocument();
    expect(header).toHaveAttribute('role', 'banner');

    const title = document.getElementById('recipe-title');
    expect(title).toBeInTheDocument();
    expect(title.tagName).toBe('H1');
    expect(title).toHaveTextContent('DIY All-Purpose Cleaner');

    const removeBtn = document.getElementById('remove-recipe');
    expect(removeBtn).toBeInTheDocument();
    expect(removeBtn.tagName).toBe('BUTTON');
    expect(removeBtn).toHaveTextContent('Remove');
    expect(removeBtn).toHaveAttribute('aria-label', 'Remove recipe');
  });

  test('Left column contains ingredients and quick stats', () => {
    // Test ingredients
    const ingredientsList = leftColumn.querySelector('#currentRecipeIngredients');
    expect(ingredientsList).toBeInTheDocument();
    const ingredients = ingredientsList.querySelectorAll('li');
    expect(ingredients.length).toBe(4);
    expect(ingredients[0]).toHaveTextContent('White Vinegar');
    expect(ingredients[1]).toHaveTextContent('Baking Soda');
    expect(ingredients[2]).toHaveTextContent('Essential Oil');
    expect(ingredients[3]).toHaveTextContent('Distilled Water');
    
    // Test quick stats
    const quickStats = leftColumn.querySelector('#quickStats');
    expect(quickStats).toBeInTheDocument();
    expect(quickStats).toHaveClass('quick-stats');
    
    const prepTime = leftColumn.querySelector('#prepTime');
    const cookTime = leftColumn.querySelector('#cookTime');
    expect(prepTime).toBeInTheDocument();
    expect(cookTime).toBeInTheDocument();
    expect(prepTime).toHaveTextContent('5 min');
    expect(cookTime).toHaveTextContent('3 months');
  });

  test('Middle column contains instructions summary and collapsible sections', () => {
    // Test instructions summary
    const instructionsSummary = middleColumn.querySelector('#instructionsSummary');
    expect(instructionsSummary).toBeInTheDocument();
    expect(instructionsSummary).toHaveTextContent('Mix ingredients in spray bottle, shake well before use.');
    
    // Test collapsible group
    const collapsibleGroup = middleColumn.querySelector('#middleColumnCollapsibles');
    expect(collapsibleGroup).toBeInTheDocument();
    expect(collapsibleGroup).toHaveClass('collapsible-group');
    
    // Test toggle button
    const toggleBtn = collapsibleGroup.querySelector('#toggleMiddleColumnBtn');
    expect(toggleBtn).toBeInTheDocument();
    expect(toggleBtn).toHaveClass('btn-expand-collapse');
    expect(toggleBtn).toHaveAttribute('aria-label', 'Toggle all middle column sections');
    
    // Test collapsible sections
    const collapsibles = collapsibleGroup.querySelectorAll('.collapsible-container');
    expect(collapsibles.length).toBe(2);
    
    // Test first collapsible (Detailed Instructions)
    const detailedInstructions = collapsibles[0];
    expect(detailedInstructions.querySelector('.collapsible-header')).toHaveTextContent('Detailed Instructions');
    expect(detailedInstructions).toHaveAttribute('data-color', 'blue');
    expect(detailedInstructions.querySelector('.collapsible-content')).toHaveAttribute('id', 'detailed-instructions-content');
    expect(detailedInstructions.querySelector('ol')).toBeInTheDocument();
    expect(detailedInstructions.querySelectorAll('li').length).toBe(4);
    
    // Test second collapsible (Notes)
    const notes = collapsibles[1];
    expect(notes.querySelector('.collapsible-header')).toHaveTextContent('Notes');
    expect(notes).toHaveAttribute('data-color', 'blue');
    expect(notes.querySelector('.collapsible-content')).toHaveAttribute('id', 'notes-content');
    expect(notes.querySelector('p')).toHaveTextContent('For stronger cleaning power, add more vinegar.');
  });

  test('Right column contains collapsible sections with correct color coding', () => {
    // Test collapsible group
    const collapsibleGroup = rightColumn.querySelector('#rightColumnCollapsibles');
    expect(collapsibleGroup).toBeInTheDocument();
    expect(collapsibleGroup).toHaveClass('collapsible-group');
    
    // Test toggle button
    const toggleBtn = collapsibleGroup.querySelector('#toggleRightColumnBtn');
    expect(toggleBtn).toBeInTheDocument();
    expect(toggleBtn).toHaveClass('btn-expand-collapse');
    expect(toggleBtn).toHaveAttribute('aria-label', 'Toggle all right column sections');
    
    // Test collapsible sections
    const collapsibles = collapsibleGroup.querySelectorAll('.collapsible-container');
    expect(collapsibles.length).toBe(5);
    
    // Test color coding
    const orangeCollapsibles = Array.from(collapsibles).filter(c => c.getAttribute('data-color') === 'orange');
    const neutralCollapsibles = Array.from(collapsibles).filter(c => c.getAttribute('data-color') === 'neutral');
    
    expect(orangeCollapsibles.length).toBe(2);
    expect(neutralCollapsibles.length).toBe(3);
    
    // Test specific sections
    const versionHistory = collapsibleGroup.querySelector('.collapsible-container[data-color="orange"]:nth-child(2)');
    const aiSuggestions = collapsibleGroup.querySelector('.collapsible-container[data-color="neutral"]:nth-child(4)');
    
    expect(versionHistory.querySelector('.collapsible-header')).toHaveTextContent('Version History');
    expect(aiSuggestions.querySelector('.collapsible-header')).toHaveTextContent('AI Suggestions');
  });

  test('Toggle buttons expand and collapse all sections in their group', () => {
    // Test middle column toggle
    const middleToggleBtn = document.getElementById('toggleMiddleColumnBtn');
    const middleCollapsibles = middleColumn.querySelectorAll('.collapsible-container');
    
    // Initially all collapsed
    middleCollapsibles.forEach(c => {
      expect(c).toHaveAttribute('aria-expanded', 'false');
    });
    
    // Click to expand all
    fireEvent.click(middleToggleBtn);
    
    // All should be expanded
    middleCollapsibles.forEach(c => {
      expect(c).toHaveAttribute('aria-expanded', 'true');
    });
    expect(middleToggleBtn.querySelector('.label')).toHaveTextContent('Collapse All');
    expect(middleToggleBtn.querySelector('.icon')).toHaveTextContent('⊖');
    
    // Click to collapse all
    fireEvent.click(middleToggleBtn);
    
    // All should be collapsed
    middleCollapsibles.forEach(c => {
      expect(c).toHaveAttribute('aria-expanded', 'false');
    });
    expect(middleToggleBtn.querySelector('.label')).toHaveTextContent('Expand All');
    expect(middleToggleBtn.querySelector('.icon')).toHaveTextContent('⊕');
    
    // Test right column toggle
    const rightToggleBtn = document.getElementById('toggleRightColumnBtn');
    const rightCollapsibles = rightColumn.querySelectorAll('.collapsible-container');
    
    // Click to expand all
    fireEvent.click(rightToggleBtn);
    
    // All should be expanded
    rightCollapsibles.forEach(c => {
      expect(c).toHaveAttribute('aria-expanded', 'true');
    });
    
    // Click to collapse all
    fireEvent.click(rightToggleBtn);
    
    // All should be collapsed
    rightCollapsibles.forEach(c => {
      expect(c).toHaveAttribute('aria-expanded', 'false');
    });
  });

  test('Individual collapsible sections in each column can be toggled independently', () => {
    // Test middle column collapsible
    const detailedInstructions = middleColumn.querySelector('.collapsible-container:nth-child(2)');
    const detailedHeader = detailedInstructions.querySelector('.collapsible-header');
    
    // Initially collapsed
    expect(detailedInstructions).toHaveAttribute('aria-expanded', 'false');
    
    // Click to expand
    fireEvent.click(detailedHeader);
    expect(detailedInstructions).toHaveAttribute('aria-expanded', 'true');
    
    // Click to collapse
    fireEvent.click(detailedHeader);
    expect(detailedInstructions).toHaveAttribute('aria-expanded', 'false');
    
    // Test right column collapsible
    const versionHistory = rightColumn.querySelector('.collapsible-container:nth-child(2)');
    const versionHeader = versionHistory.querySelector('.collapsible-header');
    
    // Initially collapsed
    expect(versionHistory).toHaveAttribute('aria-expanded', 'false');
    
    // Click to expand
    fireEvent.click(versionHeader);
    expect(versionHistory).toHaveAttribute('aria-expanded', 'true');
    
    // Click to collapse
    fireEvent.click(versionHeader);
    expect(versionHistory).toHaveAttribute('aria-expanded', 'false');
  });

  test('Simulate responsive layout changes', () => {
    // Default grid layout
    expect(contentGrid.style.gridTemplateColumns).toBe('');
    
    // Simulate narrow screen by changing width and applying a class
    contentGrid.style.width = '400px';
    contentGrid.classList.add('narrow');
    
    // Apply media query effect manually (since JSDOM doesn't process media queries)
    contentGrid.style.gridTemplateColumns = '1fr';
    
    expect(contentGrid.classList.contains('narrow')).toBe(true);
    expect(contentGrid.style.gridTemplateColumns).toBe('1fr');
    
    // Restore normal layout
    contentGrid.classList.remove('narrow');
    contentGrid.style.gridTemplateColumns = '1fr 2fr 1fr';
    contentGrid.style.width = '';
    
    expect(contentGrid.classList.contains('narrow')).toBe(false);
    expect(contentGrid.style.gridTemplateColumns).toBe('1fr 2fr 1fr');
  });
});