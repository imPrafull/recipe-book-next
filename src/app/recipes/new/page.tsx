'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import RecipeForm from '@/components/RecipeForm';
import { Recipe } from '@/components/RecipeCard';

export default function AddRecipePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: Partial<Recipe>) => {
    setIsSubmitting(true);
    try {
      const newRecipe = await api.createRecipe(data);
      router.push(`/recipes/${newRecipe.id}`);
    } catch (error) {
      console.error('Failed to create recipe:', error);
      alert('Failed to create recipe. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-8 mb-16 animate-fade-in">
      <div className="max-w-3xl mx-auto mb-8 text-center">
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
          Create New Recipe
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Share your culinary masterpiece with the world</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-100 dark:border-slate-700">
        <RecipeForm
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
          submitLabel="Create Recipe"
        />
      </div>
    </div>
  );
}
