'use client';

import { useEffect, useState, use, useMemo } from 'react';
import { useRecipes } from '@/hooks/use-recipes';
import RecipeGrid from '@/components/RecipeGrid';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import AuthModal from '@/components/AuthModal';

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
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            {search ? `Search results for "${search}"` : "Latest Recipes"}
          </h1>
          <p className="text-muted-foreground mt-2">Discover and cook delicious meals</p>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          <RecipeGrid recipes={recipes} />
          
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
