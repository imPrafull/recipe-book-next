'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Pencil, Trash2, Loader2, ListChecks, ChefHat, Lock } from 'lucide-react';
import AuthModal from '@/components/AuthModal';
import { useAuth } from '@/lib/auth-context';
import { useRecipe } from '@/hooks/use-recipe';
import RecipeMetaBar from '@/components/RecipeMetaBar';
import IngredientChecklist from '@/components/IngredientChecklist';
import StepBlock from '@/components/StepBlock';
import CollectionStrip from '@/components/CollectionStrip';
import ActionButtons from '@/components/ActionButtons';
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
  const { isAuthenticated } = useAuth();
  
  const { recipe, isLimited, limitMessage, isLoading } = useRecipe(id, isAuthenticated);

  const [isDeleting, setIsDeleting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

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
    <div className="py-8 pb-20 max-w-7xl mx-auto px-4 lg:px-8">
      <div className="flex items-center gap-4 mb-8">
        <Button asChild variant="ghost" className="text-muted-foreground hover:text-foreground">
          <Link href="/">
            <ChevronLeft className="h-5 w-5 mr-1" />
            Back to Library
          </Link>
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-12 xl:gap-16">
        
        {/* Left Column: Sticky Anchor */}
        <div className="w-full lg:w-5/12 xl:w-1/2">
          <div className="lg:sticky lg:top-24 space-y-6">
            <div className="relative rounded-2xl overflow-hidden aspect-[4/3] md:aspect-[16/9] lg:aspect-square shadow-xl ring-1 ring-border/50">
              <img 
                src={imgUrl} 
                alt={recipe.title} 
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
            
            <div className="pt-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter mb-4 leading-none text-foreground">
                {recipe.title}
              </h1>
              
              <RecipeMetaBar cookingTime={recipe.cookingTime} />
              
              <p className="text-lg text-muted-foreground leading-relaxed italic border-l-4 border-primary/20 pl-4 my-6">
                &quot;{recipe.description}&quot;
              </p>

              <ActionButtons />

              {isAuthenticated && (
                <div className="flex gap-3 pt-6 border-t border-border/60">
                  <Button asChild variant="ghost" className="text-muted-foreground">
                    <Link href={`/recipes/${recipe.id}/edit`}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit this recipe
                    </Link>
                  </Button>

                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" className="text-destructive hover:bg-destructive/10 hover:text-destructive">
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
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Scrollable Instructions */}
        <div className="w-full lg:w-7/12 xl:w-1/2 pt-4 lg:pt-0">
          {isLimited ? (
            <div className="relative rounded-3xl overflow-hidden border border-border/50 bg-card">
              {/* Blurred skeleton content representing ingredients/steps */}
              <div className="p-8 lg:p-12 filter blur-md opacity-40 select-none pointer-events-none">
                <h2 className="text-2xl font-bold mb-6">Ingredients</h2>
                <div className="space-y-4 mb-12">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-6 h-6 rounded bg-muted-foreground/20"></div>
                      <div className="h-6 bg-muted-foreground/20 rounded w-3/4"></div>
                    </div>
                  ))}
                </div>
                <h2 className="text-2xl font-bold mb-6">Instructions</h2>
                <div className="space-y-8">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-6">
                      <div className="text-5xl font-black text-muted-foreground/20">0{i}</div>
                      <div className="flex-grow space-y-3 pt-3">
                        <div className="h-4 bg-muted-foreground/20 rounded w-full"></div>
                        <div className="h-4 bg-muted-foreground/20 rounded w-5/6"></div>
                        <div className="h-4 bg-muted-foreground/20 rounded w-2/3"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lock CTA Overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-background/30 backdrop-blur-[2px]">
                <div className="bg-background/95 border border-border p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center">
                  <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                    <Lock className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-black mb-3 leading-tight tracking-tight">Login to unlock</h3>
                  <p className="text-muted-foreground mb-8 text-sm">
                    {limitMessage || "Get access to detailed ingredient lists and step-by-step cooking instructions."}
                  </p>
                  <Button size="lg" className="w-full text-md h-12 shadow-primary/20 shadow-lg" onClick={() => setIsAuthModalOpen(true)}>
                    Sign In to Continue
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-16">
              <section>
                <h2 className="text-2xl md:text-3xl font-bold mb-8 flex items-center gap-3 tracking-tight">
                  <ListChecks className="h-7 w-7 text-primary" />
                  What you'll need
                </h2>
                <div className="bg-card p-6 md:p-8 rounded-3xl shadow-sm border border-border/50">
                  <IngredientChecklist ingredients={recipe.ingredients || []} />
                </div>
              </section>
              
              <section>
                <h2 className="text-2xl md:text-3xl font-bold mb-8 flex items-center gap-3 tracking-tight">
                  <ChefHat className="h-7 w-7 text-secondary" />
                  How to make it
                </h2>
                <div className="bg-card p-6 md:p-10 rounded-3xl shadow-sm border border-border/50">
                  <StepBlock steps={recipe.steps || []} />
                </div>
              </section>
            </div>
          )}

          {!isLimited && (
            <CollectionStrip currentRecipeId={recipe.id} />
          )}
        </div>
      </div>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        message={limitMessage || "Sign in to view full ingredients and instructions."}
      />
    </div>
  );
}
