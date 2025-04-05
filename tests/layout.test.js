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

    const container = document.createElement('div');
    container.id = 'main-container';
    container.style.display = 'flex';

    leftCol = document.createElement('aside');
    leftCol.id = 'left-column';
    leftCol.setAttribute('role', 'complementary');
    leftCol.innerHTML = '<p>Left sidebar content</p>';

    middleCol = document.createElement('main');
    middleCol.id = 'middle-column';
    middleCol.setAttribute('role', 'main');
    middleCol.innerHTML = '<h1>Main content area</h1>';

    rightCol = document.createElement('aside');
    rightCol.id = 'right-column';
    rightCol.setAttribute('role', 'complementary');

    // Add collapsible sections inside right column
    const coll1 = createCollapsibleSection('Nutrition Info', '<p>Calories: 200</p>', 'nutrition');
    const coll2 = createCollapsibleSection('Tips', '<p>Use fresh herbs</p>', 'tips');

    rightCol.appendChild(coll1);
    rightCol.appendChild(coll2);

    container.appendChild(leftCol);
    container.appendChild(middleCol);
    container.appendChild(rightCol);

    document.body.appendChild(container);
  });

  test('Columns are inserted with correct roles and content', () => {
    expect(leftCol).toBeInTheDocument();
    expect(middleCol).toBeInTheDocument();
    expect(rightCol).toBeInTheDocument();

    expect(leftCol).toHaveAttribute('role', 'complementary');
    expect(middleCol).toHaveAttribute('role', 'main');
    expect(rightCol).toHaveAttribute('role', 'complementary');

    expect(leftCol).toHaveTextContent('Left sidebar content');
    expect(middleCol).toHaveTextContent('Main content area');
  });

  test('Right column contains collapsible sections with correct initial state', () => {
    const collapsibles = rightCol.querySelectorAll('.collapsible-container');
    expect(collapsibles.length).toBe(2);

    collapsibles.forEach(c => {
      expect(c).toHaveAttribute('aria-expanded', 'false');
      const header = c.querySelector('.collapsible-header');
      expect(header).toHaveAttribute('aria-expanded', 'false');
      expect(header).toHaveAttribute('aria-controls');
    });
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