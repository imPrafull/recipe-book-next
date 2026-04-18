'use client';

import { useMemo, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRecipes } from '@/hooks/use-recipes';
import RecipeGrid from '@/components/RecipeGrid';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import CategoryPills from '@/components/CategoryPills';
import FeaturedRecipe from '@/components/FeaturedRecipe';
import FavouritesTeaser from '@/components/FavouritesTeaser';

export default function Home({ searchParams }: { searchParams: Promise<{ search?: string }> }) {
  const router = useRouter();
  const params = use(searchParams);
  const search = params.search;

  useEffect(() => {
    if (search) {
      router.replace(`/recipes?search=${encodeURIComponent(search)}`);
    }
  }, [search, router]);

  // Prevent flash of content while redirecting
  if (search) return null;

  // Use our custom hook with a limit of 6 for the teaser
  const fetchParams = useMemo(() => ({ page: 1, limit: 6 }), []);
  const { recipes, isLoading } = useRecipes(fetchParams);

  return (
    <div className="py-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-foreground mb-3">
            The Cookbook
          </h1>
          <p className="text-lg text-muted-foreground font-medium">Curated recipes for the modern kitchen.</p>
        </div>
      </div>
      
      <CategoryPills />
      
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {recipes.length > 0 && (
            <FeaturedRecipe recipe={recipes[0]} />
          )}

          {recipes.length > 0 && (
            <FavouritesTeaser />
          )}

          <div className="mb-6 mt-12 flex justify-between items-center gap-4">
            <h2 className="text-2xl font-bold tracking-tight">
              All Recipes
            </h2>
            <Button asChild variant="ghost" className="text-primary hover:text-primary/80 font-semibold group flex items-center">
              <Link href="/recipes">
                View All
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>

          <RecipeGrid recipes={recipes.length > 0 ? recipes.slice(1, 6) : recipes} />
        </>
      )}
    </div>
  );
}
