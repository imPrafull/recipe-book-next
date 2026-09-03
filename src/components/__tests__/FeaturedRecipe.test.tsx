import { render, screen } from '@testing-library/react';
import FeaturedRecipe from '../FeaturedRecipe';
import { createRecipe } from '@/mocks/fixtures';

// Mock Next.js Link
jest.mock('next/link', () => {
  return ({ children, href, className, ...props }: any) => {
    return <a href={href} className={className} {...props}>{children}</a>;
  };
});

describe('FeaturedRecipe', () => {
  const mockRecipe = createRecipe({
    id: 'featured-1',
    title: 'Amazing Pasta Carbonara',
    description: 'Creamy and delicious Italian classic',
    cookingTime: 30,
    image: 'https://example.com/carbonara.jpg',
  });

  it('should render recipe title', () => {
    render(<FeaturedRecipe recipe={mockRecipe} />);
    
    expect(screen.getByText('Amazing Pasta Carbonara')).toBeInTheDocument();
  });

  it('should render recipe description in quotes', () => {
    render(<FeaturedRecipe recipe={mockRecipe} />);
    
    expect(screen.getByText('"Creamy and delicious Italian classic"')).toBeInTheDocument();
  });

  it('should render cooking time with icon', () => {
    render(<FeaturedRecipe recipe={mockRecipe} />);
    
    expect(screen.getByText('30 min')).toBeInTheDocument();
    expect(screen.getByTestId('clock-icon')).toBeInTheDocument();
  });

  it('should render "This Week\'s Focus" header', () => {
    render(<FeaturedRecipe recipe={mockRecipe} />);
    
    expect(screen.getByText("This Week's Focus")).toBeInTheDocument();
  });

  it('should render "Get the Recipe" call to action', () => {
    render(<FeaturedRecipe recipe={mockRecipe} />);
    
    expect(screen.getByText(/Get the Recipe/i)).toBeInTheDocument();
  });

  it('should link to recipe detail page', () => {
    render(<FeaturedRecipe recipe={mockRecipe} />);
    
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/recipes/featured-1');
  });

  it('should render recipe image with correct src', () => {
    render(<FeaturedRecipe recipe={mockRecipe} />);
    
    const image = screen.getByAltText('Amazing Pasta Carbonara');
    expect(image).toHaveAttribute('src', 'https://example.com/carbonara.jpg');
  });

  it('should use default image when recipe has no image', () => {
    const recipeWithoutImage = createRecipe({
      id: 'featured-2',
      title: 'Test Recipe',
      description: 'Test description',
      image: '',
    });
    
    render(<FeaturedRecipe recipe={recipeWithoutImage} />);
    
    const image = screen.getByAltText('Test Recipe');
    expect(image).toHaveAttribute('src', expect.stringContaining('unsplash.com'));
  });

  it('should have proper hover effects on card', () => {
    const { container } = render(<FeaturedRecipe recipe={mockRecipe} />);
    
    const link = container.querySelector('a');
    expect(link).toHaveClass('group');
  });

  it('should render ChevronRight icon in call to action', () => {
    render(<FeaturedRecipe recipe={mockRecipe} />);
    
    expect(screen.getByTestId('chevron-right-icon')).toBeInTheDocument();
  });
});
