'use client';

import { useEffect, useState, use, useMemo } from 'react';
import { useRecipes } from '@/hooks/use-recipes';
import RecipeGrid from '@/components/RecipeGrid';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import AuthModal from '@/components/AuthModal';
import CategoryPills from '@/components/CategoryPills';
import FeaturedRecipe from '@/components/FeaturedRecipe';
import FavouritesTeaser from '@/components/FavouritesTeaser';

export default function Home({ searchParams }: { searchParams: Promise<{ search?: string }> }) {
  const [page, setPage] = useState(1);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  // Unwrap the promise dynamically handling the updated Next.js 15 API
  const params = use(searchParams);
  const search = params.search;

  useEffect(() => {
    // reset page on search change
    setPage(1);
  }, [search]);

  // Use our custom hook
  const fetchParams = useMemo(() => ({ search, page, limit: 10 }), [search, page]);
  const { recipes, totalPages, isLimited, limitMessage, isLoading } = useRecipes(fetchParams);

  const handleNextPage = () => {
    if (isLimited) {
      setIsAuthModalOpen(true);
    } else if (page < totalPages) {
      setPage(p => p + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(p => p - 1);
    }
  };

  return (
    <div className="py-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-foreground mb-3">
            {search ? (
              <span className="flex items-center gap-3">
                <Search className="h-8 w-8 text-primary" /> 
                Results for "{search}"
              </span>
            ) : "The Cookbook"}
          </h1>
          <p className="text-lg text-muted-foreground font-medium">Curated recipes for the modern kitchen.</p>
        </div>
      </div>
      
      {!search && <CategoryPills />}
      
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {!search && page === 1 && recipes.length > 0 && (
            <FeaturedRecipe recipe={recipes[0]} />
          )}

          {!search && page === 1 && recipes.length > 0 && (
            <FavouritesTeaser />
          )}

          {recipes.length > 0 && (
             <div className="mb-6 flex items-center gap-4">
                <h2 className="text-2xl font-bold tracking-tight">
                  {search ? "Search Results" : "All Recipes"}
                </h2>
                <div className="h-px flex-grow bg-border"></div>
             </div>
          )}

          <RecipeGrid recipes={(!search && page === 1 && recipes.length > 0) ? recipes.slice(1) : recipes} />
          
          <div className="mt-12 flex justify-center items-center gap-4">
            <Button variant="outline" onClick={handlePrevPage} disabled={page <= 1}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <span className="text-sm font-medium">Page {page} of {totalPages}</span>
            <Button variant="outline" onClick={handleNextPage} disabled={page >= totalPages && !isLimited}>
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </>
      )}

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        message={limitMessage || "Sign in to view more recipes 🍳"}
      />
    </div>
  );
}
