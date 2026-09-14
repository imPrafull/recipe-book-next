'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { DayOfWeek, MealType, WeekPlan, BackendMealPlanSlot, UpsertMealPlanSlot } from '@/lib/types';
import {
  getWeekStart,
  getWeekKey,
  getWeekStartDateString,
  addWeeks,
  formatWeekRange,
  getWeekStatus,
  getDatesOfWeek,
} from '@/lib/dateUtils';
import { mealPlansApi } from '@/lib/api/meal-plans';
import { useAuth } from '@/lib/auth-context';

const DAYS: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack1', 'snack2'];

function getSlotKey(day: DayOfWeek, mealType: MealType): string {
  return `${day}-${mealType}`;
}

/**
 * Converts a WeekPlan map to 35-slot backend array format.
 */
export function convertPlanToSlots(plan: WeekPlan): UpsertMealPlanSlot[] {
  const slots: UpsertMealPlanSlot[] = [];
  DAYS.forEach((day) => {
    MEAL_TYPES.forEach((mealType) => {
      const key = getSlotKey(day, mealType);
      const recipeIds = plan[key] || [];
      slots.push({
        day,
        mealType,
        recipeId: recipeIds.length > 0 ? recipeIds[0] : null,
      });
    });
  });
  return slots;
}

/**
 * Converts backend 35-slot array to local WeekPlan map.
 */
export function convertSlotsToPlan(slots: BackendMealPlanSlot[]): WeekPlan {
  const plan: WeekPlan = {};
  if (Array.isArray(slots)) {
    slots.forEach((slot) => {
      const key = getSlotKey(slot.day, slot.mealType);
      if (slot.recipeId) {
        const id = typeof slot.recipeId === 'object' && slot.recipeId !== null
          ? (slot.recipeId as any).id || (slot.recipeId as any)._id
          : String(slot.recipeId);
        plan[key] = [id];
      } else {
        plan[key] = [];
      }
    });
  }
  return plan;
}

/**
 * Custom hook for managing weekly meal plan state and week navigation.
 * Stores meal plans per week key (YYYY-MM-DD representing week start Monday).
 */
export function useMealPlanner(initialDate?: Date) {
  const { isAuthenticated } = useAuth();
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() =>
    getWeekStart(initialDate || new Date())
  );

  // Map of weekKey ("YYYY-MM-DD") -> WeekPlan
  const [plansByWeek, setPlansByWeek] = useState<Record<string, WeekPlan>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const currentWeekKey = useMemo(() => getWeekStartDateString(currentWeekStart), [currentWeekStart]);
  const formattedWeekRange = useMemo(() => formatWeekRange(currentWeekStart), [currentWeekStart]);
  const weekStatus = useMemo(() => getWeekStatus(currentWeekStart), [currentWeekStart]);
  const isCurrentWeek = weekStatus === 'current';
  const dayDates = useMemo(() => getDatesOfWeek(currentWeekStart), [currentWeekStart]);

  const currentWeekPlan = useMemo(() => plansByWeek[currentWeekKey] || {}, [plansByWeek, currentWeekKey]);

  // Fetch week meal plan from backend on week change or login
  useEffect(() => {
    let isMounted = true;
    if (!isAuthenticated) return;

    async function loadWeekPlan() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await mealPlansApi.getMealPlan(currentWeekKey);
        if (isMounted && data && Array.isArray(data.slots)) {
          const loadedPlan = convertSlotsToPlan(data.slots);
          setPlansByWeek((prev) => ({
            ...prev,
            [currentWeekKey]: loadedPlan,
          }));
        }
      } catch (err: any) {
        if (isMounted) {
          console.error('Failed to load meal plan:', err);
          setError(err?.message || 'Failed to load meal plan');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadWeekPlan();

    return () => {
      isMounted = false;
    };
  }, [currentWeekKey, isAuthenticated]);

  const goToPreviousWeek = useCallback(() => {
    setCurrentWeekStart((prev) => addWeeks(prev, -1));
  }, []);

  const goToNextWeek = useCallback(() => {
    setCurrentWeekStart((prev) => addWeeks(prev, 1));
  }, []);

  const goToCurrentWeek = useCallback(() => {
    setCurrentWeekStart(getWeekStart(new Date()));
  }, []);

  const patchSlotToBackend = useCallback(
    async (weekKey: string, day: DayOfWeek, mealType: MealType, recipeId: string | null) => {
      if (!isAuthenticated) return;
      setIsSaving(true);
      setError(null);
      try {
        const savedData = await mealPlansApi.patchSlot(weekKey, { day, mealType, recipeId });
        if (savedData && Array.isArray(savedData.slots)) {
          const updatedPlan = convertSlotsToPlan(savedData.slots);
          setPlansByWeek((prev) => ({
            ...prev,
            [weekKey]: updatedPlan,
          }));
        }
      } catch (err: any) {
        console.error('Failed to patch meal plan slot:', err);
        setError(err?.message || 'Failed to update meal slot');
      } finally {
        setIsSaving(false);
      }
    },
    [isAuthenticated]
  );

  const addRecipeToSlot = useCallback(
    async (day: DayOfWeek, mealType: MealType, recipeId: string) => {
      const activePlan = plansByWeek[currentWeekKey] || {};
      const key = getSlotKey(day, mealType);
      const currentRecipes = activePlan[key] || [];

      if (currentRecipes.includes(recipeId)) {
        return;
      }

      const updatedPlan: WeekPlan = {
        ...activePlan,
        [key]: [...currentRecipes, recipeId],
      };

      setPlansByWeek((prev) => ({
        ...prev,
        [currentWeekKey]: updatedPlan,
      }));

      await patchSlotToBackend(currentWeekKey, day, mealType, recipeId);
    },
    [plansByWeek, currentWeekKey, patchSlotToBackend]
  );

  const removeRecipeFromSlot = useCallback(
    async (day: DayOfWeek, mealType: MealType, recipeId: string) => {
      const activePlan = plansByWeek[currentWeekKey] || {};
      const key = getSlotKey(day, mealType);
      const currentRecipes = activePlan[key] || [];
      const updatedRecipes = currentRecipes.filter((id) => id !== recipeId);

      let updatedPlan: WeekPlan;
      if (updatedRecipes.length === 0) {
        const { [key]: _, ...rest } = activePlan;
        updatedPlan = rest;
      } else {
        updatedPlan = {
          ...activePlan,
          [key]: updatedRecipes,
        };
      }

      setPlansByWeek((prev) => ({
        ...prev,
        [currentWeekKey]: updatedPlan,
      }));

      await patchSlotToBackend(currentWeekKey, day, mealType, updatedRecipes.length > 0 ? updatedRecipes[0] : null);
    },
    [plansByWeek, currentWeekKey, patchSlotToBackend]
  );

  const getSlotRecipes = useCallback(
    (day: DayOfWeek, mealType: MealType): string[] => {
      const activePlan = plansByWeek[currentWeekKey] || {};
      const key = getSlotKey(day, mealType);
      return activePlan[key] || [];
    },
    [plansByWeek, currentWeekKey]
  );

  const clearSlot = useCallback(
    async (day: DayOfWeek, mealType: MealType) => {
      const activePlan = plansByWeek[currentWeekKey] || {};
      const key = getSlotKey(day, mealType);
      const { [key]: _, ...rest } = activePlan;

      setPlansByWeek((prev) => ({
        ...prev,
        [currentWeekKey]: rest,
      }));

      await patchSlotToBackend(currentWeekKey, day, mealType, null);
    },
    [plansByWeek, currentWeekKey, patchSlotToBackend]
  );

  const clearWeek = useCallback(async () => {
    setPlansByWeek((prev) => ({
      ...prev,
      [currentWeekKey]: {},
    }));

    if (isAuthenticated) {
      setIsSaving(true);
      setError(null);
      try {
        await mealPlansApi.clearMealPlan(currentWeekKey);
      } catch (err: any) {
        console.error('Failed to clear meal plan:', err);
        setError(err?.message || 'Failed to clear meal plan');
      } finally {
        setIsSaving(false);
      }
    }
  }, [currentWeekKey, isAuthenticated]);

  const hasAnyRecipes = useMemo(() => {
    return Object.values(currentWeekPlan).some((recipes) => Array.isArray(recipes) && recipes.length > 0);
  }, [currentWeekPlan]);

  return {
    weekPlan: currentWeekPlan,
    currentWeekStart,
    currentWeekKey,
    formattedWeekRange,
    weekStatus,
    isCurrentWeek,
    dayDates,
    isLoading,
    isSaving,
    error,
    goToPreviousWeek,
    goToNextWeek,
    goToCurrentWeek,
    addRecipeToSlot,
    removeRecipeFromSlot,
    getSlotRecipes,
    clearSlot,
    clearWeek,
    hasAnyRecipes,
  };
}
