import { render, screen, fireEvent } from '@testing-library/react';
import FavouritesTeaser from '../FavouritesTeaser';

// Mock auth context
const mockUseAuth = jest.fn();
jest.mock('@/lib/auth-context', () => ({
  useAuth: () => mockUseAuth(),
}));

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

describe('FavouritesTeaser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('loading state', () => {
    it('should return null when auth is loading', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        isLoading: true,
      });

      const { container } = render(<FavouritesTeaser />);
      
      expect(container.firstChild).toBeNull();
    });
  });

  describe('guest user', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
      });
    });

    it('should render heading with heart icon', () => {
      render(<FavouritesTeaser />);
      
      expect(screen.getByText('My Favourites')).toBeInTheDocument();
      expect(screen.getByTestId('heart-icon')).toBeInTheDocument();
    });

    it('should show sign in prompt for guests', () => {
      render(<FavouritesTeaser />);
      
      expect(screen.getByText('Sign in to save favourites')).toBeInTheDocument();
      expect(screen.getByText(/Curate your own personal cookbook/i)).toBeInTheDocument();
    });

    it('should show lock icon for guests', () => {
      render(<FavouritesTeaser />);
      
      expect(screen.getByTestId('lock-icon')).toBeInTheDocument();
    });

    it('should show "Unlock Favourites" button for guests', () => {
      render(<FavouritesTeaser />);
      
      const unlockButton = screen.getByText('Unlock Favourites');
      expect(unlockButton).toBeInTheDocument();
    });

    it('should open auth modal when unlock button is clicked', () => {
      render(<FavouritesTeaser />);
      
      const unlockButton = screen.getByText('Unlock Favourites');
      fireEvent.click(unlockButton);
      
      expect(screen.getByTestId('auth-modal')).toBeInTheDocument();
      expect(screen.getByText(/Sign in to save and view your favourite recipes/i)).toBeInTheDocument();
    });

    it('should close auth modal when close is clicked', () => {
      render(<FavouritesTeaser />);
      
      const unlockButton = screen.getByText('Unlock Favourites');
      fireEvent.click(unlockButton);
      
      expect(screen.getByTestId('auth-modal')).toBeInTheDocument();
      
      const closeButton = screen.getByText('Close');
      fireEvent.click(closeButton);
      
      expect(screen.queryByTestId('auth-modal')).not.toBeInTheDocument();
    });
  });

  describe('authenticated user', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
      });
    });

    it('should show empty state for authenticated users', () => {
      render(<FavouritesTeaser />);
      
      expect(screen.getByText('No favourites yet')).toBeInTheDocument();
      expect(screen.getByText(/You haven't saved any favourites yet/i)).toBeInTheDocument();
    });

    it('should show heart icon in empty state', () => {
      render(<FavouritesTeaser />);
      
      const heartIcons = screen.getAllByTestId('heart-icon');
      expect(heartIcons.length).toBeGreaterThan(0);
    });

    it('should not show unlock button for authenticated users', () => {
      render(<FavouritesTeaser />);
      
      expect(screen.queryByText('Unlock Favourites')).not.toBeInTheDocument();
    });

    it('should not show lock icon for authenticated users', () => {
      render(<FavouritesTeaser />);
      
      expect(screen.queryByTestId('lock-icon')).not.toBeInTheDocument();
    });
  });

  describe('heading', () => {
    it('should render My Favourites heading with correct styling', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
      });

      render(<FavouritesTeaser />);
      
      const heading = screen.getByText('My Favourites');
      expect(heading.tagName).toBe('H2');
    });
  });
});
