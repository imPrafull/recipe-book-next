import { useState, useCallback } from 'react';

/**
 * Custom hook to manage Cook Mode state for a recipe.
 * Tracks whether cook mode is active and which steps have been completed.
 * State is ephemeral (in-memory only) and resets on page navigation/reload.
 */
export function useCookMode(steps: string[] | undefined) {
  const [isCookMode, setIsCookMode] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const toggleCookMode = useCallback(() => {
    setIsCookMode((prev) => !prev);
  }, []);

  const toggleStep = useCallback((index: number) => {
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }, []);

  const resetAllSteps = useCallback(() => {
    setCompletedSteps(new Set());
  }, []);

  const totalSteps = steps?.length || 0;
  const completedCount = completedSteps.size;
  const progressPercent = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

  return {
    isCookMode,
    toggleCookMode,
    completedSteps,
    toggleStep,
    resetAllSteps,
    totalSteps,
    completedCount,
    progressPercent,
  };
}
