'use client';

import { useState, useCallback } from 'react';
import { DayOfWeek, MealType, WeekPlan } from '@/lib/types';

/**
 * Custom hook for managing weekly meal plan state.
 * 
 * NOTE: This is in-memory only for phase 1. No persistence (localStorage or API).
 * State resets on page refresh. Future iteration will add backend integration.
 */
export function useMealPlanner() {
  const [weekPlan, setWeekPlan] = useState<WeekPlan>({});

  const getSlotKey = (day: DayOfWeek, mealType: MealType): string => {
    return `${day}-${mealType}`;
  };

  const addRecipeToSlot = useCallback((day: DayOfWeek, mealType: MealType, recipeId: string) => {
    setWeekPlan((prev) => {
      const key = getSlotKey(day, mealType);
      const currentRecipes = prev[key] || [];
      
      // Avoid duplicates
      if (currentRecipes.includes(recipeId)) {
        return prev;
      }
      
      return {
        ...prev,
        [key]: [...currentRecipes, recipeId],
      };
    });
  }, []);

  const removeRecipeFromSlot = useCallback((day: DayOfWeek, mealType: MealType, recipeId: string) => {
    setWeekPlan((prev) => {
      const key = getSlotKey(day, mealType);
      const currentRecipes = prev[key] || [];
      const updatedRecipes = currentRecipes.filter((id) => id !== recipeId);
      
      if (updatedRecipes.length === 0) {
        // Remove the key entirely if no recipes left
        const { [key]: _, ...rest } = prev;
        return rest;
      }
      
      return {
        ...prev,
        [key]: updatedRecipes,
      };
    });
  }, []);

  const getSlotRecipes = useCallback((day: DayOfWeek, mealType: MealType): string[] => {
    const key = getSlotKey(day, mealType);
    return weekPlan[key] || [];
  }, [weekPlan]);

  const clearSlot = useCallback((day: DayOfWeek, mealType: MealType) => {
    setWeekPlan((prev) => {
      const key = getSlotKey(day, mealType);
      const { [key]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  const hasAnyRecipes = Object.keys(weekPlan).length > 0;

  return {
    weekPlan,
    addRecipeToSlot,
    removeRecipeFromSlot,
    getSlotRecipes,
    clearSlot,
    hasAnyRecipes,
  };
}
