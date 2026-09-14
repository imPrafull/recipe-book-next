import { render, screen } from '@testing-library/react';
import RecipeGrid from '../RecipeGrid';
import { createRecipe } from '@/mocks/fixtures';

// Mock Next.js Link
jest.mock('next/link', () => {
  return ({ children, href, className, ...props }: any) => {
    return <a href={href} className={className} {...props}>{children}</a>;
  };
});

describe('RecipeGrid', () => {
  const mockRecipes = [
    createRecipe({ id: '1', title: 'Recipe 1' }),
    createRecipe({ id: '2', title: 'Recipe 2' }),
    createRecipe({ id: '3', title: 'Recipe 3' }),
  ];

  describe('loading state', () => {
    it('should show loading skeleton when isLoading is true', () => {
      const { container } = render(<RecipeGrid recipes={[]} isLoading={true} />);
      
      const skeletons = container.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBe(6);
    });

    it('should show landscape skeleton for every 3rd item in mixed layout', () => {
      const { container } = render(<RecipeGrid recipes={[]} isLoading={true} layout="mixed" />);
      
      const landscapes = container.querySelectorAll('.sm\\:col-span-2');
      expect(landscapes.length).toBeGreaterThan(0);
    });

    it('should show portrait skeletons in simple layout', () => {
      const { container } = render(<RecipeGrid recipes={[]} isLoading={true} layout="simple" />);
      
      const skeletons = container.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBe(6);
    });
  });

  describe('empty state', () => {
    it('should show "nothing found" message when search returns no results', () => {
      render(<RecipeGrid recipes={[]} searchTerm="pizza" />);
      
      expect(screen.getByText(/Nothing found for/i)).toBeInTheDocument();
      expect(screen.getByText('"pizza"')).toBeInTheDocument();
    });

    it('should show clear search button when onClearSearch is provided', () => {
      const onClearSearch = jest.fn();
      render(<RecipeGrid recipes={[]} searchTerm="pasta" onClearSearch={onClearSearch} />);
      
      const clearButton = screen.getByText('Clear search');
      expect(clearButton).toBeInTheDocument();
    });

    it('should not show clear search button when onClearSearch is not provided', () => {
      render(<RecipeGrid recipes={[]} searchTerm="pasta" />);
      
      const clearButton = screen.queryByText('Clear search');
      expect(clearButton).not.toBeInTheDocument();
    });

    it('should return null when no recipes and no search term', () => {
      const { container } = render(<RecipeGrid recipes={[]} />);
      
      expect(container.firstChild).toBeNull();
    });
  });

  describe('simple layout', () => {
    it('should render recipes in grid with portrait cards', () => {
      render(<RecipeGrid recipes={mockRecipes} layout="simple" />);
      
      expect(screen.getByText('Recipe 1')).toBeInTheDocument();
      expect(screen.getByText('Recipe 2')).toBeInTheDocument();
      expect(screen.getByText('Recipe 3')).toBeInTheDocument();
    });

    it('should use portrait variant for all cards in simple layout', () => {
      const { container } = render(<RecipeGrid recipes={mockRecipes} layout="simple" />);
      
      const grid = container.querySelector('.grid');
      expect(grid).toHaveClass('sm:grid-cols-2', 'lg:grid-cols-3');
    });
  });

  describe('mixed layout', () => {
    it('should render recipes in mixed layout by default', () => {
      render(<RecipeGrid recipes={mockRecipes} />);
      
      expect(screen.getByText('Recipe 1')).toBeInTheDocument();
      expect(screen.getByText('Recipe 2')).toBeInTheDocument();
      expect(screen.getByText('Recipe 3')).toBeInTheDocument();
    });

    it('should render landscape card for every 3rd recipe (0, 3, 6...)', () => {
      const manyRecipes = Array.from({ length: 7 }, (_, i) =>
        createRecipe({ id: `${i}`, title: `Recipe ${i}` })
      );
      
      const { container } = render(<RecipeGrid recipes={manyRecipes} layout="mixed" />);
      
      const landscapes = container.querySelectorAll('.sm\\:col-span-2');
      expect(landscapes.length).toBeGreaterThan(0);
    });

    it('should handle empty recipes array', () => {
      const { container } = render(<RecipeGrid recipes={[]} />);
      
      expect(container.firstChild).toBeNull();
    });
  });
});
