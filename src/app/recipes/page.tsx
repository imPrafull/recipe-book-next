'use client';

import { useEffect, useState, use, useMemo } from 'react';
import { useRecipes } from '@/hooks/use-recipes';
import RecipeGrid from '@/components/RecipeGrid';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import AuthModal from '@/components/AuthModal';
import CategoryPills from '@/components/CategoryPills';
import SearchBar from '@/components/SearchBar';
import Pagination from '@/components/Pagination';

export default function BrowsePage({ searchParams }: { searchParams: Promise<{ search?: string }> }) {
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
      <div className="flex flex-col mb-8 gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-foreground mb-3">
            {search ? (
              <span className="flex items-center gap-3">
                <Search className="h-8 w-8 text-primary" /> 
                Results for "{search}"
              </span>
            ) : "Browse Recipes"}
          </h1>
        </div>
        <div className="w-full max-w-xl">
          <SearchBar />
        </div>
      </div>
      
      <CategoryPills />
      
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          <RecipeGrid recipes={recipes} />
          
          <Pagination 
            page={page} 
            totalPages={totalPages} 
            isLimited={isLimited} 
            onNext={handleNextPage} 
            onPrev={handlePrevPage} 
          />
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
