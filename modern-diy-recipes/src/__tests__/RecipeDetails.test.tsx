import { render, screen, fireEvent } from '@testing-library/react';
import RecipeDetails from '../components/RecipeDetails';
import '@testing-library/jest-dom';
import { useRecipe } from '../hooks/useRecipe'; // Import the actual hook

// Mock the useRecipe hook with more control
jest.mock('../hooks/useRecipe');

const mockUseRecipe = useRecipe as jest.Mock;

const mockRecipe = {
  id: 'test-id',
  title: 'Test Recipe',
  description: 'Test Description',
  ingredients: [{ name: 'Ingredient 1', quantity: '1', unit: 'cup' }],
  steps: ['Step 1', 'Step 2'],
};

describe('RecipeDetails', () => {
  beforeEach(() => {
    // Reset mock before each test
    mockUseRecipe.mockReset();
  });

  it('renders loading state initially', () => {
    mockUseRecipe.mockReturnValue({
      recipe: null,
      loading: true,
      error: null,
      fetchRecipe: jest.fn(),
      createRecipe: jest.fn(),
      updateRecipe: jest.fn(),
      deleteRecipe: jest.fn(),
    });
    render(<RecipeDetails recipeId="test-id" />);
    expect(screen.getByText('Loading recipe...')).toBeInTheDocument();
  });

  it('renders recipe details when data is loaded', async () => {
    mockUseRecipe.mockReturnValue({
      recipe: mockRecipe,
      loading: false,
      error: null,
      fetchRecipe: jest.fn(),
      createRecipe: jest.fn(),
      updateRecipe: jest.fn(),
      deleteRecipe: jest.fn(),
    });
    render(<RecipeDetails recipeId="test-id" />);

    expect(await screen.findByText('Test Recipe')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('Ingredient 1')).toBeInTheDocument();
    expect(screen.getByText('Step 1')).toBeInTheDocument();
    expect(screen.getByText('Step 2')).toBeInTheDocument();
  });

  it('renders error state when fetching recipe fails', async () => {
    const errorMessage = 'Failed to fetch recipe';
    mockUseRecipe.mockReturnValue({
      recipe: null,
      loading: false,
      error: new Error(errorMessage),
      fetchRecipe: jest.fn(),
      createRecipe: jest.fn(),
      updateRecipe: jest.fn(),
      deleteRecipe: jest.fn(),
    });
    render(<RecipeDetails recipeId="test-id" />);

    expect(await screen.findByText(`Error: ${errorMessage}`)).toBeInTheDocument();
  });

  it('renders message when no recipe is found', async () => {
    mockUseRecipe.mockReturnValue({
      recipe: null,
      loading: false,
      error: null,
      fetchRecipe: jest.fn(),
      createRecipe: jest.fn(),
      updateRecipe: jest.fn(),
      deleteRecipe: jest.fn(),
    });
    render(<RecipeDetails recipeId="non-existent-id" />);

    expect(await screen.findByText('Recipe not found.')).toBeInTheDocument();
  });

  it('calls updateRecipe when the save button is clicked', async () => {
    const mockUpdateRecipe = jest.fn();
    mockUseRecipe.mockReturnValue({
      recipe: mockRecipe,
      loading: false,
      error: null,
      fetchRecipe: jest.fn(),
      createRecipe: jest.fn(),
      updateRecipe: mockUpdateRecipe,
      deleteRecipe: jest.fn(),
    });
    render(<RecipeDetails recipeId="test-id" />);

    // Assuming there's a save button with text "Save Recipe"
    const saveButton = await screen.findByText('Save Recipe');
    fireEvent.click(saveButton);

    expect(mockUpdateRecipe).toHaveBeenCalledWith(mockRecipe); // Adjust if the component passes modified data
  });

  it('calls deleteRecipe when the delete button is clicked', async () => {
    const mockDeleteRecipe = jest.fn();
    mockUseRecipe.mockReturnValue({
      recipe: mockRecipe,
      loading: false,
      error: null,
      fetchRecipe: jest.fn(),
      createRecipe: jest.fn(),
      updateRecipe: jest.fn(),
      deleteRecipe: mockDeleteRecipe,
    });
    render(<RecipeDetails recipeId="test-id" />);

    // Assuming there's a delete button with text "Delete Recipe"
    const deleteButton = await screen.findByText('Delete Recipe');
    fireEvent.click(deleteButton);

    expect(mockDeleteRecipe).toHaveBeenCalledWith('test-id');
  });

  // Add tests for editing recipe details, adding/removing ingredients/steps, etc.
});