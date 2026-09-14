'use client';

import { useState, useEffect } from 'react';
import { DayOfWeek, MealType, Recipe } from '@/lib/types';
import EmptyMealSlot from './EmptyMealSlot';
import MealSlotCard from './MealSlotCard';
import RecipePickerDialog from './RecipePickerDialog';
import { mockRecipes } from '@/mocks/fixtures';
import { recipesApi } from '@/lib/api/recipes';

interface MealPlannerGridProps {
  getSlotRecipes: (day: DayOfWeek, mealType: MealType) => string[];
  onAddRecipe: (day: DayOfWeek, mealType: MealType, recipeId: string) => void;
  onRemoveRecipe: (day: DayOfWeek, mealType: MealType, recipeId: string) => void;
  dayDates?: Record<DayOfWeek, { formattedShort: string; dateNum: number }>;
}

const DAYS: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack1', 'snack2'];

const dayLabels: Record<DayOfWeek, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

const mealTypeLabels: Record<MealType, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack1: 'Snack 1',
  snack2: 'Snack 2',
};

const mealDotColors: Record<MealType, string> = {
  breakfast: 'bg-amber-500',
  lunch: 'bg-emerald-500',
  dinner: 'bg-orange-500',
  snack1: 'bg-purple-500',
  snack2: 'bg-blue-500',
};

export default function MealPlannerGrid({
  getSlotRecipes,
  onAddRecipe,
  onRemoveRecipe,
  dayDates,
}: MealPlannerGridProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ day: DayOfWeek; mealType: MealType } | null>(null);
  const [apiRecipesMap, setApiRecipesMap] = useState<Record<string, Recipe>>({});

  useEffect(() => {
    let isMounted = true;
    async function loadRecipes() {
      try {
        const res = await recipesApi.getRecipes({ limit: 100 });
        if (isMounted && res.recipes) {
          const map: Record<string, Recipe> = {};
          res.recipes.forEach((r) => {
            map[r.id] = r;
          });
          setApiRecipesMap(map);
        }
      } catch (err) {
        console.error('Failed to load recipes in MealPlannerGrid:', err);
      }
    }
    loadRecipes();
    return () => {
      isMounted = false;
    };
  }, []);

  // Create combined lookup map for recipes by ID (mockRecipes as fallback + API recipes)
  const recipesById: Record<string, Recipe> = {
    ...mockRecipes.reduce((acc, recipe) => {
      acc[recipe.id] = recipe;
      return acc;
    }, {} as Record<string, Recipe>),
    ...apiRecipesMap,
  };

  const handleOpenPicker = (day: DayOfWeek, mealType: MealType) => {
    setSelectedSlot({ day, mealType });
    setPickerOpen(true);
  };

  const handleSelectRecipe = (recipeId: string) => {
    if (selectedSlot) {
      onAddRecipe(selectedSlot.day, selectedSlot.mealType, recipeId);
      // Don't close dialog to allow adding multiple recipes
    }
  };

  const handleRemoveRecipe = (day: DayOfWeek, mealType: MealType, recipeId: string) => {
    onRemoveRecipe(day, mealType, recipeId);
  };

  const renderSlot = (day: DayOfWeek, mealType: MealType, showTypeLabel = false) => {
    const recipeIds = getSlotRecipes(day, mealType);

    return (
      <div className="flex flex-col gap-1.5">
        {showTypeLabel && (
          <div className="flex items-center gap-1.5 px-1 py-0.5 shrink-0">
            <span className={`w-2 h-2 rounded-full ${mealDotColors[mealType]}`} />
            <span className="text-[11px] font-semibold tracking-wide uppercase text-muted-foreground">
              {mealTypeLabels[mealType]}
            </span>
          </div>
        )}

        {recipeIds.length === 0 ? (
          <EmptyMealSlot
            mealType={mealType}
            onClick={() => handleOpenPicker(day, mealType)}
          />
        ) : (
          <div className="space-y-2 flex-1 flex flex-col justify-between">
            <div className="space-y-2">
              {recipeIds.map((recipeId) => {
                const recipe = recipesById[recipeId] || {
                  id: recipeId,
                  title: `Recipe #${recipeId.slice(-6)}`,
                  description: 'Custom recipe',
                  cookingTime: 20,
                  image: '',
                };

                return (
                  <MealSlotCard
                    key={recipeId}
                    recipe={recipe}
                    onRemove={() => handleRemoveRecipe(day, mealType, recipeId)}
                  />
                );
              })}
            </div>
            {/* Add button to add more recipes to this slot */}
            <button
              onClick={() => handleOpenPicker(day, mealType)}
              className="w-full py-1.5 border border-dashed border-border/40 rounded-lg text-xs text-muted-foreground hover:text-primary hover:border-primary/30 transition-all duration-200"
            >
              + Add another
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Desktop Grid View (lg: 1024px and up) - Full 7-day week */}
      <div className="hidden lg:block">
        <div className="grid grid-cols-7 gap-2">
          {DAYS.map((day) => (
            <div key={day} className="flex flex-col gap-2">
              {/* Day Header */}
              <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm py-2 border-b border-border/40 text-center">
                <h3 className="font-semibold text-foreground text-xs uppercase tracking-wider">
                  {dayLabels[day]}
                </h3>
                {dayDates && dayDates[day] && (
                  <span className="text-[11px] font-medium text-muted-foreground block mt-0.5">
                    {dayDates[day].formattedShort}
                  </span>
                )}
              </div>

              {/* Meal Slots */}
              <div className="space-y-2">
                {MEAL_TYPES.map((mealType) => (
                  <div key={`${day}-${mealType}`}>
                    {renderSlot(day, mealType)}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile/Tablet Stacked View (below lg: below 1024px) */}
      <div className="lg:hidden space-y-6">
        {DAYS.map((day) => (
          <div key={day} className="space-y-3">
            {/* Day Header */}
            <div className="bg-primary/10 rounded-xl p-3.5 border border-primary/20 flex items-center justify-between shadow-xs">
              <h3 className="text-base font-bold text-foreground">
                {dayLabels[day]}
              </h3>
              {dayDates && dayDates[day] && (
                <span className="text-xs font-semibold text-primary bg-primary/15 px-2.5 py-1 rounded-full border border-primary/25">
                  {dayDates[day].formattedShort}
                </span>
              )}
            </div>

            {/* Responsive Grid for SM & MD screens */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {MEAL_TYPES.map((mealType) => (
                <div key={`${day}-${mealType}`} className="flex flex-col h-full">
                  {renderSlot(day, mealType, true)}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Recipe Picker Dialog */}
      {selectedSlot && (
        <RecipePickerDialog
          open={pickerOpen}
          onOpenChange={setPickerOpen}
          onSelectRecipe={handleSelectRecipe}
          selectedRecipeIds={getSlotRecipes(selectedSlot.day, selectedSlot.mealType)}
        />
      )}
    </>
  );
}
