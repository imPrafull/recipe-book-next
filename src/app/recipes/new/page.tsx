'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import RecipeForm from '@/components/RecipeForm';
import { Recipe } from '@/components/RecipeCard';
import { Card } from '@/components/ui/card';

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
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-8 mb-16 px-4">
      <div className="max-w-3xl mx-auto mb-8 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight">
          Create New Recipe
        </h1>
        <p className="text-muted-foreground mt-2">Share your culinary masterpiece with the world</p>
      </div>

      <Card className="max-w-3xl mx-auto p-6 sm:p-10 rounded-xl overflow-hidden shadow-sm">
        <RecipeForm
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
          submitLabel="Create Recipe"
        />
      </Card>
    </div>
  );
}
