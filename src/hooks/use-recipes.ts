import { useState, useEffect } from 'react';
import { api, GetRecipesParams } from '@/lib/api';
import { Recipe } from '@/components/RecipeCard';

export function useRecipes(params: GetRecipesParams) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [isLimited, setIsLimited] = useState(false);
  const [limitMessage, setLimitMessage] = useState('');

  useEffect(() => {
    let active = true;
    const fetchRecipes = async () => {
      setIsLoading(true);
      try {
        const result = await api.getRecipes(params);
        if (active) {
          setRecipes(Array.isArray(result.recipes) ? result.recipes : []);
          setTotalPages(result.pagination?.totalPages || 1);
          setIsLimited(!!result.isLimited);
          setLimitMessage(result.message || '');
        }
      } catch (error) {
        console.error('Failed to fetch recipes:', error);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    fetchRecipes();
    return () => { active = false; };
  }, [params.search, params.page, params.limit]);

  return { recipes, totalPages, isLimited, limitMessage, isLoading };
}
