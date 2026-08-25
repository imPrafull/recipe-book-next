import RecipeCard, { Recipe } from './RecipeCard';
import Link from 'next/link';

interface RecipeGridProps {
  recipes: Recipe[];
  isLoading?: boolean;
  searchTerm?: string;
  onClearSearch?: () => void;
  layout?: 'mixed' | 'simple';
}

export default function RecipeGrid({ 
  recipes, 
  isLoading, 
  searchTerm, 
  onClearSearch,
  layout = 'mixed'
}: RecipeGridProps) {
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
        {[...Array(6)].map((_, i) => {
          const isLandscape = layout === 'mixed' && i % 3 === 0;
          return (
            <div 
              key={i} 
              className={`animate-pulse bg-muted rounded-2xl ${
                isLandscape ? "sm:col-span-2 aspect-[21/9] sm:h-56" : "aspect-[3/4] h-full"
              }`}
            />
          );
        })}
      </div>
    );
  }

  if (!recipes || recipes.length === 0) {
    if (searchTerm) {
      return (
        <div className="flex flex-col items-center justify-center py-32 text-center animate-fade-in">
          <h2 className="text-4xl font-light text-muted-foreground mb-4">
            Nothing found for <span className="text-foreground font-medium underline underline-offset-8 decoration-primary/30">"{searchTerm}"</span>
          </h2>
          {onClearSearch && (
            <button 
              onClick={onClearSearch}
              className="text-primary font-semibold hover:underline transition-all"
            >
              Clear search
            </button>
          )}
        </div>
      );
    }
    return null; // Handle generic empty state elsewhere if needed
  }

  // Simple layout (for Homepage)
  if (layout === 'simple') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} variant="portrait" />
        ))}
      </div>
    );
  }

  // Mixed layout (for Browse Page)
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
      {recipes.map((recipe, index) => {
        const isLandscape = index % 3 === 0;
        return (
          <div 
            key={recipe.id} 
            className={isLandscape ? "sm:col-span-2" : "col-span-1"}
          >
            <RecipeCard 
              recipe={recipe} 
              variant={isLandscape ? "landscape" : "portrait"} 
            />
          </div>
        );
      })}
    </div>
  );
}
