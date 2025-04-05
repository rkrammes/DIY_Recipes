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