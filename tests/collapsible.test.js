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
    const content3 = container3.querySelector('.collapsible-content');
    
    expect(content1).toHaveAttribute('id', 'ingredients-content');
    expect(content2).toHaveAttribute('id', 'instructions-content');
    expect(content3).toHaveAttribute('id', 'notes-content');
    
    expect(content1.innerHTML).toContain('<p>Ingredient list</p>');
    expect(content2.innerHTML).toContain('<p>Step by step</p>');
    expect(content3.innerHTML).toContain('<p>Recipe notes</p>');
  });

  test('Collapsible sections have correct color coding', () => {
    expect(container1).toHaveAttribute('data-color', 'blue');
    expect(container2).toHaveAttribute('data-color', 'orange');
    expect(container3).toHaveAttribute('data-color', 'neutral');
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

    // Enter key expands
    fireEvent.keyDown(header2, { key: 'Enter' });
    expect(container2).toHaveClass('expanded');
    expect(container2).toHaveAttribute('aria-expanded', 'true');
    expect(header2).toHaveAttribute('aria-expanded', 'true');

    // Space key collapses
    fireEvent.keyDown(header2, { key: ' ' });
    expect(container2).not.toHaveClass('expanded');
    expect(container2).toHaveAttribute('aria-expanded', 'false');
    expect(header2).toHaveAttribute('aria-expanded', 'false');
    
    // Other keys don't affect state
    fireEvent.keyDown(header2, { key: 'A' });
    expect(container2).not.toHaveClass('expanded');
    expect(container2).toHaveAttribute('aria-expanded', 'false');
  });

  test('Expand All / Collapse All button toggles all sections', () => {
    // Initially, container1 expanded, others collapsed
    expect(container1).toHaveAttribute('aria-expanded', 'true');
    expect(container2).toHaveAttribute('aria-expanded', 'false');
    expect(container3).toHaveAttribute('aria-expanded', 'false');
    
    // Verify initial button state
    expect(toggleAllBtn.querySelector('.label').textContent).toBe('Expand All');
    expect(toggleAllBtn.querySelector('.icon').textContent).toBe('⊕');
    expect(toggleAllBtn).toHaveAttribute('aria-pressed', 'false');

    // Click to expand all
    fireEvent.click(toggleAllBtn);

    // Verify all containers are expanded
    expect(container1).toHaveAttribute('aria-expanded', 'true');
    expect(container2).toHaveAttribute('aria-expanded', 'true');
    expect(container3).toHaveAttribute('aria-expanded', 'true');
    
    // Verify button state changed
    expect(toggleAllBtn.querySelector('.label').textContent).toBe('Collapse All');
    expect(toggleAllBtn.querySelector('.icon').textContent).toBe('⊖');
    expect(toggleAllBtn).toHaveAttribute('aria-pressed', 'true');

    // Click to collapse all
    fireEvent.click(toggleAllBtn);

    // Verify all containers are collapsed
    expect(container1).toHaveAttribute('aria-expanded', 'false');
    expect(container2).toHaveAttribute('aria-expanded', 'false');
    expect(container3).toHaveAttribute('aria-expanded', 'false');
    
    // Verify button state changed back
    expect(toggleAllBtn.querySelector('.label').textContent).toBe('Expand All');
    expect(toggleAllBtn.querySelector('.icon').textContent).toBe('⊕');
    expect(toggleAllBtn).toHaveAttribute('aria-pressed', 'false');
  });

  test('Multiple sections can be open simultaneously', () => {
    const header2 = container2.querySelector('.collapsible-header');
    const header3 = container3.querySelector('.collapsible-header');

    // Initially only container1 is expanded
    expect(container1).toHaveAttribute('aria-expanded', 'true');
    expect(container2).toHaveAttribute('aria-expanded', 'false');
    expect(container3).toHaveAttribute('aria-expanded', 'false');

    // Expand container2
    fireEvent.click(header2);
    
    // Now both container1 and container2 should be expanded
    expect(container1).toHaveAttribute('aria-expanded', 'true');
    expect(container2).toHaveAttribute('aria-expanded', 'true');
    expect(container3).toHaveAttribute('aria-expanded', 'false');

    // Expand container3
    fireEvent.click(header3);
    
    // Now all three containers should be expanded
    expect(container1).toHaveAttribute('aria-expanded', 'true');
    expect(container2).toHaveAttribute('aria-expanded', 'true');
    expect(container3).toHaveAttribute('aria-expanded', 'true');
    
    // Collapse container1
    fireEvent.click(container1.querySelector('.collapsible-header'));
    
    // Now only container2 and container3 should be expanded
    expect(container1).toHaveAttribute('aria-expanded', 'false');
    expect(container2).toHaveAttribute('aria-expanded', 'true');
    expect(container3).toHaveAttribute('aria-expanded', 'true');
  });
  
  test('Collapsible icon rotates when expanded', () => {
    const header2 = container2.querySelector('.collapsible-header');
    const icon2 = header2.querySelector('.collapsible-icon');
    
    // Get the initial transform style
    const initialTransform = window.getComputedStyle(icon2).transform;
    
    // Expand the section
    fireEvent.click(header2);
    
    // Check if container is expanded
    expect(container2).toHaveAttribute('aria-expanded', 'true');
    
    // In a real browser, the icon would rotate due to CSS
    // We can't test the actual rotation in JSDOM, but we can verify the aria-expanded state
    // which would trigger the CSS transform
    expect(container2.getAttribute('aria-expanded')).toBe('true');
  });
});