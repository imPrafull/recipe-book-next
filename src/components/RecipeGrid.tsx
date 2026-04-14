import RecipeCard, { Recipe } from './RecipeCard';

interface RecipeGridProps {
  recipes: Recipe[];
}

export default function RecipeGrid({ recipes }: RecipeGridProps) {
  if (!recipes || recipes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-muted-foreground bg-muted/30 rounded-2xl border border-dashed border-border leading-relaxed">
        <div className="bg-muted p-4 rounded-full mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <p className="text-xl font-semibold text-foreground">No recipes found.</p>
        <p className="text-sm">Try adjusting your search or add a new recipe!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-[minmax(0,1fr)]">
      {recipes.map((recipe, index) => {
        // Every 4th item breaks the grid by spanning 2 columns (except on very small screens)
        const isLarge = index % 5 === 0 && recipes.length > 2;
        
        return (
          <div 
            key={recipe.id} 
            className={`${isLarge ? "sm:col-span-2 sm:row-span-2" : ""} transition-all duration-300`}
          >
            <RecipeCard recipe={recipe} />
          </div>
        );
      })}
    </div>
  );
}
