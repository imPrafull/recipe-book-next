import { renderHook, waitFor } from '@testing-library/react';
import { useRecipe } from '../use-recipe';
import { authApi } from '@/lib/api/auth';

// Mock the auth context
jest.mock('@/lib/auth-context', () => ({
  useAuth: jest.fn(() => ({
    isLoading: false,
    user: null,
  })),
}));

describe('useRecipe', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should fetch recipe by ID', async () => {
    const { result } = renderHook(() => useRecipe('recipe-1', false));

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.recipe).toBeDefined();
    expect(result.current.recipe?.id).toBe('recipe-1');
    expect(result.current.recipe?.title).toBeDefined();
  });

  it('should hide ingredients and steps for guest users', async () => {
    // Guest user (not authenticated)
    const { result } = renderHook(() => useRecipe('recipe-1', false));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.recipe).toBeDefined();
    expect(result.current.recipe?.ingredients).toBeUndefined();
    expect(result.current.recipe?.steps).toBeUndefined();
    expect(result.current.isLimited).toBe(true);
    expect(result.current.limitMessage).toContain('Login');
  });

  it('should show full recipe details for authenticated users', async () => {
    // Login to get auth token
    const loginResult = await authApi.login({
      email: 'test@example.com',
      password: 'password123',
    });
    localStorage.setItem('accessToken', loginResult.data.accessToken);

    const { result } = renderHook(() => useRecipe('recipe-1', true));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.recipe).toBeDefined();
    expect(result.current.recipe?.ingredients).toBeDefined();
    expect(result.current.recipe?.steps).toBeDefined();
    expect(result.current.isLimited).toBe(false);
  });

  it('should handle recipe not found', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useRecipe('nonexistent-id', false));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.recipe).toBeNull();

    consoleErrorSpy.mockRestore();
  });

  it('should refetch when recipe ID changes', async () => {
    const { result, rerender } = renderHook(
      ({ id, isAuth }) => useRecipe(id, isAuth),
      { initialProps: { id: 'recipe-1', isAuth: false } }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.recipe?.id).toBe('recipe-1');

    // Change recipe ID
    rerender({ id: 'recipe-2', isAuth: false });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.recipe?.id).toBe('recipe-2');
  });

  it('should refetch when authentication status changes', async () => {
    const { result, rerender } = renderHook(
      ({ id, isAuth }) => useRecipe(id, isAuth),
      { initialProps: { id: 'recipe-1', isAuth: false } }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Guest user - limited
    expect(result.current.isLimited).toBe(true);

    // Login
    const loginResult = await authApi.login({
      email: 'test@example.com',
      password: 'password123',
    });
    localStorage.setItem('accessToken', loginResult.data.accessToken);

    // Change to authenticated
    rerender({ id: 'recipe-1', isAuth: true });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should now have full details
    expect(result.current.isLimited).toBe(false);
  });

  it('should not fetch when ID is empty', () => {
    const { result } = renderHook(() => useRecipe('', false));

    // Should not trigger loading since ID is empty
    expect(result.current.recipe).toBeNull();
  });

  it('should cleanup on unmount', async () => {
    const { result, unmount } = renderHook(() => useRecipe('recipe-1', false));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Unmount should not cause errors
    unmount();
  });

  it('should handle concurrent recipe fetches correctly', async () => {
    const { result, rerender } = renderHook(
      ({ id }) => useRecipe(id, false),
      { initialProps: { id: 'recipe-1' } }
    );

    // Quickly change IDs before first fetch completes
    rerender({ id: 'recipe-2' });
    rerender({ id: 'recipe-3' });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should have the latest recipe
    expect(result.current.recipe?.id).toBe('recipe-3');
  });
});
