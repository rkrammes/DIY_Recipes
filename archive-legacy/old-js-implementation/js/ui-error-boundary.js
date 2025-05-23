export function createErrorBoundary(containerId, renderFunction) {
  const container = document.getElementById(containerId);

  try {
    renderFunction(container);
  } catch (error) {
    console.error(`Error in ${containerId}:`, error);
    container.innerHTML = `
      <div class="error-boundary">
        <h3>Something went wrong</h3>
        <p>There was an error loading this section.</p>
        <button class="btn" onclick="window.location.reload()">
          Reload Page
        </button>
      </div>
    `;
  }
}