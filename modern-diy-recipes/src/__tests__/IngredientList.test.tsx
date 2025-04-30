import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import IngredientList from '../components/IngredientList';
import '@testing-library/jest-dom';
import { useIngredients } from '../hooks/useIngredients'; // Import the actual hook

// Mock the useIngredients hook with more control
jest.mock('../hooks/useIngredients');

const mockUseIngredients = useIngredients as jest.Mock;

const mockIngredients = [
  { id: '1', name: 'Ingredient A' },
  { id: '2', name: 'Ingredient B' },
];

describe('IngredientList', () => {
  beforeEach(() => {
    // Reset mock before each test
    mockUseIngredients.mockReset();
  });

  it('renders loading state initially', () => {
    mockUseIngredients.mockReturnValue({
      ingredients: [],
      loading: true,
      error: null,
      fetchIngredients: jest.fn(),
      createIngredient: jest.fn(),
      updateIngredient: jest.fn(),
      deleteIngredient: jest.fn(),
    });
    render(<IngredientList />);
    expect(screen.getByText('Loading ingredients...')).toBeInTheDocument();
  });

  it('renders a list of ingredients when data is loaded', async () => {
    mockUseIngredients.mockReturnValue({
      ingredients: mockIngredients,
      loading: false,
      error: null,
      fetchIngredients: jest.fn(),
      createIngredient: jest.fn(),
      updateIngredient: jest.fn(),
      deleteIngredient: jest.fn(),
    });
    render(<IngredientList />);

    expect(await screen.findByText('Ingredient A')).toBeInTheDocument();
    expect(screen.getByText('Ingredient B')).toBeInTheDocument();
  });

  it('renders error state when fetching ingredients fails', async () => {
    const errorMessage = 'Failed to fetch ingredients';
    mockUseIngredients.mockReturnValue({
      ingredients: [],
      loading: false,
      error: new Error(errorMessage),
      fetchIngredients: jest.fn(),
      createIngredient: jest.fn(),
      updateIngredient: jest.fn(),
      deleteIngredient: jest.fn(),
    });
    render(<IngredientList />);

    expect(await screen.findByText(`Error: ${errorMessage}`)).toBeInTheDocument();
  });

  it('renders message when no ingredients are found', async () => {
    mockUseIngredients.mockReturnValue({
      ingredients: [],
      loading: false,
      error: null,
      fetchIngredients: jest.fn(),
      createIngredient: jest.fn(),
      updateIngredient: jest.fn(),
      deleteIngredient: jest.fn(),
    });
    render(<IngredientList />);

    expect(await screen.findByText('No ingredients found.')).toBeInTheDocument();
  });

  it('calls deleteIngredient when the delete button is clicked', async () => {
    const mockDeleteIngredient = jest.fn();
    mockUseIngredients.mockReturnValue({
      ingredients: mockIngredients,
      loading: false,
      error: null,
      fetchIngredients: jest.fn(),
      createIngredient: jest.fn(),
      updateIngredient: jest.fn(),
      deleteIngredient: mockDeleteIngredient,
    });
    render(<IngredientList />);

    // Assuming each ingredient item has a delete button with accessible text like "Delete Ingredient A"
    const deleteButtonA = await screen.findByLabelText('Delete Ingredient A');
    fireEvent.click(deleteButtonA);

    expect(mockDeleteIngredient).toHaveBeenCalledWith('1');

    const deleteButtonB = screen.getByLabelText('Delete Ingredient B');
    fireEvent.click(deleteButtonB);

    expect(mockDeleteIngredient).toHaveBeenCalledWith('2');
  });

  // Add tests for adding and editing ingredients
});