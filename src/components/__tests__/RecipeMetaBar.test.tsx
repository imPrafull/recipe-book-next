import { render, screen } from '@testing-library/react';
import RecipeMetaBar from '../RecipeMetaBar';

describe('RecipeMetaBar', () => {
  it('should render cooking time', () => {
    render(<RecipeMetaBar cookingTime={30} />);
    
    expect(screen.getByText('30 mins')).toBeInTheDocument();
  });

  it('should render servings information', () => {
    render(<RecipeMetaBar cookingTime={45} />);
    
    expect(screen.getByText('4 Servings')).toBeInTheDocument();
  });

  it('should render meal type badge', () => {
    render(<RecipeMetaBar cookingTime={20} />);
    
    expect(screen.getByText('Dinner')).toBeInTheDocument();
  });

  it('should render clock icon', () => {
    render(<RecipeMetaBar cookingTime={15} />);
    
    const clockIcon = screen.getByTestId('clock-icon');
    expect(clockIcon).toBeInTheDocument();
  });

  it('should render users icon', () => {
    render(<RecipeMetaBar cookingTime={25} />);
    
    const usersIcon = screen.getByTestId('users-icon');
    expect(usersIcon).toBeInTheDocument();
  });

  it('should handle different cooking times', () => {
    const { rerender } = render(<RecipeMetaBar cookingTime={5} />);
    expect(screen.getByText('5 mins')).toBeInTheDocument();
    
    rerender(<RecipeMetaBar cookingTime={120} />);
    expect(screen.getByText('120 mins')).toBeInTheDocument();
  });

  it('should render dividers between sections', () => {
    const { container } = render(<RecipeMetaBar cookingTime={30} />);
    
    const dividers = container.querySelectorAll('.bg-border');
    expect(dividers.length).toBeGreaterThan(0);
  });

  it('should have proper styling classes', () => {
    const { container } = render(<RecipeMetaBar cookingTime={30} />);
    
    const mainContainer = container.querySelector('.flex');
    expect(mainContainer).toHaveClass('flex-wrap', 'items-center');
  });
});
