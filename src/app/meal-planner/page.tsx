'use client';

import { Calendar } from 'lucide-react';
import { useMealPlanner } from '@/hooks/useMealPlanner';
import MealPlannerGrid from '@/components/MealPlannerGrid';

export default function MealPlannerPage() {
  const {
    addRecipeToSlot,
    removeRecipeFromSlot,
    getSlotRecipes,
    hasAnyRecipes,
  } = useMealPlanner();

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-primary/10 via-secondary/5 to-background border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
                Weekly Meal Planner
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Plan your meals for the week ahead
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-amber-500"></span>
              <span>Breakfast</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Lunch</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-orange-500"></span>
              <span>Dinner</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-purple-500"></span>
              <span>Snack 1</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-500"></span>
              <span>Snack 2</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Helpful tip for first-time users */}
        {!hasAnyRecipes && (
          <div className="mb-8 p-4 bg-primary/5 border border-primary/20 rounded-xl text-center">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">👋 Get started:</span> Click any "+ Add recipe" button below to add meals to your week.
              <span className="hidden sm:inline"> You can add multiple recipes to each slot!</span>
            </p>
          </div>
        )}
        
        {/* Always show the meal planner grid */}
        <MealPlannerGrid
          getSlotRecipes={getSlotRecipes}
          onAddRecipe={addRecipeToSlot}
          onRemoveRecipe={removeRecipeFromSlot}
        />
      </div>

      {/* Note about in-memory state */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="text-center text-xs text-muted-foreground/70">
          <p>
            Note: Your meal plan is not saved and will reset when you refresh the page.
            Backend integration coming soon!
          </p>
        </div>
      </div>
    </div>
  );
}
