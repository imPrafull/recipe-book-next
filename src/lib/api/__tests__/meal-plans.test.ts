import { mealPlansApi } from '../meal-plans';

describe('mealPlansApi', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('accessToken', 'mock-token');
    (global as any).fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('getMealPlan fetches meal plan with correct query param', async () => {
    const mockPlan = {
      id: 'mp-1',
      userId: 'u-1',
      weekStartDate: '2026-09-07T00:00:00.000Z',
      slots: [
        { id: 's-1', day: 'monday', mealType: 'breakfast', recipeId: 'recipe-1' },
      ],
    };

    (global as any).fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: mockPlan,
      }),
    });

    const result = await mealPlansApi.getMealPlan('2026-09-07');

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/meal-plans?weekStartDate=2026-09-07',
      expect.objectContaining({
        headers: expect.any(Headers),
      })
    );
    expect(result).toEqual(mockPlan);
  });

  it('updateMealPlan sends PUT request with full slot payload', async () => {
    const slotsToSave = [
      { day: 'monday' as const, mealType: 'dinner' as const, recipeId: 'recipe-999' },
    ];

    const mockSavedPlan = {
      id: 'mp-1',
      slots: slotsToSave,
    };

    (global as any).fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: mockSavedPlan,
      }),
    });

    const result = await mealPlansApi.updateMealPlan('2026-09-07', slotsToSave);

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/meal-plans?weekStartDate=2026-09-07',
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({ slots: slotsToSave }),
      })
    );
    expect(result).toEqual(mockSavedPlan);
  });

  it('patchSlot sends PATCH request for single slot update', async () => {
    const slotToPatch = { day: 'monday' as const, mealType: 'dinner' as const, recipeId: 'recipe-123' };

    const mockPatchedPlan = {
      id: 'mp-1',
      slots: [slotToPatch],
    };

    (global as any).fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: mockPatchedPlan,
      }),
    });

    const result = await mealPlansApi.patchSlot('2026-09-07', slotToPatch);

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/meal-plans?weekStartDate=2026-09-07',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify(slotToPatch),
      })
    );
    expect(result).toEqual(mockPatchedPlan);
  });

  it('clearMealPlan sends DELETE request with weekStartDate query param', async () => {
    (global as any).fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: { message: 'Meal plan deleted successfully' },
      }),
    });

    const result = await mealPlansApi.clearMealPlan('2026-09-07');

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/meal-plans?weekStartDate=2026-09-07',
      expect.objectContaining({
        method: 'DELETE',
      })
    );
    expect(result.message).toContain('deleted successfully');
  });
});
