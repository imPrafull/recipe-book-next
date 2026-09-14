export interface Ingredient {
  id: string;              // from backend on existing recipes; generate a temporary local id for new rows being edited
  name: string;
  quantity: number | null;
  unit: string | null;
  notes?: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  cookingTime: number;
  image: string;
  createdAt?: string;
  ingredients?: Ingredient[];
  steps?: string[];
  isLocked?: boolean; // Contextual prop for guest lock
}

// Meal Planner Types
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack1' | 'snack2';
export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface BackendMealPlanSlot {
  id?: string;
  day: DayOfWeek;
  mealType: MealType;
  recipeId: string | null;
}

export interface UpsertMealPlanSlot {
  day: DayOfWeek;
  mealType: MealType;
  recipeId: string | null;
}

export interface BackendMealPlan {
  id: string;
  userId: string;
  weekStartDate: string;
  slots: BackendMealPlanSlot[];
  createdAt?: string;
  updatedAt?: string;
}

export interface MealSlot {
  day: DayOfWeek;
  mealType: MealType;
  recipeIds: string[]; // Array to support recipes per slot
}

export interface WeekPlan {
  [key: string]: string[]; // key format: "monday-breakfast", value: array of recipe IDs
}


