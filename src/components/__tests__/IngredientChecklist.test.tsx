import { render, screen, fireEvent } from '@testing-library/react';
import IngredientChecklist from '../IngredientChecklist';
import type { Ingredient } from '@/lib/types';

describe('IngredientChecklist', () => {
  const mockIngredients: Ingredient[] = [
    {
      id: '1',
      name: 'Flour',
      quantity: 2,
      unit: 'cups',
      notes: 'all-purpose',
    },
    {
      id: '2',
      name: 'Sugar',
      quantity: 1,
      unit: 'cup',
      notes: '',
    },
    {
      id: '3',
      name: 'Eggs',
      quantity: 3,
      unit: '',
      notes: 'room temperature',
    },
  ];

  it('should render all ingredients', () => {
    render(<IngredientChecklist ingredients={mockIngredients} />);
    
    expect(screen.getByText(/Flour - 2 cups/i)).toBeInTheDocument();
    expect(screen.getByText(/Sugar - 1 cup/i)).toBeInTheDocument();
    expect(screen.getByText(/Eggs - 3/i)).toBeInTheDocument();
  });

  it('should show ingredients count in header', () => {
    render(<IngredientChecklist ingredients={mockIngredients} />);
    
    expect(screen.getByText(/Ingredients \(0\/3 ready\)/i)).toBeInTheDocument();
  });

  it('should display empty state when no ingredients', () => {
    render(<IngredientChecklist ingredients={[]} />);
    
    expect(screen.getByText(/No ingredients listed/i)).toBeInTheDocument();
  });

  it('should toggle ingredient checked state when clicked', () => {
    render(<IngredientChecklist ingredients={mockIngredients} />);
    
    const firstIngredient = screen.getByText(/Flour - 2 cups/i).closest('button');
    expect(firstIngredient).toBeInTheDocument();
    
    fireEvent.click(firstIngredient!);
    
    // After checking, count should update
    expect(screen.getByText(/Ingredients \(1\/3 ready\)/i)).toBeInTheDocument();
  });

  it('should show reset button when items are checked', () => {
    render(<IngredientChecklist ingredients={mockIngredients} />);
    
    // Initially no reset button
    expect(screen.queryByText(/Reset checklist/i)).not.toBeInTheDocument();
    
    // Check an item
    const button = screen.getByText(/Flour - 2 cups/i).closest('button');
    fireEvent.click(button!);
    
    // Now reset button should appear
    expect(screen.getByText(/Reset checklist/i)).toBeInTheDocument();
  });

  it('should reset all checked items when reset button is clicked', () => {
    render(<IngredientChecklist ingredients={mockIngredients} />);
    
    // Check two items by clicking their buttons
    const buttons = screen.getAllByRole('button').filter(btn => btn.textContent?.includes('cups') || btn.textContent?.includes('Eggs'));
    fireEvent.click(buttons[0]);
    fireEvent.click(buttons[1]);
    
    expect(screen.getByText(/Ingredients \(2\/3 ready\)/i)).toBeInTheDocument();
    
    // Click reset
    const resetButton = screen.getByText(/Reset checklist/i);
    fireEvent.click(resetButton);
    
    // Count should be back to 0
    expect(screen.getByText(/Ingredients \(0\/3 ready\)/i)).toBeInTheDocument();
  });

  it('should calculate progress percentage correctly', () => {
    const { container } = render(<IngredientChecklist ingredients={mockIngredients} />);
    
    const buttons = screen.getAllByRole('button').filter(btn => 
      btn.textContent?.includes('Flour') || 
      btn.textContent?.includes('Sugar') || 
      btn.textContent?.includes('Eggs')
    );
    
    // Check 1 of 3 (33%)
    fireEvent.click(buttons[0]);
    let progressBar = container.querySelector('.bg-primary');
    expect(progressBar).toHaveStyle({ width: '33%' });
    
    // Check 2 of 3 (67%)
    fireEvent.click(buttons[1]);
    progressBar = container.querySelector('.bg-primary');
    expect(progressBar).toHaveStyle({ width: '67%' });
    
    // Check 3 of 3 (100%)
    fireEvent.click(buttons[2]);
    progressBar = container.querySelector('.bg-primary');
    expect(progressBar).toHaveStyle({ width: '100%' });
  });

  it('should uncheck an item when clicked again', () => {
    render(<IngredientChecklist ingredients={mockIngredients} />);
    
    const button = screen.getByText(/Flour - 2 cups/i).closest('button');
    
    // Check
    fireEvent.click(button!);
    expect(screen.getByText(/Ingredients \(1\/3 ready\)/i)).toBeInTheDocument();
    
    // Uncheck
    fireEvent.click(button!);
    expect(screen.getByText(/Ingredients \(0\/3 ready\)/i)).toBeInTheDocument();
  });

  it('should display ingredient notes when provided', () => {
    render(<IngredientChecklist ingredients={mockIngredients} />);
    
    expect(screen.getByText(/all-purpose/i)).toBeInTheDocument();
    expect(screen.getByText(/room temperature/i)).toBeInTheDocument();
  });

  it('should handle ingredients without quantity', () => {
    const ingredientsWithoutQty: Ingredient[] = [
      {
        id: '1',
        name: 'Salt',
        quantity: 0,
        unit: '',
        notes: 'to taste',
      },
    ];
    
    render(<IngredientChecklist ingredients={ingredientsWithoutQty} />);
    
    expect(screen.getByText(/Salt/i)).toBeInTheDocument();
  });

  it('should handle ingredients with quantity but no unit', () => {
    const ingredientsWithoutUnit: Ingredient[] = [
      {
        id: '1',
        name: 'Apples',
        quantity: 3,
        unit: '',
        notes: '',
      },
    ];
    
    render(<IngredientChecklist ingredients={ingredientsWithoutUnit} />);
    
    expect(screen.getByText(/Apples - 3/i)).toBeInTheDocument();
  });
});
