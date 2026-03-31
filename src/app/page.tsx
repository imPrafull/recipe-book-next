'use client';

import { useEffect, useState, use } from 'react';
import { api } from '@/lib/api';
import { Recipe } from '@/components/RecipeCard';
import RecipeGrid from '@/components/RecipeGrid';

export default function Home({ searchParams }: { searchParams: Promise<{ search?: string }> }) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Unwrap the promise dynamically handling the updated Next.js 15 API
  const params = use(searchParams);
  const search = params.search;

  useEffect(() => {
    const fetchRecipes = async () => {
      setIsLoading(true);
      try {
        const { recipes: data } = await api.getRecipes({ search });
        setRecipes(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to fetch recipes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecipes();
  }, [search]);

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
        <RecipeGrid recipes={recipes} />
      )}
    </div>
  );
}
