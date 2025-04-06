// Set up JSDOM environment properly
window.showNotification = jest.fn();
window.alert = jest.fn();
window.confirm = jest.fn(() => true); // Default to confirming dialogs

// Helper function to create a collapsible section for testing
global.createTestCollapsible = (title, contentHtml, idSuffix, colorType = 'neutral') => {
  const container = document.createElement('div');
  container.className = 'collapsible-container';
  container.setAttribute('aria-expanded', 'false');
  container.setAttribute('data-color', colorType);

  const header = document.createElement('button');
  header.type = 'button';
  header.className = 'collapsible-header';
  header.setAttribute('aria-controls', `${idSuffix}-content`);
  header.setAttribute('aria-expanded', 'false');
  header.innerHTML = `
    <span>${title}</span>
    <span class="collapsible-icon">&#9654;</span>
  `;

  const content = document.createElement('div');
  content.className = 'collapsible-content';
  content.id = `${idSuffix}-content`;
  content.innerHTML = contentHtml;

  header.addEventListener('click', () => {
    const expanded = container.getAttribute('aria-expanded') === 'true';
    container.setAttribute('aria-expanded', String(!expanded));
    header.setAttribute('aria-expanded', String(!expanded));
    container.classList.toggle('expanded', !expanded);
  });

  header.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      header.click();
    }
  });

  container.appendChild(header);
  container.appendChild(content);
  return container;
};

// Helper function to create a three-column layout for testing
global.createTestLayout = () => {
  const contentGrid = document.createElement('div');
  contentGrid.className = 'content-grid';
  
  const leftColumn = document.createElement('div');
  leftColumn.className = 'left-column';
  leftColumn.id = 'left-column';
  
  const middleColumn = document.createElement('div');
  middleColumn.className = 'middle-column';
  middleColumn.id = 'middle-column';
  
  const rightColumn = document.createElement('div');
  rightColumn.className = 'right-column';
  rightColumn.id = 'right-column';
  
  contentGrid.appendChild(leftColumn);
  contentGrid.appendChild(middleColumn);
  contentGrid.appendChild(rightColumn);
  
  document.body.appendChild(contentGrid);
  
  return { contentGrid, leftColumn, middleColumn, rightColumn };
};