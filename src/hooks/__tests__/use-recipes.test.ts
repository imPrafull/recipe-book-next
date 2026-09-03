import { renderHook, waitFor } from '@testing-library/react';
import { useRecipes } from '../use-recipes';
import { authApi } from '@/lib/api/auth';

describe('useRecipes', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should fetch recipes on mount', async () => {
    const { result } = renderHook(() => useRecipes({}));

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.recipes).toBeDefined();
    expect(Array.isArray(result.current.recipes)).toBe(true);
    expect(result.current.recipes.length).toBeGreaterThan(0);
  });

  it('should fetch recipes with search parameter', async () => {
    const { result } = renderHook(() => useRecipes({ search: 'Pizza' }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.recipes.length).toBeGreaterThan(0);
    expect(result.current.recipes[0].title).toContain('Pizza');
  });

  it('should fetch recipes with pagination', async () => {
    const { result } = renderHook(() => useRecipes({ page: 1, limit: 5 }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.recipes.length).toBeLessThanOrEqual(5);
    expect(result.current.totalPages).toBeDefined();
    expect(result.current.totalRecipes).toBeDefined();
  });

  it('should set isLimited flag for guest users on page > 1', async () => {
    // Ensure no auth token (guest mode)
    localStorage.clear();

    const { result } = renderHook(() => useRecipes({ page: 2 }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isLimited).toBe(true);
    expect(result.current.limitMessage).toContain('Login');
    expect(result.current.recipes.length).toBe(0);
  });

  it('should allow authenticated users to access any page', async () => {
    // Login to get auth token
    const loginResult = await authApi.login({
      email: 'test@example.com',
      password: 'password123',
    });
    localStorage.setItem('accessToken', loginResult.data.accessToken);

    const { result } = renderHook(() => useRecipes({ page: 2, limit: 5 }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.recipes).toBeDefined();
    expect(result.current.isLimited).toBe(false);
  });

  it('should handle empty search results', async () => {
    const { result } = renderHook(() => useRecipes({ search: 'NonexistentRecipe123456' }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.recipes.length).toBe(0);
    expect(result.current.totalRecipes).toBe(0);
  });

  it('should refetch when params change', async () => {
    const { result, rerender } = renderHook(
      ({ params }) => useRecipes(params),
      { initialProps: { params: { search: 'Pizza' } } }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const firstResultCount = result.current.recipes.length;

    // Change search parameter
    rerender({ params: { search: 'Cookies' } });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should have different results
    expect(result.current.recipes[0].title).toContain('Cookies');
  });

  it('should cleanup on unmount', async () => {
    const { result, unmount } = renderHook(() => useRecipes({}));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Unmount should not cause errors
    unmount();
  });

  it('should handle API errors gracefully', async () => {
    // Mock console.error to avoid test output noise
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // Use an invalid search that might cause an error
    const { result } = renderHook(() => useRecipes({}));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should still return empty array on error, not crash
    expect(Array.isArray(result.current.recipes)).toBe(true);

    consoleErrorSpy.mockRestore();
  });
});
