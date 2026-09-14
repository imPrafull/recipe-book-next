import { render, screen, fireEvent } from '@testing-library/react';
import StepBlock from '../StepBlock';

describe('StepBlock', () => {
  const mockSteps = [
    'Preheat oven to 350°F',
    'Mix dry ingredients',
    'Add wet ingredients',
    'Bake for 30 minutes',
  ];

  describe('basic rendering', () => {
    it('should render all steps', () => {
      render(<StepBlock steps={mockSteps} />);
      
      expect(screen.getByText('Preheat oven to 350°F')).toBeInTheDocument();
      expect(screen.getByText('Mix dry ingredients')).toBeInTheDocument();
      expect(screen.getByText('Add wet ingredients')).toBeInTheDocument();
      expect(screen.getByText('Bake for 30 minutes')).toBeInTheDocument();
    });

    it('should display step numbers', () => {
      render(<StepBlock steps={mockSteps} />);
      
      expect(screen.getByText(/Step 01/i)).toBeInTheDocument();
      expect(screen.getByText(/Step 02/i)).toBeInTheDocument();
      expect(screen.getByText(/Step 03/i)).toBeInTheDocument();
      expect(screen.getByText(/Step 04/i)).toBeInTheDocument();
    });

    it('should show empty state when no steps', () => {
      render(<StepBlock steps={[]} />);
      
      expect(screen.getByText(/No steps listed/i)).toBeInTheDocument();
    });
  });

  describe('cook mode', () => {
    it('should show progress header in cook mode', () => {
      render(
        <StepBlock 
          steps={mockSteps} 
          isCookMode={true}
          completedCount={1}
          totalCount={4}
        />
      );
      
      expect(screen.getByText(/Steps \(1\/4 completed\)/i)).toBeInTheDocument();
    });

    it('should not show progress header when not in cook mode', () => {
      render(<StepBlock steps={mockSteps} isCookMode={false} />);
      
      expect(screen.queryByText(/Steps/i)).not.toBeInTheDocument();
    });

    it('should show reset button when steps are completed in cook mode', () => {
      render(
        <StepBlock 
          steps={mockSteps} 
          isCookMode={true}
          completedCount={2}
          totalCount={4}
          onResetSteps={jest.fn()}
        />
      );
      
      expect(screen.getByText(/Reset steps/i)).toBeInTheDocument();
    });

    it('should not show reset button when no steps completed', () => {
      render(
        <StepBlock 
          steps={mockSteps} 
          isCookMode={true}
          completedCount={0}
          totalCount={4}
          onResetSteps={jest.fn()}
        />
      );
      
      expect(screen.queryByText(/Reset steps/i)).not.toBeInTheDocument();
    });

    it('should call onResetSteps when reset button is clicked', () => {
      const onResetSteps = jest.fn();
      render(
        <StepBlock 
          steps={mockSteps} 
          isCookMode={true}
          completedCount={2}
          totalCount={4}
          onResetSteps={onResetSteps}
        />
      );
      
      const resetButton = screen.getByText(/Reset steps/i);
      fireEvent.click(resetButton);
      
      expect(onResetSteps).toHaveBeenCalledTimes(1);
    });

    it('should show progress bar in cook mode', () => {
      const { container } = render(
        <StepBlock 
          steps={mockSteps} 
          isCookMode={true}
          completedCount={2}
          totalCount={4}
          progressPercent={50}
        />
      );
      
      const progressBar = container.querySelector('.bg-secondary');
      expect(progressBar).toBeInTheDocument();
      expect(progressBar).toHaveStyle({ width: '50%' });
    });

    it('should apply completed styling to completed steps', () => {
      const completedSteps = new Set([0, 1]);
      render(
        <StepBlock 
          steps={mockSteps} 
          isCookMode={true}
          completedSteps={completedSteps}
          onToggleStep={jest.fn()}
        />
      );
      
      // Check for completed step indicators
      const completedIndicators = screen.getAllByText('Completed');
      expect(completedIndicators.length).toBe(2);
    });

    it('should call onToggleStep when a step is clicked in cook mode', () => {
      const onToggleStep = jest.fn();
      render(
        <StepBlock 
          steps={mockSteps} 
          isCookMode={true}
          completedSteps={new Set()}
          onToggleStep={onToggleStep}
        />
      );
      
      const firstStep = screen.getByText('Preheat oven to 350°F').closest('div[role="button"]');
      fireEvent.click(firstStep!);
      
      expect(onToggleStep).toHaveBeenCalledWith(0);
    });

    it('should show check icon for completed steps', () => {
      const completedSteps = new Set([0]);
      render(
        <StepBlock 
          steps={mockSteps} 
          isCookMode={true}
          completedSteps={completedSteps}
        />
      );
      
      const checkIcons = screen.getAllByTestId('check-icon');
      expect(checkIcons.length).toBeGreaterThan(0);
    });
  });

  describe('default mode (not cook mode)', () => {
    it('should render steps as simple list', () => {
      render(<StepBlock steps={mockSteps} isCookMode={false} />);
      
      mockSteps.forEach(step => {
        expect(screen.getByText(step)).toBeInTheDocument();
      });
    });

    it('should not have click handlers in default mode', () => {
      const onToggleStep = jest.fn();
      render(
        <StepBlock 
          steps={mockSteps} 
          isCookMode={false}
          onToggleStep={onToggleStep}
        />
      );
      
      const firstStep = screen.getByText('Preheat oven to 350°F');
      fireEvent.click(firstStep);
      
      // onToggleStep should not be called in default mode
      expect(onToggleStep).not.toHaveBeenCalled();
    });
  });
});
