/**
 * @jest-environment jsdom
 */

import ActionRegistry from '../js/action-registry.js';
import '../js/action-renderer.js'; // attaches to window
import '@testing-library/jest-dom';
import { fireEvent } from '@testing-library/dom';

describe('Action System', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'action-container';
    document.body.appendChild(container);
    ActionRegistry.actions = [];
  });

  afterEach(() => {
    document.body.innerHTML = '';
    jest.clearAllMocks();
  });

  test('Registers valid actions and ignores invalid ones', () => {
    const valid = { name: 'Valid', applicableTo: () => true, execute: jest.fn() };
    const invalid = { name: 'Invalid' };

    ActionRegistry.register(valid);
    ActionRegistry.register(invalid);

    expect(ActionRegistry.actions).toContain(valid);
    expect(ActionRegistry.actions).not.toContain(invalid);
  });

  test('Returns applicable actions and handles errors gracefully', () => {
    const always = { name: 'Always', applicableTo: () => true };
    const never = { name: 'Never', applicableTo: () => false };
    const erroring = { name: 'Erroring', applicableTo: () => { throw new Error(); } };

    ActionRegistry.register(always);
    ActionRegistry.register(never);
    ActionRegistry.register(erroring);

    const item = { type: 'recipe' };
    const result = ActionRegistry.getActionsForItem(item);

    expect(result).toContain(always);
    expect(result).not.toContain(never);
    expect(result).not.toContain(erroring);
  });

  test('Renders no actions when no item is selected', () => {
    window.ActionRenderer.render(container, null);
    expect(container.children.length).toBe(0);
  });

  test('Renders grouped actions correctly', () => {
    const primary = { name: 'Primary', category: 'primary', applicableTo: () => true, execute: jest.fn() };
    const secondary = { name: 'Secondary', category: 'secondary', applicableTo: () => true, execute: jest.fn() };
    const utility = { name: 'Utility', category: 'utility', applicableTo: () => true, execute: jest.fn() };
    ActionRegistry.register(primary);
    ActionRegistry.register(secondary);
    ActionRegistry.register(utility);

    window.ActionRenderer.render(container, {});

    expect(container.querySelector('.action-group-primary')).toBeInTheDocument();
    expect(container.querySelector('.action-group-secondary')).toBeInTheDocument();
    expect(container.querySelector('.action-group-utility')).toBeInTheDocument();

    expect(container.querySelector('.action-button.action-primary')).toHaveTextContent('Primary');
    expect(container.querySelector('.action-button.action-secondary')).toHaveTextContent('Secondary');
    expect(container.querySelector('.action-button.action-utility')).toHaveTextContent('Utility');
  });

  test('Expandable sub-actions render and toggle', () => {
    const sub1 = { name: 'Sub1', category: 'secondary', applicableTo: () => true, execute: jest.fn() };
    const sub2 = { name: 'Sub2', category: 'secondary', applicableTo: () => true, execute: jest.fn() };
    const parent = {
      name: 'Parent',
      category: 'primary',
      applicableTo: () => true,
      subActions: [sub1, sub2]
    };
    ActionRegistry.register(parent);

    window.ActionRenderer.render(container, {});

    const expandable = container.querySelector('.expandable-action');
    expect(expandable).toBeInTheDocument();
    expect(expandable.getAttribute('aria-expanded')).toBe('false');

    const toggle = expandable.querySelector('.expand-toggle');
    fireEvent.click(toggle);
    expect(expandable.getAttribute('aria-expanded')).toBe('true');
  });

  test('Action execution works and errors do not break UI', () => {
    const mockFn = jest.fn();
    const errorFn = jest.fn(() => { throw new Error('fail'); });

    const goodAction = { name: 'Good', category: 'primary', applicableTo: () => true, execute: mockFn };
    const badAction = { name: 'Bad', category: 'primary', applicableTo: () => true, execute: errorFn };

    ActionRegistry.register(goodAction);
    ActionRegistry.register(badAction);

    window.ActionRenderer.render(container, {});

    const buttons = container.querySelectorAll('button');
    fireEvent.click(buttons[0]);
    fireEvent.click(buttons[1]);

    expect(mockFn).toHaveBeenCalled();
    expect(errorFn).toHaveBeenCalled();
  });

  test('Handles many actions without performance degradation', () => {
    for (let i = 0; i < 100; i++) {
      ActionRegistry.register({
        name: `Action ${i}`,
        category: 'primary',
        applicableTo: () => true,
        execute: jest.fn()
      });
    }

    window.ActionRenderer.render(container, {});
    expect(container.querySelectorAll('button').length).toBe(100);
  });

  test('Handles malformed data gracefully', () => {
    const malformed = { name: 'Malformed', applicableTo: () => { throw new Error(); } };
    ActionRegistry.register(malformed);

    expect(() => window.ActionRenderer.render(container, {})).not.toThrow();
  });

  test('Accessibility attributes are present', () => {
    const sub = { name: 'Sub', applicableTo: () => true, execute: jest.fn() };
    const parent = { name: 'Parent', category: 'primary', applicableTo: () => true, subActions: [sub] };
    ActionRegistry.register(parent);

    window.ActionRenderer.render(container, {});

    const expandable = container.querySelector('.expandable-action');
    expect(expandable).toHaveAttribute('aria-expanded');
  });
});