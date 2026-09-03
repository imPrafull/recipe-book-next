import { render, screen } from '@testing-library/react';
import CollectionStrip from '../CollectionStrip';
import { createRecipe } from '@/mocks/fixtures';

// Mock useRecipes hook
const mockUseRecipes = jest.fn();
jest.mock('@/hooks/use-recipes', () => ({
  useRecipes: () => mockUseRecipes(),
}));

// Mock Next.js Link
jest.mock('next/link', () => {
  return ({ children, href, className, ...props }: any) => {
    return <a href={href} className={className} {...props}>{children}</a>;
  };
});

describe('CollectionStrip', () => {
  const mockRecipes = [
    createRecipe({ id: '1', title: 'Recipe 1' }),
    createRecipe({ id: '2', title: 'Recipe 2' }),
    createRecipe({ id: '3', title: 'Recipe 3' }),
    createRecipe({ id: '4', title: 'Recipe 4' }),
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading skeleton when loading', () => {
    mockUseRecipes.mockReturnValue({
      recipes: [],
      isLoading: true,
    });

    const { container } = render(<CollectionStrip currentRecipeId="current-recipe" />);
    
    expect(screen.getByText('You might also like')).toBeInTheDocument();
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBe(3);
  });

  it('should render related recipes excluding current recipe', () => {
    mockUseRecipes.mockReturnValue({
      recipes: mockRecipes,
      isLoading: false,
    });

    render(<CollectionStrip currentRecipeId="2" />);
    
    expect(screen.getByText('Recipe 1')).toBeInTheDocument();
    expect(screen.queryByText('Recipe 2')).not.toBeInTheDocument(); // Current recipe excluded
    expect(screen.getByText('Recipe 3')).toBeInTheDocument();
  });

  it('should limit to 3 related recipes', () => {
    const manyRecipes = [
      createRecipe({ id: '1', title: 'Recipe 1' }),
      createRecipe({ id: '2', title: 'Recipe 2' }),
      createRecipe({ id: '3', title: 'Recipe 3' }),
      createRecipe({ id: '4', title: 'Recipe 4' }),
      createRecipe({ id: '5', title: 'Recipe 5' }),
      createRecipe({ id: '6', title: 'Recipe 6' }),
    ];

    mockUseRecipes.mockReturnValue({
      recipes: manyRecipes,
      isLoading: false,
    });

    render(<CollectionStrip currentRecipeId="current" />);
    
    expect(screen.getByText('Recipe 1')).toBeInTheDocument();
    expect(screen.getByText('Recipe 2')).toBeInTheDocument();
    expect(screen.getByText('Recipe 3')).toBeInTheDocument();
    expect(screen.queryByText('Recipe 4')).not.toBeInTheDocument();
  });

  it('should return null when no related recipes available', () => {
    mockUseRecipes.mockReturnValue({
      recipes: [createRecipe({ id: 'current-recipe', title: 'Current' })],
      isLoading: false,
    });

    const { container } = render(<CollectionStrip currentRecipeId="current-recipe" />);
    
    expect(container.firstChild).toBeNull();
  });

  it('should render heading "You might also like"', () => {
    mockUseRecipes.mockReturnValue({
      recipes: mockRecipes,
      isLoading: false,
    });

    render(<CollectionStrip currentRecipeId="5" />);
    
    const heading = screen.getByText('You might also like');
    expect(heading).toBeInTheDocument();
    expect(heading.tagName).toBe('H3');
  });

  it('should call useRecipes with correct params', () => {
    mockUseRecipes.mockReturnValue({
      recipes: [],
      isLoading: false,
    });

    render(<CollectionStrip currentRecipeId="1" />);
    
    expect(mockUseRecipes).toHaveBeenCalledTimes(1);
  });

  it('should render recipe cards in grid layout', () => {
    mockUseRecipes.mockReturnValue({
      recipes: mockRecipes,
      isLoading: false,
    });

    const { container } = render(<CollectionStrip currentRecipeId="5" />);
    
    const grid = container.querySelector('.grid');
    expect(grid).toBeInTheDocument();
  });
});
