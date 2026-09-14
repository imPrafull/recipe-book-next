import { renderHook, act } from '@testing-library/react';
import { useMealPlanner, convertPlanToSlots, convertSlotsToPlan } from '../useMealPlanner';

jest.mock('@/lib/auth-context', () => ({
  useAuth: () => ({
    isAuthenticated: false,
    token: null,
  }),
}));

jest.mock('@/lib/api/meal-plans', () => ({
  mealPlansApi: {
    getMealPlan: jest.fn().mockResolvedValue({
      id: 'plan-1',
      userId: 'user-1',
      weekStartDate: '2026-09-07T00:00:00.000Z',
      slots: [],
    }),
    updateMealPlan: jest.fn().mockResolvedValue({
      id: 'plan-1',
      slots: [],
    }),
    patchSlot: jest.fn().mockResolvedValue({
      id: 'plan-1',
      slots: [],
    }),
    clearMealPlan: jest.fn().mockResolvedValue({ message: 'Deleted' }),
  },
}));

describe('useMealPlanner', () => {
  const baseDate = new Date(2026, 8, 7); // Monday Sept 7 2026

  it('initializes with current week date range', () => {
    const { result } = renderHook(() => useMealPlanner(baseDate));
    expect(result.current.formattedWeekRange).toBe('Sep 7 – 13, 2026');
    expect(result.current.hasAnyRecipes).toBe(false);
  });

  it('navigates next and previous weeks', () => {
    const { result } = renderHook(() => useMealPlanner(baseDate));

    act(() => {
      result.current.goToNextWeek();
    });
    expect(result.current.formattedWeekRange).toBe('Sep 14 – 20, 2026');

    act(() => {
      result.current.goToPreviousWeek();
    });
    expect(result.current.formattedWeekRange).toBe('Sep 7 – 13, 2026');
  });

  it('isolates recipe additions per week', async () => {
    const { result } = renderHook(() => useMealPlanner(baseDate));

    // Add recipe to current week (Sept 7)
    await act(async () => {
      await result.current.addRecipeToSlot('monday', 'breakfast', 'recipe-1');
    });

    expect(result.current.getSlotRecipes('monday', 'breakfast')).toEqual(['recipe-1']);
    expect(result.current.hasAnyRecipes).toBe(true);

    // Navigate to next week (Sept 14)
    act(() => {
      result.current.goToNextWeek();
    });

    expect(result.current.getSlotRecipes('monday', 'breakfast')).toEqual([]);
    expect(result.current.hasAnyRecipes).toBe(false);

    // Add recipe to next week
    await act(async () => {
      await result.current.addRecipeToSlot('tuesday', 'lunch', 'recipe-2');
    });

    expect(result.current.getSlotRecipes('tuesday', 'lunch')).toEqual(['recipe-2']);

    // Navigate back to initial week
    act(() => {
      result.current.goToPreviousWeek();
    });

    // Check Sept 7 recipes are still intact
    expect(result.current.getSlotRecipes('monday', 'breakfast')).toEqual(['recipe-1']);
    expect(result.current.getSlotRecipes('tuesday', 'lunch')).toEqual([]);
  });

  it('clears all recipes in current week via clearWeek', async () => {
    const { result } = renderHook(() => useMealPlanner(baseDate));

    await act(async () => {
      await result.current.addRecipeToSlot('monday', 'dinner', 'recipe-1');
    });

    expect(result.current.hasAnyRecipes).toBe(true);

    await act(async () => {
      await result.current.clearWeek();
    });

    expect(result.current.hasAnyRecipes).toBe(false);
    expect(result.current.getSlotRecipes('monday', 'dinner')).toEqual([]);
  });

  it('correctly converts plan to backend slots and vice versa', () => {
    const slots = convertPlanToSlots({
      'monday-dinner': ['recipe-123'],
    });

    expect(slots.length).toBe(35);
    const mondayDinner = slots.find((s) => s.day === 'monday' && s.mealType === 'dinner');
    expect(mondayDinner?.recipeId).toBe('recipe-123');

    const plan = convertSlotsToPlan([
      { id: '1', day: 'tuesday', mealType: 'lunch', recipeId: 'recipe-456' },
    ]);
    expect(plan['tuesday-lunch']).toEqual(['recipe-456']);
  });

  it('resets to current week using goToCurrentWeek', () => {
    const { result } = renderHook(() => useMealPlanner(baseDate));

    act(() => {
      result.current.goToNextWeek();
      result.current.goToNextWeek();
    });

    expect(result.current.formattedWeekRange).not.toBe('Sep 7 – 13, 2026');

    act(() => {
      result.current.goToCurrentWeek();
    });

    expect(result.current.isCurrentWeek).toBe(true);
  });
});
