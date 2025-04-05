/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { fireEvent } from '@testing-library/dom';

// Minimal helper to create a collapsible section (copied from collapsible.test.js)
function createCollapsibleSection(title, contentHtml, idSuffix) {
  const container = document.createElement('div');
  container.className = 'collapsible-container';
  container.setAttribute('aria-expanded', 'false');

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
}

describe('Three-column layout with collapsibles', () => {
  let leftCol, middleCol, rightCol;

  beforeEach(() => {
    document.body.innerHTML = '';

    // Create header
    const header = document.createElement('header');
    header.id = 'recipe-header';
    header.setAttribute('role', 'banner');

    const title = document.createElement('h1');
    title.id = 'recipe-title';
    title.textContent = 'Delicious Pancakes';

    const removeBtn = document.createElement('button');
    removeBtn.id = 'remove-recipe';
    removeBtn.setAttribute('aria-label', 'Remove recipe');
    removeBtn.textContent = 'Remove';

    header.appendChild(title);
    header.appendChild(removeBtn);

    document.body.appendChild(header);

    const container = document.createElement('div');
    container.id = 'main-container';
    container.style.display = 'flex';

    // Left column with ingredients list
    leftCol = document.createElement('aside');
    leftCol.id = 'left-column';
    leftCol.setAttribute('role', 'complementary');
    leftCol.innerHTML = `
      <h2>Ingredients</h2>
      <ul>
        <li>Flour</li>
        <li>Milk</li>
        <li>Eggs</li>
        <li>Sugar</li>
      </ul>
    `;

    // Middle column with description and instructions
    middleCol = document.createElement('main');
    middleCol.id = 'middle-column';
    middleCol.setAttribute('role', 'main');
    middleCol.innerHTML = `
      <h2>Description</h2>
      <p>Fluffy pancakes perfect for breakfast.</p>
      <h2>Instructions</h2>
      <ol>
        <li>Mix ingredients</li>
        <li>Cook on skillet</li>
        <li>Serve warm</li>
      </ol>
    `;

    // Right column with multiple collapsible sections
    rightCol = document.createElement('aside');
    rightCol.id = 'right-column';
    rightCol.setAttribute('role', 'complementary');

    const sections = [
      { title: 'Notes', content: '<p>Try adding blueberries.</p>', id: 'notes' },
      { title: 'Nutrition Info', content: '<p>Calories: 200</p>', id: 'nutrition' },
      { title: 'Media', content: '<img src="pancakes.jpg" alt="Pancakes photo">', id: 'media' },
      { title: 'Comments', content: '<p>Great recipe!</p>', id: 'comments' },
      { title: 'AI Suggestions', content: '<p>Consider using almond milk.</p>', id: 'ai' },
      { title: 'Iteration Table', content: '<table><tr><td>v1</td><td>Initial</td></tr></table>', id: 'iterations' }
    ];

    sections.forEach(sec => {
      const coll = createCollapsibleSection(sec.title, sec.content, sec.id);
      rightCol.appendChild(coll);
    });

    container.appendChild(leftCol);
    container.appendChild(middleCol);
    container.appendChild(rightCol);

    document.body.appendChild(container);
  });

  test('Header contains recipe title and remove button with accessibility attributes', () => {
    const header = document.getElementById('recipe-header');
    expect(header).toBeInTheDocument();
    expect(header).toHaveAttribute('role', 'banner');

    const title = document.getElementById('recipe-title');
    expect(title).toBeInTheDocument();
    expect(title.tagName).toBe('H1');
    expect(title).toHaveTextContent('Delicious Pancakes');

    const removeBtn = document.getElementById('remove-recipe');
    expect(removeBtn).toBeInTheDocument();
    expect(removeBtn.tagName).toBe('BUTTON');
    expect(removeBtn).toHaveTextContent('Remove');
    expect(removeBtn).toHaveAttribute('aria-label', 'Remove recipe');
  });

  test('Columns are inserted with correct roles and expected content', () => {
    expect(leftCol).toBeInTheDocument();
    expect(middleCol).toBeInTheDocument();
    expect(rightCol).toBeInTheDocument();

    expect(leftCol).toHaveAttribute('role', 'complementary');
    expect(middleCol).toHaveAttribute('role', 'main');
    expect(rightCol).toHaveAttribute('role', 'complementary');

    expect(leftCol).toHaveTextContent('Ingredients');
    expect(leftCol).toHaveTextContent('Flour');
    expect(leftCol).toHaveTextContent('Milk');
    expect(leftCol).toHaveTextContent('Eggs');
    expect(leftCol).toHaveTextContent('Sugar');

    expect(middleCol).toHaveTextContent('Description');
    expect(middleCol).toHaveTextContent('Fluffy pancakes perfect for breakfast.');
    expect(middleCol).toHaveTextContent('Instructions');
    expect(middleCol).toHaveTextContent('Mix ingredients');
    expect(middleCol).toHaveTextContent('Cook on skillet');
    expect(middleCol).toHaveTextContent('Serve warm');
  });

  test('Right column contains all collapsible sections with correct initial state and accessibility', () => {
    const collapsibles = rightCol.querySelectorAll('.collapsible-container');
    expect(collapsibles.length).toBe(6);

    collapsibles.forEach(c => {
      expect(c).toHaveAttribute('aria-expanded', 'false');
      const header = c.querySelector('.collapsible-header');
      expect(header).toHaveAttribute('aria-expanded', 'false');
      expect(header).toHaveAttribute('aria-controls');
      expect(header).toHaveAttribute('type', 'button');
    });

    const titles = Array.from(collapsibles).map(c => c.querySelector('.collapsible-header span').textContent.trim());
    expect(titles).toEqual(expect.arrayContaining([
      'Notes',
      'Nutrition Info',
      'Media',
      'Comments',
      'AI Suggestions',
      'Iteration Table'
    ]));
  });

  test('Collapsible sections in right column expand and collapse on click', () => {
    const collapsibles = rightCol.querySelectorAll('.collapsible-container');
    const first = collapsibles[0];
    const header = first.querySelector('.collapsible-header');

    // Initially collapsed
    expect(first).not.toHaveClass('expanded');
    expect(first).toHaveAttribute('aria-expanded', 'false');

    // Click to expand
    fireEvent.click(header);
    expect(first).toHaveClass('expanded');
    expect(first).toHaveAttribute('aria-expanded', 'true');
    expect(header).toHaveAttribute('aria-expanded', 'true');

    // Click again to collapse
    fireEvent.click(header);
    expect(first).not.toHaveClass('expanded');
    expect(first).toHaveAttribute('aria-expanded', 'false');
    expect(header).toHaveAttribute('aria-expanded', 'false');
  });

  test('Collapsible sections support keyboard navigation', () => {
    const collapsibles = rightCol.querySelectorAll('.collapsible-container');
    const header = collapsibles[1].querySelector('.collapsible-header');

    fireEvent.keyDown(header, { key: 'Enter' });
    expect(collapsibles[1]).toHaveClass('expanded');

    fireEvent.keyDown(header, { key: ' ' });
    expect(collapsibles[1]).not.toHaveClass('expanded');
  });

  test('Simulate responsive layout changes (basic)', () => {
    const container = document.getElementById('main-container');

    // Default flex layout
    expect(container.style.display).toBe('flex');

    // Simulate narrow screen by changing width and applying a class
    container.style.width = '400px';
    container.classList.add('narrow');

    expect(container.classList.contains('narrow')).toBe(true);

    // In real app, CSS media queries would handle layout change
    // Here, just verify class toggle works
    container.classList.remove('narrow');
    expect(container.classList.contains('narrow')).toBe(false);
  });
});