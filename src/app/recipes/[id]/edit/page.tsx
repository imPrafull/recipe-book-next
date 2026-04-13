'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import RecipeForm from '@/components/RecipeForm';
import { Recipe } from '@/components/RecipeCard';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useRecipe } from '@/hooks/use-recipe';

export default function EditRecipePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;

  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { recipe, isLoading } = useRecipe(id, isAuthenticated);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isAuthLoading, router]);

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      await api.updateRecipe(id, formData);
      router.push(`/recipes/${id}`);
    } catch (error) {
      console.error('Failed to update recipe:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthLoading || !isAuthenticated || isLoading) {
    return (
      <div className="flex justify-center items-center py-32">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!recipe) {
    return <div className="text-center py-20 text-xl font-bold">Recipe not found</div>;
  }

  return (
    <div className="py-8 mb-16 px-4">
      <div className="max-w-3xl mx-auto mb-8 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight">
          Edit Recipe
        </h1>
        <p className="text-muted-foreground mt-2">Update information for {recipe.title}</p>
      </div>

      <Card className="max-w-3xl mx-auto p-6 sm:p-10 rounded-xl overflow-hidden shadow-sm">
        <RecipeForm
          initialData={recipe}
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
          submitLabel="Save Changes"
        />
      </Card>
    </div>
  );
}
