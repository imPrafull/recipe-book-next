'use client';

import { useState } from 'react';
import { DayOfWeek, MealType, Recipe } from '@/lib/types';
import EmptyMealSlot from './EmptyMealSlot';
import MealSlotCard from './MealSlotCard';
import RecipePickerDialog from './RecipePickerDialog';
import { mockRecipes } from '@/mocks/fixtures';

interface MealPlannerGridProps {
  getSlotRecipes: (day: DayOfWeek, mealType: MealType) => string[];
  onAddRecipe: (day: DayOfWeek, mealType: MealType, recipeId: string) => void;
  onRemoveRecipe: (day: DayOfWeek, mealType: MealType, recipeId: string) => void;
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

export default function MealPlannerGrid({
  getSlotRecipes,
  onAddRecipe,
  onRemoveRecipe,
}: MealPlannerGridProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ day: DayOfWeek; mealType: MealType } | null>(null);

  // Create a lookup map for recipes by ID
  const recipesById = mockRecipes.reduce((acc, recipe) => {
    acc[recipe.id] = recipe;
    return acc;
  }, {} as Record<string, Recipe>);

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

  const renderSlot = (day: DayOfWeek, mealType: MealType) => {
    const recipeIds = getSlotRecipes(day, mealType);

    if (recipeIds.length === 0) {
      return (
        <EmptyMealSlot
          mealType={mealType}
          onClick={() => handleOpenPicker(day, mealType)}
        />
      );
    }

    return (
      <div className="space-y-2">
        {recipeIds.map((recipeId) => {
          const recipe = recipesById[recipeId];
          if (!recipe) return null;

          return (
            <MealSlotCard
              key={recipeId}
              recipe={recipe}
              onRemove={() => handleRemoveRecipe(day, mealType, recipeId)}
            />
          );
        })}
        {/* Add button to add more recipes to this slot */}
        <button
          onClick={() => handleOpenPicker(day, mealType)}
          className="w-full py-1.5 border border-dashed border-border/40 rounded-lg text-xs text-muted-foreground hover:text-primary hover:border-primary/30 transition-all duration-200"
        >
          + Add another
        </button>
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
              <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm py-2 border-b border-border/40">
                <h3 className="text-center font-semibold text-foreground text-xs">
                  {dayLabels[day]}
                </h3>
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
          <div key={day} className="space-y-4">
            {/* Day Header */}
            <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
              <h3 className="text-lg font-bold text-foreground">
                {dayLabels[day]}
              </h3>
            </div>

            {/* Meal Slots */}
            <div className="space-y-4 pl-2">
              {MEAL_TYPES.map((mealType) => (
                <div key={`${day}-${mealType}`}>
                  {renderSlot(day, mealType)}
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
