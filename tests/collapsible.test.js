/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { fireEvent } from '@testing-library/dom';

describe('Collapsible UI Components', () => {
  let container1, container2, container3, toggleAllBtn;

  beforeEach(() => {
    document.body.innerHTML = '';
    
    // Create three collapsible sections with different color types
    container1 = createTestCollapsible('Ingredients', '<p>Ingredient list</p>', 'ingredients', 'blue');
    container2 = createTestCollapsible('Instructions', '<p>Step by step</p>', 'instructions', 'orange');
    container3 = createTestCollapsible('Notes', '<p>Recipe notes</p>', 'notes', 'neutral');

    // Simulate Ingredients expanded by default
    container1.setAttribute('aria-expanded', 'true');
    container1.querySelector('.collapsible-header').setAttribute('aria-expanded', 'true');
    container1.classList.add('expanded');

    // Create a container for the collapsibles
    const collapsibleGroup = document.createElement('div');
    collapsibleGroup.className = 'collapsible-group';
    collapsibleGroup.id = 'test-collapsible-group';
    
    // Add the collapsibles to the group
    collapsibleGroup.appendChild(container1);
    collapsibleGroup.appendChild(container2);
    collapsibleGroup.appendChild(container3);
    
    // Create toggle all button
    toggleAllBtn = document.createElement('button');
    toggleAllBtn.className = 'btn-expand-collapse';
    toggleAllBtn.setAttribute('aria-pressed', 'false');
    toggleAllBtn.innerHTML = `
      <span class="icon">⊕</span>
      <span class="label">Expand All</span>
    `;
    
    toggleAllBtn.addEventListener('click', () => {
      const containers = collapsibleGroup.querySelectorAll('.collapsible-container');
      const shouldExpand = toggleAllBtn.querySelector('.label').textContent === 'Expand All';
      
      containers.forEach(container => {
        container.setAttribute('aria-expanded', String(shouldExpand));
        const header = container.querySelector('.collapsible-header');
        if (header) header.setAttribute('aria-expanded', String(shouldExpand));
        container.classList.toggle('expanded', shouldExpand);
      });
      
      toggleAllBtn.querySelector('.label').textContent = shouldExpand ? 'Collapse All' : 'Expand All';
      toggleAllBtn.setAttribute('aria-pressed', String(shouldExpand));
      toggleAllBtn.querySelector('.icon').textContent = shouldExpand ? '⊖' : '⊕';
    });
    
    // Add the toggle button to the group
    collapsibleGroup.prepend(toggleAllBtn);
    
    // Add the group to the document
    document.body.appendChild(collapsibleGroup);
  });

  test('Collapsible sections render with correct structure and accessibility attributes', () => {
    // Test container structure
    expect(container1).toHaveClass('collapsible-container');
    expect(container2).toHaveClass('collapsible-container');
    expect(container3).toHaveClass('collapsible-container');

    // Test header structure
    const header1 = container1.querySelector('.collapsible-header');
    const header2 = container2.querySelector('.collapsible-header');
    const header3 = container3.querySelector('.collapsible-header');

    expect(header1).toHaveAttribute('aria-controls', 'ingredients-content');
    expect(header2).toHaveAttribute('aria-controls', 'instructions-content');
    expect(header3).toHaveAttribute('aria-controls', 'notes-content');

    // Test initial expanded state
    expect(header1).toHaveAttribute('aria-expanded', 'true');
    expect(header2).toHaveAttribute('aria-expanded', 'false');
    expect(header3).toHaveAttribute('aria-expanded', 'false');

    expect(container1).toHaveAttribute('aria-expanded', 'true');
    expect(container2).toHaveAttribute('aria-expanded', 'false');
    expect(container3).toHaveAttribute('aria-expanded', 'false');
    
    // Test content structure
    const content1 = container1.querySelector('.collapsible-content');
    const content2 = container2.querySelector('.collapsible-content');
