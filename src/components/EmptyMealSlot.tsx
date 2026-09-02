'use client';

import { Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { MealType } from '@/lib/types';

interface EmptyMealSlotProps {
  mealType: MealType;
  onClick: () => void;
}

const mealTypeLabels: Record<MealType, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack1: 'Snack 1',
  snack2: 'Snack 2',
};

const mealTypeColors: Record<MealType, string> = {
  breakfast: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
  lunch: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
  dinner: 'bg-orange-500/10 text-orange-700 border-orange-500/20',
  snack1: 'bg-purple-500/10 text-purple-700 border-purple-500/20',
  snack2: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
};

export default function EmptyMealSlot({ mealType, onClick }: EmptyMealSlotProps) {
  return (
    <button
      onClick={onClick}
      className="w-full group relative flex flex-col items-center justify-center gap-2 p-3 min-h-[88px] h-full border-2 border-dashed border-border/40 rounded-lg bg-muted/20 hover:border-primary/30 hover:bg-muted/40 transition-all duration-300 hover:shadow-lg active:scale-[0.98]"
    >
      <Badge 
        variant="outline" 
        className={`${mealTypeColors[mealType]} font-semibold text-xs px-2 py-0.5`}
      >
        {mealTypeLabels[mealType]}
      </Badge>
      
      <div className="flex items-center gap-1.5 text-muted-foreground group-hover:text-primary transition-colors">
        <Plus className="h-4 w-4" />
        <span className="text-xs font-medium">Add recipe</span>
      </div>
    </button>
  );
}
