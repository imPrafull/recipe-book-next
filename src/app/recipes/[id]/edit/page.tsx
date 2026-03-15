'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import RecipeForm from '@/components/RecipeForm';
import { Recipe } from '@/components/RecipeCard';

export default function EditRecipePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;

  const router = useRouter();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const data = await api.getRecipe(id);
        setRecipe(data);
      } catch (error) {
        console.error('Failed to fetch recipe:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecipe();
  }, [id]);

  const handleSubmit = async (data: Partial<Recipe>) => {
    setIsSubmitting(true);
    try {
      await api.updateRecipe(id, data);
      router.push(`/recipes/${id}`);
    } catch (error) {
      console.error('Failed to update recipe:', error);
      alert('Failed to update recipe. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-32">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!recipe) {
    return <div className="text-center py-20 text-xl font-bold text-slate-800 dark:text-slate-100">Recipe not found</div>;
  }

  return (
    <div className="py-8 mb-16 animate-fade-in">
      <div className="max-w-3xl mx-auto mb-8 text-center">
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
          Edit Recipe
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Update information for {recipe.title}</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-100 dark:border-slate-700">
        <RecipeForm
          initialData={recipe}
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
          submitLabel="Save Changes"
        />
      </div>
    </div>
  );
}
