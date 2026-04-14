'use client';

import { useRecipes } from '@/hooks/use-recipes';
import RecipeCard from './RecipeCard';

interface CollectionStripProps {
  currentRecipeId: string;
}

export default function CollectionStrip({ currentRecipeId }: CollectionStripProps) {
  // Use default params to fetch recent list
  const { recipes, isLoading } = useRecipes({ page: 1, limit: 10 });

  if (isLoading) {
    return (
      <div className="mt-20 pt-10 border-t border-border">
        <h3 className="text-2xl font-bold tracking-tight mb-8">You might also like</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-muted animate-pulse rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  const relatedRecipes = recipes
    .filter((recipe) => recipe.id !== currentRecipeId)
    .slice(0, 3);

  if (relatedRecipes.length === 0) return null;

  return (
    <div className="mt-20 pt-10 border-t border-border">
      <h3 className="text-2xl font-bold tracking-tight mb-8">You might also like</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {relatedRecipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>
    </div>
  );
}
