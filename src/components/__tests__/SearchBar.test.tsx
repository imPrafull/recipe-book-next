import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter, useSearchParams } from 'next/navigation';
import SearchBar from '../SearchBar';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

describe('SearchBar', () => {
  const mockPush = jest.fn();
  const mockSearchParams = {
    get: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
    mockSearchParams.get.mockReturnValue('');
  });

  describe('navbar variant', () => {
    it('should render search input with placeholder', () => {
      render(<SearchBar variant="navbar" />);
      
      const input = screen.getByPlaceholderText('Search recipes...');
      expect(input).toBeInTheDocument();
    });

    it('should update query state when typing', () => {
      render(<SearchBar variant="navbar" />);
      
      const input = screen.getByPlaceholderText('Search recipes...');
      fireEvent.change(input, { target: { value: 'pizza' } });
      
      expect(input).toHaveValue('pizza');
    });

    it('should navigate to recipes page with search query on submit', async () => {
      render(<SearchBar variant="navbar" />);
      
      const input = screen.getByPlaceholderText('Search recipes...');
      fireEvent.change(input, { target: { value: 'pasta' } });
      
      const form = input.closest('form');
      fireEvent.submit(form!);
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/recipes?search=pasta');
      });
    });

    it('should navigate to recipes page without query when search is empty', async () => {
      render(<SearchBar variant="navbar" />);
      
      const input = screen.getByPlaceholderText('Search recipes...');
      const form = input.closest('form');
      fireEvent.submit(form!);
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/recipes');
      });
    });

    it('should sync with URL query parameter', () => {
      mockSearchParams.get.mockReturnValue('chicken');
      
      render(<SearchBar variant="navbar" />);
      
      const input = screen.getByPlaceholderText('Search recipes...');
      expect(input).toHaveValue('chicken');
    });

    it('should trim whitespace from query', async () => {
      render(<SearchBar variant="navbar" />);
      
      const input = screen.getByPlaceholderText('Search recipes...');
      fireEvent.change(input, { target: { value: '  tacos  ' } });
      
      const form = input.closest('form');
      fireEvent.submit(form!);
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/recipes?search=tacos');
      });
    });
  });

  describe('hero variant', () => {
    it('should render with hero-specific placeholder', () => {
      render(<SearchBar variant="hero" />);
      
      const input = screen.getByPlaceholderText('Search for recipes, ingredients...');
      expect(input).toBeInTheDocument();
    });

    it('should have correct styling classes for hero variant', () => {
      render(<SearchBar variant="hero" />);
      
      const input = screen.getByPlaceholderText('Search for recipes, ingredients...');
      const form = input.closest('form');
      
      expect(form).toHaveClass('max-w-[600px]');
    });

    it('should handle search submission in hero variant', async () => {
      render(<SearchBar variant="hero" />);
      
      const input = screen.getByPlaceholderText('Search for recipes, ingredients...');
      fireEvent.change(input, { target: { value: 'desserts' } });
      
      const form = input.closest('form');
      fireEvent.submit(form!);
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/recipes?search=desserts');
      });
    });
  });

  describe('URL encoding', () => {
    it('should encode special characters in search query', async () => {
      render(<SearchBar variant="navbar" />);
      
      const input = screen.getByPlaceholderText('Search recipes...');
      fireEvent.change(input, { target: { value: 'mac & cheese' } });
      
      const form = input.closest('form');
      fireEvent.submit(form!);
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/recipes?search=mac%20%26%20cheese');
      });
    });
  });
});
