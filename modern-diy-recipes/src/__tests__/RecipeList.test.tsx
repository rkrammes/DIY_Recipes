import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RecipeList from '../components/RecipeList';
import '@testing-library/jest-dom';
import { useRecipes } from '../hooks/useRecipes'; // Import the actual hook

// Mock the useRecipes hook with more control
jest.mock('../hooks/useRecipes');

const mockUseRecipes = useRecipes as jest.Mock;

const mockRecipes = [
  { id: '1', title: 'Recipe 1', description: 'Desc 1', ingredients: [], steps: [] },
  { id: '2', title: 'Recipe 2', description: 'Desc 2', ingredients: [], steps: [] },
];

describe('RecipeList', () => {
  beforeEach(() => {
    // Reset mock before each test
    mockUseRecipes.mockReset();
  });

  it('renders loading state initially', () => {
    mockUseRecipes.mockReturnValue({
      recipes: [],
      loading: true,
      error: null,
      fetchRecipes: jest.fn(),
    });
    render(<RecipeList initialRecipes={[]} selectedId={null} onSelect={jest.fn()} deleteRecipe={jest.fn()} updateRecipe={jest.fn()} />);
    expect(screen.getByText('Loading recipes...')).toBeInTheDocument();
  });

  it('renders a list of recipes when data is loaded', async () => {
    mockUseRecipes.mockReturnValue({
      recipes: mockRecipes,
      loading: false,
      error: null,
      fetchRecipes: jest.fn(),
      deleteRecipe: jest.fn(),
      updateRecipe: jest.fn(),
    });
    render(<RecipeList initialRecipes={mockRecipes} selectedId={null} onSelect={jest.fn()} deleteRecipe={jest.fn()} updateRecipe={jest.fn()} />);

    expect(await screen.findByText('Recipe 1')).toBeInTheDocument();
    expect(screen.getByText('Recipe 2')).toBeInTheDocument();
  });

  it('renders error state when fetching recipes fails', async () => {
    const errorMessage = 'Failed to fetch recipes';
    mockUseRecipes.mockReturnValue({
      recipes: [],
      loading: false,
      error: new Error(errorMessage),
      fetchRecipes: jest.fn(),
      deleteRecipe: jest.fn(),
      updateRecipe: jest.fn(),
    });
    render(<RecipeList initialRecipes={[]} selectedId={null} onSelect={jest.fn()} deleteRecipe={jest.fn()} updateRecipe={jest.fn()} />);

    expect(await screen.findByText(`Error loading recipes: ${errorMessage}`)).toBeInTheDocument();
  });

  it('renders message when no recipes are found', async () => {
    mockUseRecipes.mockReturnValue({
      recipes: [],
      loading: false,
      error: null,
      fetchRecipes: jest.fn(),
      deleteRecipe: jest.fn(),
      updateRecipe: jest.fn(),
    });
    render(<RecipeList initialRecipes={[]} selectedId={null} onSelect={jest.fn()} deleteRecipe={jest.fn()} updateRecipe={jest.fn()} />);

    expect(await screen.findByText('No recipes found.')).toBeInTheDocument();
  });

  it('calls onSelect when a recipe is clicked', async () => {
    const mockOnSelect = jest.fn();
    mockUseRecipes.mockReturnValue({
      recipes: mockRecipes,
      loading: false,
      error: null,
      fetchRecipes: jest.fn(),
      deleteRecipe: jest.fn(),
      updateRecipe: jest.fn(),
    });
    render(<RecipeList initialRecipes={mockRecipes} selectedId={null} onSelect={mockOnSelect} deleteRecipe={jest.fn()} updateRecipe={jest.fn()} />);

    const recipe1Element = await screen.findByText('Recipe 1');
    fireEvent.click(recipe1Element);

    expect(mockOnSelect).toHaveBeenCalledWith('1');
  });

  it('highlights the selected recipe', async () => {
    mockUseRecipes.mockReturnValue({
      recipes: mockRecipes,
      loading: false,
      error: null,
      fetchRecipes: jest.fn(),
      deleteRecipe: jest.fn(),
      updateRecipe: jest.fn(),
    });
    render(<RecipeList initialRecipes={mockRecipes} selectedId="1" onSelect={jest.fn()} deleteRecipe={jest.fn()} updateRecipe={jest.fn()} />);

    const recipe1Element = await screen.findByText('Recipe 1');
    expect(recipe1Element.parentElement).toHaveClass('bg-gray-200'); // Assuming a class for selected state
  });

  // Add tests for pagination if implemented
  // Add tests for filtering/searching if implemented
});