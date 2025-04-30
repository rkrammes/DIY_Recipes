import { render, screen, fireEvent } from '@testing-library/react';
import IngredientEditor from '../components/IngredientEditor';
import '@testing-library/jest-dom';

// Mock the useIngredients hook (if used for saving/updating)
jest.mock('../hooks/useIngredients', () => ({
  useIngredients: () => ({
    createIngredient: jest.fn(),
    updateIngredient: jest.fn(),
    loading: false,
    error: null,
  }),
}));

describe('IngredientEditor', () => {
  it('renders without crashing', () => {
    render(<IngredientEditor />);
    expect(screen.getByLabelText('Ingredient Name')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Save Ingredient/i })).toBeInTheDocument();
  });

  it('handles form submission for creating a new ingredient', async () => {
    const createIngredientMock = jest.fn();
    jest.mock('../hooks/useIngredients', () => ({
      useIngredients: () => ({
        createIngredient: createIngredientMock,
        updateIngredient: jest.fn(),
        loading: false,
        error: null,
      }),
    }));

    render(<IngredientEditor />);

    const nameInput = screen.getByLabelText('Ingredient Name');
    const saveButton = screen.getByRole('button', { name: /Save Ingredient/i });

    fireEvent.change(nameInput, { target: { value: 'New Ingredient' } });
    fireEvent.click(saveButton);

    expect(createIngredientMock).toHaveBeenCalledWith({ name: 'New Ingredient' });
  });

  // Add more tests here for validation, editing existing ingredients, etc.
});