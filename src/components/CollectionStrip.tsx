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
      <div className="mt-12 pt-8 border-t border-border/60">
        <h3 className="text-xl font-bold tracking-tight mb-6 text-foreground">You might also like</h3>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-6">
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
    <div className="mt-12 pt-8 border-t border-border/60">
      <h3 className="text-xl font-bold tracking-tight mb-6 text-foreground">You might also like</h3>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-6">
        {relatedRecipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>
    </div>
  );
}
