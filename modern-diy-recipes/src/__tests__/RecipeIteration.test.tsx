import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RecipeIteration from '../components/RecipeIteration';
import '@testing-library/jest-dom';
import { useRecipeIteration } from '../hooks/useRecipeIteration'; // Import the actual hook

// Mock the useRecipeIteration hook with more control
jest.mock('../hooks/useRecipeIteration');

const mockUseRecipeIteration = useRecipeIteration as jest.Mock;

const mockIterations = [
  { id: '1', version_number: 1, title: 'Iteration 1', created_at: '2023-01-01T10:00:00Z' },
  { id: '2', version_number: 2, title: 'Iteration 2', created_at: '2023-01-01T11:00:00Z' },
];

describe('RecipeIteration', () => {
  beforeEach(() => {
    // Reset mock before each test
    mockUseRecipeIteration.mockReset();
  });

  it('renders loading state initially', () => {
    mockUseRecipeIteration.mockReturnValue({
      iterations: [],
      loading: true,
      error: null,
      fetchIteration: jest.fn(),
      saveIteration: jest.fn(),
    });
    render(<RecipeIteration recipeId="test-recipe-id" onSelectIteration={jest.fn()} selectedIterationId={undefined} />);
    expect(screen.getByText('Loading iteration...')).toBeInTheDocument();
  });

  it('renders a list of iterations when data is loaded', async () => {
    mockUseRecipeIteration.mockReturnValue({
      iterations: mockIterations,
      loading: false,
      error: null,
      fetchIteration: jest.fn(),
      saveIteration: jest.fn(),
    });
    render(<RecipeIteration recipeId="test-recipe-id" onSelectIteration={jest.fn()} selectedIterationId={undefined} />);

    expect(await screen.findByText('v1: Iteration 1')).toBeInTheDocument();
    expect(screen.getByText('v2: Iteration 2')).toBeInTheDocument();
  });

  it('renders error state when fetching iterations fails', async () => {
    const errorMessage = 'Failed to fetch iterations';
    mockUseRecipeIteration.mockReturnValue({
      iterations: [],
      loading: false,
      error: new Error(errorMessage),
      fetchIteration: jest.fn(),
      saveIteration: jest.fn(),
    });
    render(<RecipeIteration recipeId="test-recipe-id" onSelectIteration={jest.fn()} selectedIterationId={undefined} />);

    expect(await screen.findByText(`Error: ${errorMessage}`)).toBeInTheDocument();
  });

  it('renders message when no iterations are found', async () => {
    mockUseRecipeIteration.mockReturnValue({
      iterations: [],
      loading: false,
      error: null,
      fetchIteration: jest.fn(),
      saveIteration: jest.fn(),
    });
    render(<RecipeIteration recipeId="test-recipe-id" onSelectIteration={jest.fn()} selectedIterationId={undefined} />);

    expect(await screen.findByText('No iterations found.')).toBeInTheDocument();
  });

  it('calls onSelectIteration when an iteration is clicked', async () => {
    const mockOnSelectIteration = jest.fn();
    mockUseRecipeIteration.mockReturnValue({
      iterations: mockIterations,
      loading: false,
      error: null,
      fetchIteration: jest.fn(),
      saveIteration: jest.fn(),
    });
    render(<RecipeIteration recipeId="test-recipe-id" onSelectIteration={mockOnSelectIteration} selectedIterationId={undefined} />);

    const iteration1Element = await screen.findByText('v1: Iteration 1');
    fireEvent.click(iteration1Element);

    expect(mockOnSelectIteration).toHaveBeenCalledWith('1');
  });

  it('highlights the selected iteration', async () => {
    mockUseRecipeIteration.mockReturnValue({
      iterations: mockIterations,
      loading: false,
      error: null,
      fetchIteration: jest.fn(),
      saveIteration: jest.fn(),
    });
    render(<RecipeIteration recipeId="test-recipe-id" onSelectIteration={jest.fn()} selectedIterationId="2" />);

    const iteration2Element = await screen.findByText('v2: Iteration 2');
    expect(iteration2Element.parentElement).toHaveClass('bg-blue-100'); // Assuming a class for selected state
  });

  // Add tests for creating new iterations if applicable
});