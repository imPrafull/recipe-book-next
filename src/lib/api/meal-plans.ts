import { API_BASE, fetchWithAuth, unwrap } from '../api-client';
import type { BackendMealPlan, UpsertMealPlanSlot } from '@/lib/types';

const MEAL_PLANS_ENDPOINT = '/meal-plans';
const MEAL_PLANS_URL = `${API_BASE}${MEAL_PLANS_ENDPOINT}`;

export const mealPlansApi = {
  /**
   * Fetch a week's meal plan for a specific weekStartDate (strictly Monday YYYY-MM-DD).
   * Guarantees 35-slot grid returned from backend.
   */
  async getMealPlan(weekStartDate: string): Promise<BackendMealPlan> {
    const url = `${MEAL_PLANS_URL}?weekStartDate=${encodeURIComponent(weekStartDate)}`;
    const res = await fetchWithAuth(url);
    const envelope = await unwrap<BackendMealPlan>(res);
    return envelope.data;
  },

  /**
   * Save / update a meal plan for a specific week.
   * Uses full-replace semantics.
   */
  async updateMealPlan(
    weekStartDate: string,
    slots: UpsertMealPlanSlot[]
  ): Promise<BackendMealPlan> {
    const url = `${MEAL_PLANS_URL}?weekStartDate=${encodeURIComponent(weekStartDate)}`;
    const res = await fetchWithAuth(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slots }),
    });
    const envelope = await unwrap<BackendMealPlan>(res);
    return envelope.data;
  },

  /**
   * Update a single slot within the meal plan for a given week.
   * Sends PATCH /api/meal-plans?weekStartDate=YYYY-MM-DD with body { day, mealType, recipeId }.
   */
  async patchSlot(
    weekStartDate: string,
    slot: UpsertMealPlanSlot
  ): Promise<BackendMealPlan> {
    const url = `${MEAL_PLANS_URL}?weekStartDate=${encodeURIComponent(weekStartDate)}`;
    const res = await fetchWithAuth(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(slot),
    });
    const envelope = await unwrap<BackendMealPlan>(res);
    return envelope.data;
  },

  /**
   * Clear / reset a week's meal plan entirely.
   */
  async clearMealPlan(weekStartDate: string): Promise<{ message: string }> {
    const url = `${MEAL_PLANS_URL}?weekStartDate=${encodeURIComponent(weekStartDate)}`;
    const res = await fetchWithAuth(url, {
      method: 'DELETE',
    });
    const envelope = await unwrap<{ message: string }>(res);
    return envelope.data;
  },
};

