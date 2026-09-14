import { render, screen, fireEvent } from '@testing-library/react';
import RecipeCard from '../RecipeCard';
import { createRecipe } from '@/mocks/fixtures';

// Mock Next.js Link component
jest.mock('next/link', () => {
  return ({ children, href, className, ...props }: any) => {
    return <a href={href} className={className} {...props}>{children}</a>;
  };
});

describe('RecipeCard', () => {
  const mockRecipe = createRecipe({
    id: 'test-recipe-1',
    title: 'Test Recipe',
    description: 'A delicious test recipe',
    cookingTime: 30,
    image: 'https://example.com/image.jpg',
  });

  describe('basic rendering', () => {
    it('should render recipe title', () => {
      render(<RecipeCard recipe={mockRecipe} />);
      
      expect(screen.getByText('Test Recipe')).toBeInTheDocument();
    });

    it('should render recipe description', () => {
      // Description only shows in landscape variant
      render(<RecipeCard recipe={mockRecipe} variant="landscape" />);
      
      expect(screen.getByText('A delicious test recipe')).toBeInTheDocument();
    });

    it('should render cooking time', () => {
      render(<RecipeCard recipe={mockRecipe} />);
      
      expect(screen.getByText('30 mins')).toBeInTheDocument();
    });

    it('should render recipe image when provided', () => {
      render(<RecipeCard recipe={mockRecipe} />);
      
      const image = screen.getByAltText('Test Recipe');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
    });

    it('should render fallback gradient when no image provided', () => {
      const recipeWithoutImage = createRecipe({
        title: 'No Image Recipe',
        image: '',
      });
      
      render(<RecipeCard recipe={recipeWithoutImage} />);
      
      // Should render chef hat icon as fallback
      const chefHat = screen.getByTestId('chef-hat-icon');
      expect(chefHat).toBeInTheDocument();
    });
  });

  describe('favorite functionality', () => {
    it('should toggle favorite state when heart icon clicked', () => {
      render(<RecipeCard recipe={mockRecipe} />);
      
      const favoriteButton = screen.getByRole('button', { name: '' });
      
      // Click to favorite
      fireEvent.click(favoriteButton);
      
      const heartIcon = favoriteButton.querySelector('.fill-rose-500');
      expect(heartIcon).toBeInTheDocument();
      
      // Click to unfavorite
      fireEvent.click(favoriteButton);
    });

    it('should prevent navigation when favorite button clicked', () => {
      render(<RecipeCard recipe={mockRecipe} />);
      
      const favoriteButton = screen.getByRole('button', { name: '' });
      const clickEvent = new MouseEvent('click', { bubbles: true });
      const preventDefaultSpy = jest.spyOn(clickEvent, 'preventDefault');
      
      fireEvent(favoriteButton, clickEvent);
      
      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });

  describe('guest mode / locked recipe', () => {
    it('should display lock overlay when recipe is locked', () => {
      const lockedRecipe = createRecipe({
        ...mockRecipe,
        isLocked: true,
      });
      
      render(<RecipeCard recipe={lockedRecipe} />);
      
      // Should show lock icon
      const lockIcon = screen.getByTestId('lock-icon');
      expect(lockIcon).toBeInTheDocument();
    });

    it('should not display lock overlay when recipe is not locked', () => {
      render(<RecipeCard recipe={mockRecipe} />);
      
      const lockIcon = screen.queryByTestId('lock-icon');
      expect(lockIcon).not.toBeInTheDocument();
    });

    it('should render lock icon for locked recipes', () => {
      const lockedRecipe = createRecipe({
        ...mockRecipe,
        isLocked: true,
      });
      
      render(<RecipeCard recipe={lockedRecipe} />);
      
      // Check for Lock icon presence
      const lockIcon = screen.getByTestId('lock-icon');
      expect(lockIcon).toBeInTheDocument();
    });
  });

  describe('variants', () => {
    it('should render portrait variant by default', () => {
      const { container } = render(<RecipeCard recipe={mockRecipe} />);
      
      // Portrait variant should have flex-col class (landscape has flex-row-like structure)
      const link = container.querySelector('a');
      expect(link).toHaveClass('flex-col');
    });

    it('should render landscape variant when specified', () => {
      render(<RecipeCard recipe={mockRecipe} variant="landscape" />);
      
      // Should still render the recipe content
      expect(screen.getByText('Test Recipe')).toBeInTheDocument();
    });
  });

  describe('link behavior', () => {
    it('should link to recipe detail page', () => {
      const { container } = render(<RecipeCard recipe={mockRecipe} />);
      
      const link = container.querySelector('a');
      expect(link).toHaveAttribute('href', '/recipes/test-recipe-1');
    });
  });

  describe('fallback color generation', () => {
    it('should generate consistent colors for same title', () => {
      const recipe1 = createRecipe({ title: 'Consistent Title', image: '' });
      const recipe2 = createRecipe({ title: 'Consistent Title', image: '' });
      
      const { container: container1 } = render(<RecipeCard recipe={recipe1} />);
      const { container: container2 } = render(<RecipeCard recipe={recipe2} />);
      
      const gradient1 = container1.querySelector('.bg-gradient-to-br');
      const gradient2 = container2.querySelector('.bg-gradient-to-br');
      
      // Both should have the same gradient class
      expect(gradient1?.className).toBe(gradient2?.className);
    });

    it('should generate different colors for different titles', () => {
      const recipe1 = createRecipe({ title: 'Title A', image: '' });
      const recipe2 = createRecipe({ title: 'Title B', image: '' });
      
      const { container: container1 } = render(<RecipeCard recipe={recipe1} />);
      const { container: container2 } = render(<RecipeCard recipe={recipe2} />);
      
      const gradient1 = container1.querySelector('.bg-gradient-to-br');
      const gradient2 = container2.querySelector('.bg-gradient-to-br');
      
      // Different titles should likely have different gradients
      // (not guaranteed but highly probable)
      expect(gradient1?.className).not.toBe(gradient2?.className);
    });
  });
});
