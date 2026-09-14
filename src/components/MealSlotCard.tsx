'use client';

import { Clock, X, ChefHat } from 'lucide-react';
import { Recipe } from '@/lib/types';

interface MealSlotCardProps {
  recipe: Recipe;
  onRemove: () => void;
}

export default function MealSlotCard({ recipe, onRemove }: MealSlotCardProps) {
  // Deterministic color fallback based on title (same logic as RecipeCard)
  const getFallbackColor = (title: string) => {
    const colors = [
      'from-orange-400 to-rose-400',
      'from-emerald-400 to-teal-500',
      'from-blue-400 to-indigo-500',
      'from-violet-400 to-fuchsia-500',
      'from-amber-300 to-orange-500',
      'from-rose-400 to-pink-600',
    ];
    let hash = 0;
    for (let i = 0; i < title.length; i++) {
      hash = title.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const fallbackGradient = getFallbackColor(recipe.title);

  return (
    <div className="w-full group relative flex items-center gap-2.5 p-2 min-h-[76px] h-[76px] border border-border/40 rounded-xl bg-card hover:border-primary/30 hover:shadow-md transition-all duration-300">
      <div className="relative flex-shrink-0 w-14 h-14 xl:w-12 xl:h-12 rounded-lg overflow-hidden bg-muted block lg:hidden xl:block">
        {recipe.image ? (
          <img
            src={recipe.image}
            alt={recipe.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div
            className={`w-full h-full bg-gradient-to-br ${fallbackGradient} flex items-center justify-center`}
          >
            <ChefHat className="h-6 w-6 text-white/60" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 py-0.5">
        <h4 className="text-xs sm:text-sm font-semibold text-foreground line-clamp-1 leading-snug">
          {recipe.title}
        </h4>
        <div className="flex items-center gap-1 text-muted-foreground mt-1">
          <Clock className="h-3.5 w-3.5" />
          <span className="text-xs">{recipe.cookingTime} min</span>
        </div>
      </div>

      {/* Remove button */}
      <button
        onClick={onRemove}
        className="absolute -top-2 -right-2 p-1 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95 transition-all duration-200 shadow-md z-10"
        aria-label="Remove recipe"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}
