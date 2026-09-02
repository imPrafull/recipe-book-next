'use client';

import { useState, useMemo } from 'react';
import { Search, ChefHat, Clock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Recipe } from '@/lib/types';
import { mockRecipes } from '@/mocks/fixtures';

interface RecipePickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectRecipe: (recipeId: string) => void;
  selectedRecipeIds?: string[]; // To show which recipes are already selected
}

export default function RecipePickerDialog({
  open,
  onOpenChange,
  onSelectRecipe,
  selectedRecipeIds = [],
}: RecipePickerDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter recipes by title search
  const filteredRecipes = useMemo(() => {
    if (!searchQuery.trim()) return mockRecipes;
    
    const query = searchQuery.toLowerCase();
    return mockRecipes.filter((recipe) =>
      recipe.title.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const handleSelectRecipe = (recipeId: string) => {
    onSelectRecipe(recipeId);
    setSearchQuery(''); // Clear search after selection
  };

  // Deterministic color fallback (same as RecipeCard)
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Choose a Recipe</DialogTitle>
          <DialogDescription>
            Search and select a recipe to add to your meal plan
          </DialogDescription>
        </DialogHeader>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search recipes by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Recipe List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
          {filteredRecipes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground">No recipes found</p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                Try a different search term
              </p>
            </div>
          ) : (
            filteredRecipes.map((recipe) => {
              const isSelected = selectedRecipeIds.includes(recipe.id);
              const fallbackGradient = getFallbackColor(recipe.title);

              return (
                <div
                  key={recipe.id}
                  className={`flex items-center gap-4 p-3 border rounded-lg transition-all duration-200 ${
                    isSelected
                      ? 'border-primary/50 bg-primary/5'
                      : 'border-border/40 hover:border-primary/30 hover:shadow-md'
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="relative flex-shrink-0 w-20 h-20 rounded-md overflow-hidden bg-muted">
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
                        <ChefHat className="h-8 w-8 text-white/60" />
                      </div>
                    )}
                  </div>

                  {/* Recipe Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground line-clamp-1">
                      {recipe.title}
                    </h4>
                    <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                      {recipe.description}
                    </p>
                    <div className="flex items-center gap-1 mt-1.5 text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span className="text-xs">{recipe.cookingTime} min</span>
                    </div>
                  </div>

                  {/* Select Button */}
                  <Button
                    size="sm"
                    variant={isSelected ? 'outline' : 'default'}
                    onClick={() => handleSelectRecipe(recipe.id)}
                    disabled={isSelected}
                  >
                    {isSelected ? 'Added' : 'Add'}
                  </Button>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
