import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ActionButtons from '../ActionButtons';

// Mock auth context
const mockUseAuth = jest.fn();
jest.mock('@/lib/auth-context', () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
  },
}));

// Import toast after mocking
import { toast } from 'sonner';

// Mock AuthModal
jest.mock('../AuthModal', () => {
  return function AuthModal({ isOpen, onClose, message }: any) {
    if (!isOpen) return null;
    return (
      <div data-testid="auth-modal">
        <div>{message}</div>
        <button onClick={onClose}>Close</button>
      </div>
    );
  };
});

describe('ActionButtons', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('when user is authenticated', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
      });
    });

    it('should render favourite button', () => {
      render(<ActionButtons />);
      
      const favouriteButton = screen.getByLabelText('Save to Favourites');
      expect(favouriteButton).toBeInTheDocument();
    });

    it('should render meal plan button', () => {
      render(<ActionButtons />);
      
      const mealPlanButton = screen.getByLabelText('Add to Meal Plan');
      expect(mealPlanButton).toBeInTheDocument();
    });

    it('should show toast when clicking favourite button', async () => {
      render(<ActionButtons />);
      
      const favouriteButton = screen.getByLabelText('Save to Favourites');
      fireEvent.click(favouriteButton);
      
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Favourites coming soon!');
      });
    });

    it('should show toast when clicking meal plan button', async () => {
      render(<ActionButtons />);
      
      const mealPlanButton = screen.getByLabelText('Add to Meal Plan');
      fireEvent.click(mealPlanButton);
      
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Meal planner coming soon!');
      });
    });

    it('should not show auth modal when authenticated', () => {
      render(<ActionButtons />);
      
      const favouriteButton = screen.getByLabelText('Save to Favourites');
      fireEvent.click(favouriteButton);
      
      expect(screen.queryByTestId('auth-modal')).not.toBeInTheDocument();
    });
  });

  describe('when user is not authenticated', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
      });
    });

    it('should show auth modal when clicking favourite button', async () => {
      render(<ActionButtons />);
      
      const favouriteButton = screen.getByLabelText('Save to Favourites');
      fireEvent.click(favouriteButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('auth-modal')).toBeInTheDocument();
      });
      
      expect(screen.getByText(/Sign in to save this recipe to your favourites/i)).toBeInTheDocument();
    });

    it('should show auth modal when clicking meal plan button', async () => {
      render(<ActionButtons />);
      
      const mealPlanButton = screen.getByLabelText('Add to Meal Plan');
      fireEvent.click(mealPlanButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('auth-modal')).toBeInTheDocument();
      });
      
      expect(screen.getByText(/Sign in to add this recipe to your meal plan/i)).toBeInTheDocument();
    });

    it('should not show toast when not authenticated', () => {
      render(<ActionButtons />);
      
      const favouriteButton = screen.getByLabelText('Save to Favourites');
      fireEvent.click(favouriteButton);
      
      expect(toast.success).not.toHaveBeenCalled();
    });

    it('should close auth modal when close button is clicked', async () => {
      render(<ActionButtons />);
      
      const favouriteButton = screen.getByLabelText('Save to Favourites');
      fireEvent.click(favouriteButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('auth-modal')).toBeInTheDocument();
      });
      
      const closeButton = screen.getByText('Close');
      fireEvent.click(closeButton);
      
      await waitFor(() => {
        expect(screen.queryByTestId('auth-modal')).not.toBeInTheDocument();
      });
    });
  });

  describe('when loading', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        isLoading: true,
      });
    });

    it('should not trigger actions when loading', () => {
      render(<ActionButtons />);
      
      const favouriteButton = screen.getByLabelText('Save to Favourites');
      fireEvent.click(favouriteButton);
      
      expect(toast.success).not.toHaveBeenCalled();
      expect(screen.queryByTestId('auth-modal')).not.toBeInTheDocument();
    });
  });

  describe('tooltips', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
      });
    });

    it('should show tooltip for favourite button', () => {
      render(<ActionButtons />);
      
      const tooltip = screen.getByText('Save to Favourites');
      expect(tooltip).toBeInTheDocument();
    });

    it('should show tooltip for meal plan button', () => {
      render(<ActionButtons />);
      
      const tooltip = screen.getByText('Add to Meal Plan');
      expect(tooltip).toBeInTheDocument();
    });
  });
});
