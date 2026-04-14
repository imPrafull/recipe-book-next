import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, ChevronRight } from 'lucide-react';
import { Recipe } from './RecipeCard';

interface FeaturedRecipeProps {
  recipe: Recipe;
}

export default function FeaturedRecipe({ recipe }: FeaturedRecipeProps) {
  const imgUrl = recipe.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200&q=80';

  return (
    <div className="mb-12">
      <h2 className="text-sm font-bold tracking-widest text-primary uppercase mb-6 flex items-center gap-4 before:h-px before:flex-grow before:bg-border after:h-px after:flex-grow after:bg-border">
        This Week&apos;s Focus
      </h2>
      <Link href={`/recipes/${recipe.id}`} className="block group">
        <Card className="overflow-hidden bg-card hover:shadow-2xl transition-all duration-500 rounded-2xl border-none ring-1 ring-border/50 grid grid-cols-1 md:grid-cols-2 gap-0 relative">
          <div className="relative aspect-[4/3] md:aspect-auto h-full w-full overflow-hidden">
            <img 
              src={imgUrl} 
              alt={recipe.title} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-md text-foreground text-xs font-bold px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-primary" />
              {recipe.cookingTime} min
            </div>
          </div>
          <CardContent className="p-8 md:p-12 flex flex-col justify-center">
            <h3 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 leading-tight group-hover:text-primary transition-colors duration-300">
              {recipe.title}
            </h3>
            <p className="text-lg text-muted-foreground leading-relaxed italic mb-8 border-l-4 border-primary/30 pl-4">
              &quot;{recipe.description}&quot;
            </p>
            <div className="mt-auto flex items-center text-primary font-bold uppercase tracking-wider text-sm group-hover:translate-x-2 transition-transform duration-300">
              Get the Recipe <ChevronRight className="ml-1 h-4 w-4" />
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
