import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Recipe } from '@/components/RecipeCard';

export function useRecipe(id: string, isAuthenticated: boolean) {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLimited, setIsLimited] = useState(false);
  const [limitMessage, setLimitMessage] = useState('');

  useEffect(() => {
    if (!id) return;

    let active = true;
    const fetchRecipe = async () => {
      setIsLoading(true);
      try {
        const result = await api.getRecipe(id);
        if (active) {
          setRecipe(result.recipe);
          setIsLimited(result.isLimited || false);
          setLimitMessage(result.message || '');
        }
      } catch (error) {
        console.error('Failed to fetch recipe:', error);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    fetchRecipe();
    return () => { active = false; };
  }, [id, isAuthenticated]);

  return { recipe, isLimited, limitMessage, isLoading };
}
