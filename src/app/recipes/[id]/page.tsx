'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Recipe } from '@/components/RecipeCard';
import IngredientList from '@/components/IngredientList';
import StepList from '@/components/StepList';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Clock, ChevronLeft, Pencil, Trash2, Loader2, ListChecks, ChefHat } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function RecipeDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;
  
  const router = useRouter();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await api.deleteRecipe(id);
      router.push('/');
    } catch (error) {
      console.error('Failed to delete recipe:', error);
      setIsDeleting(false);
      setIsDialogOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-32">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="text-center py-32">
        <h1 className="text-2xl font-bold mb-4">Recipe Not Found</h1>
        <Button asChild variant="link">
          <Link href="/">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </div>
    );
  }

  const imgUrl = recipe.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200&q=80';

  return (
    <div className="py-8 pb-20 max-w-4xl mx-auto px-4">
      {/* Top Banner section */}
      <div className="relative rounded-xl overflow-hidden aspect-[21/9] mb-12 shadow-md">
        <img 
          src={imgUrl} 
          alt={recipe.title} 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
        
        <div className="absolute bottom-0 left-0 p-8 w-full z-10 text-white">
          <div className="flex justify-between items-end gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full text-sm font-medium mb-4">
                <Clock className="h-4 w-4" />
                {recipe.cookingTime} mins
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-2 drop-shadow-md">
                {recipe.title}
              </h1>
              <p className="text-lg text-slate-200 max-w-2xl drop-shadow-md line-clamp-2">
                {recipe.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-10 pb-6 border-b border-border gap-4 flex-wrap">
        <Button asChild variant="ghost" className="text-muted-foreground hover:text-foreground">
          <Link href="/">
            <ChevronLeft className="h-5 w-5 mr-1" />
            Back
          </Link>
        </Button>
        <div className="flex gap-3">
          <Button asChild variant="outline" className="shadow-sm">
            <Link href={`/recipes/${recipe.id}/edit`}>
              <Pencil className="h-4 w-4 mr-2 opacity-70" />
              Edit
            </Link>
          </Button>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" className="shadow-sm bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground border-none">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Delete Recipe</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete &quot;{recipe.title}&quot;? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="ghost" onClick={() => setIsDialogOpen(false)} disabled={isDeleting}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                  {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Delete Recipe
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <ListChecks className="h-6 w-6 text-primary" />
              Ingredients
            </h2>
            <IngredientList ingredients={recipe.ingredients || []} />
          </div>
        </div>
        
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <ChefHat className="h-6 w-6 text-secondary" />
            Instructions
          </h2>
          <Card className="p-8 rounded-xl overflow-hidden">
            <StepList steps={recipe.steps || []} />
          </Card>
        </div>
      </div>
    </div>
  );
}
