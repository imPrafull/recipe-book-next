'use client';

import { useEffect, useState, use, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useRecipes } from '@/hooks/use-recipes';
import RecipeGrid from '@/components/RecipeGrid';
import AuthModal from '@/components/AuthModal';
import CategoryPills from '@/components/CategoryPills';
import Pagination from '@/components/Pagination';

export default function BrowsePage({ searchParams }: { searchParams: Promise<{ search?: string }> }) {
  const router = useRouter();
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
  const fetchParams = useMemo(() => ({ search, page, limit: 12 }), [search, page]);
  const { recipes, totalPages, totalRecipes, isLimited, limitMessage, isLoading } = useRecipes(fetchParams);

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

  const handleClearSearch = () => {
    router.push('/recipes');
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 animate-fade-in max-w-7xl mx-auto">
      {/* Header Area */}
      <div className="flex flex-col mb-10">
        <div className="flex justify-between items-baseline mb-8">
          <h1 className="text-5xl md:text-7xl font-black tracking-tightest text-foreground">
            Browse
          </h1>
          {!isLoading && totalRecipes > 0 && (
            <span className="text-muted-foreground font-medium text-sm md:text-base">
              Showing {recipes.length} of {totalRecipes}
            </span>
          )}
        </div>

        <div className="w-full">
          <CategoryPills />
        </div>
        
        <div className="h-px w-full bg-border/40 mt-6" />
      </div>
      
      {/* Grid Area */}
      <RecipeGrid 
        recipes={recipes} 
        isLoading={isLoading} 
        searchTerm={search}
        onClearSearch={handleClearSearch}
        layout="mixed"
      />
      
      {/* Pagination */}
      {!isLoading && recipes.length > 0 && (
        <Pagination 
          page={page} 
          totalPages={totalPages} 
          isLimited={isLimited} 
          onNext={handleNextPage} 
          onPrev={handlePrevPage} 
        />
      )}

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        message={limitMessage || "Sign in to view more recipes 🍳"}
      />
    </div>
  );
}
