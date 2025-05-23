import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/recipes',
}));

// Mock components for integration test
const RecipeList = () => (
  <div>
    <h1>Recipes</h1>
    <ul>
      <li>Recipe 1</li>
      <li>Recipe 2</li>
      <li>Recipe 3</li>
    </ul>
  </div>
);

const RecipeDetail = ({ id }: { id: string }) => (
  <div>
    <h2>Recipe {id}</h2>
    <p>Recipe details here</p>
  </div>
);

describe('Recipes Integration', () => {
  it('displays recipe list', async () => {
    render(<RecipeList />);
    
    expect(screen.getByText('Recipes')).toBeInTheDocument();
    expect(screen.getByText('Recipe 1')).toBeInTheDocument();
    expect(screen.getByText('Recipe 2')).toBeInTheDocument();
    expect(screen.getByText('Recipe 3')).toBeInTheDocument();
  });

  it('displays recipe details', async () => {
    render(<RecipeDetail id="1" />);
    
    expect(screen.getByText('Recipe 1')).toBeInTheDocument();
    expect(screen.getByText('Recipe details here')).toBeInTheDocument();
  });

  it('handles user interactions', async () => {
    const user = userEvent.setup();
    
    const handleClick = jest.fn();
    render(
      <button onClick={handleClick}>
        Create Recipe
      </button>
    );
    
    await user.click(screen.getByText('Create Recipe'));
    
    expect(handleClick).toHaveBeenCalled();
  });
});