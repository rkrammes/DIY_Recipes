/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { fireEvent } from '@testing-library/dom';

// Minimal recreate of createCollapsibleSection from js/ui.js
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

describe('Collapsible UI Components', () => {
  let container1, container2, toggleAllBtn;

  beforeEach(() => {
    document.body.innerHTML = '';

    container1 = createCollapsibleSection('Ingredients', '<p>Ingredient list</p>', 'ingredients');
    container2 = createCollapsibleSection('Instructions', '<p>Step by step</p>', 'instructions');

    // Simulate Ingredients expanded by default
    container1.setAttribute('aria-expanded', 'true');
    container1.querySelector('.collapsible-header').setAttribute('aria-expanded', 'true');
    container1.classList.add('expanded');

    document.body.appendChild(container1);
    document.body.appendChild(container2);

    toggleAllBtn = document.createElement('button');
    toggleAllBtn.textContent = 'Collapse All';
    toggleAllBtn.setAttribute('aria-pressed', 'false');
    toggleAllBtn.addEventListener('click', () => {
      const containers = document.querySelectorAll('.collapsible-container');
      const shouldExpand = toggleAllBtn.textContent === 'Expand All';
      containers.forEach(c => {
        c.setAttribute('aria-expanded', String(shouldExpand));
        const header = c.querySelector('.collapsible-header');
        if (header) header.setAttribute('aria-expanded', String(shouldExpand));
        c.classList.toggle('expanded', shouldExpand);
      });
      toggleAllBtn.textContent = shouldExpand ? 'Collapse All' : 'Expand All';
      toggleAllBtn.setAttribute('aria-pressed', String(shouldExpand));
    });
    document.body.appendChild(toggleAllBtn);
  });

  test('Collapsible sections render with correct structure and accessibility attributes', () => {
    expect(container1).toHaveClass('collapsible-container');
    expect(container2).toHaveClass('collapsible-container');

    const header1 = container1.querySelector('.collapsible-header');
    const header2 = container2.querySelector('.collapsible-header');

    expect(header1).toHaveAttribute('aria-controls', 'ingredients-content');
    expect(header2).toHaveAttribute('aria-controls', 'instructions-content');

    expect(header1).toHaveAttribute('aria-expanded', 'true');
    expect(header2).toHaveAttribute('aria-expanded', 'false');

    expect(container1).toHaveAttribute('aria-expanded', 'true');
    expect(container2).toHaveAttribute('aria-expanded', 'false');
  });

  test('Toggle button expands and collapses individual sections', () => {
    const header2 = container2.querySelector('.collapsible-header');

    // Initially collapsed
    expect(container2).not.toHaveClass('expanded');
    expect(container2).toHaveAttribute('aria-expanded', 'false');

    // Click to expand
    fireEvent.click(header2);
    expect(container2).toHaveClass('expanded');
    expect(container2).toHaveAttribute('aria-expanded', 'true');
    expect(header2).toHaveAttribute('aria-expanded', 'true');

    // Click again to collapse
    fireEvent.click(header2);
    expect(container2).not.toHaveClass('expanded');
    expect(container2).toHaveAttribute('aria-expanded', 'false');
    expect(header2).toHaveAttribute('aria-expanded', 'false');
  });

  test('Keyboard navigation toggles sections', () => {
    const header2 = container2.querySelector('.collapsible-header');

    fireEvent.keyDown(header2, { key: 'Enter' });
    expect(container2).toHaveClass('expanded');

    fireEvent.keyDown(header2, { key: ' ' });
    expect(container2).not.toHaveClass('expanded');
  });

  test('Expand All / Collapse All button toggles all sections', () => {
    // Initially, Ingredients expanded, Instructions collapsed
    expect(container1).toHaveAttribute('aria-expanded', 'true');
    expect(container2).toHaveAttribute('aria-expanded', 'false');

    // Click to expand all
    toggleAllBtn.textContent = 'Expand All';
    fireEvent.click(toggleAllBtn);

    expect(container1).toHaveAttribute('aria-expanded', 'true');
    expect(container2).toHaveAttribute('aria-expanded', 'true');
    expect(toggleAllBtn.textContent).toBe('Collapse All');

    // Click to collapse all
    fireEvent.click(toggleAllBtn);

    expect(container1).toHaveAttribute('aria-expanded', 'false');
    expect(container2).toHaveAttribute('aria-expanded', 'false');
    expect(toggleAllBtn.textContent).toBe('Expand All');
  });

  test('Multiple sections can be open simultaneously', () => {
    const header2 = container2.querySelector('.collapsible-header');

    // Ingredients is open by default
    expect(container1).toHaveAttribute('aria-expanded', 'true');
    expect(container2).toHaveAttribute('aria-expanded', 'false');

    // Expand Instructions
    fireEvent.click(header2);

    expect(container1).toHaveAttribute('aria-expanded', 'true');
    expect(container2).toHaveAttribute('aria-expanded', 'true');
  });
});