import { calculateRecipeCost, fetchBatchRecords, fetchSubstitutionMap } from './api.js';

/* ============================
   Action Components Framework
   ============================ */

// Collapsible panel component
export const CollapsiblePanel = {
  render: (container, title, contentElement) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'action-panel collapsible-container';
    wrapper.setAttribute('aria-expanded', 'false');

    const header = document.createElement('div');
    header.className = 'collapsible-header';
    header.tabIndex = 0;
    header.setAttribute('role', 'button');
    header.setAttribute('aria-expanded', 'false');
    header.innerHTML = `<span>${title}</span><span class="collapsible-icon">▶</span>`;

    const content = document.createElement('div');
    content.className = 'collapsible-content';
    content.style.maxHeight = '0';
    content.style.overflow = 'hidden';
    content.style.transition = 'max-height 0.3s ease, opacity 0.3s ease';
    content.style.opacity = '0';
    content.appendChild(contentElement);

    header.onclick = () => toggle();
    header.onkeydown = (e) => { if(e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } };

    function toggle() {
      const expanded = wrapper.getAttribute('aria-expanded') === 'true';
      wrapper.setAttribute('aria-expanded', String(!expanded));
      header.setAttribute('aria-expanded', String(!expanded));
      if (!expanded) {
        content.style.maxHeight = content.scrollHeight + 'px';
        content.style.opacity = '1';
      } else {
        content.style.maxHeight = '0';
        content.style.opacity = '0';
      }
    }

    wrapper.appendChild(header);
    wrapper.appendChild(content);
    container.appendChild(wrapper);
    return wrapper;
  }
};

// Slider input component
export function createSliderControl({ label, min = 0, max = 100, step = 1, value = 50, onChange }) {
  const wrapper = document.createElement('div');
  wrapper.className = 'action-input slider-control';

  const labelEl = document.createElement('label');
  labelEl.textContent = label;

  const input = document.createElement('input');
  input.type = 'range';
  input.min = min;
  input.max = max;
  input.step = step;
  input.value = value;

  const valueDisplay = document.createElement('span');
  valueDisplay.textContent = value;

  input.oninput = () => {
    valueDisplay.textContent = input.value;
    if(onChange) onChange(input.value);
  };

  wrapper.appendChild(labelEl);
  wrapper.appendChild(input);
  wrapper.appendChild(valueDisplay);
  return wrapper;
}

// Toggle switch component
export function createToggleControl({ label, checked = false, onChange }) {
  const wrapper = document.createElement('div');
  wrapper.className = 'action-input toggle-control';

  const labelEl = document.createElement('label');
  labelEl.textContent = label;

  const input = document.createElement('input');
  input.type = 'checkbox';
  input.checked = checked;

  input.onchange = () => {
    if(onChange) onChange(input.checked);
  };

  wrapper.appendChild(labelEl);
  wrapper.appendChild(input);
  return wrapper;
}

// Result display component
export function createResultDisplay(content = '') {
  const wrapper = document.createElement('div');
  wrapper.className = 'action-result';
  wrapper.innerHTML = content;
  return wrapper;
}

/* ============================
   Initialize Right Column Actions
   ============================ */

export function initRecipeActions() {
  const rightColumn = document.getElementById('right-column-actions');
  if (!rightColumn) return;

  // Clear previous content
  rightColumn.innerHTML = '';

  // Example: Batch Info Panel
  const batchContent = document.createElement('div');
  batchContent.innerHTML = '<p>Batch details will appear here.</p>';
  CollapsiblePanel.render(rightColumn, 'Batch Records', batchContent);

  // Example: Ingredient Substitutions Panel
  const subContent = document.createElement('div');
  subContent.innerHTML = '<p>Substitution mappings will appear here.</p>';
  CollapsiblePanel.render(rightColumn, 'Ingredient Substitutions', subContent);

  // Example: Cost Calculation Panel
  const costContent = document.createElement('div');
  const costResult = createResultDisplay('Cost breakdown will appear here.');
  costContent.appendChild(costResult);
  CollapsiblePanel.render(rightColumn, 'Cost Calculation', costContent);

  // Example input controls
  const controlsPanel = document.createElement('div');
  const slider = createSliderControl({
    label: 'Batch Size',
    min: 1,
    max: 100,
    step: 1,
    value: 10,
    onChange: (val) => console.log('Batch size changed:', val)
  });
  const toggle = createToggleControl({
    label: 'Include Overhead Costs',
    checked: true,
    onChange: (val) => console.log('Include overhead:', val)
  });
  controlsPanel.appendChild(slider);
  controlsPanel.appendChild(toggle);
  CollapsiblePanel.render(rightColumn, 'Adjustments', controlsPanel);
}