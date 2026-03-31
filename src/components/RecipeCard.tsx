import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, ChevronRight } from 'lucide-react';

export interface Recipe {
  id: string;
  title: string;
  description: string;
  cookingTime: number;
  image: string;
  ingredients?: string[];
  steps?: string[];
}

interface RecipeCardProps {
  recipe: Recipe;
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  // Use a fallback image if none provided
  const imgUrl = recipe.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80';

  return (
    <Link href={`/recipes/${recipe.id}`} className="block group h-full">
      <Card className="flex flex-col h-full overflow-hidden hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-1">
        {/* Image Container with aspect ratio */}
        <div className="relative aspect-video w-full overflow-hidden bg-muted">
          <img 
            src={imgUrl} 
            alt={recipe.title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          {/* Cooking Time Badge */}
          <div className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm text-foreground text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1 border border-border/50">
            <Clock className="h-3.5 w-3.5 text-primary" />
            {recipe.cookingTime} min
          </div>
        </div>

        {/* Card Content */}
        <CardHeader className="p-5 pb-2">
          <CardTitle className="text-lg line-clamp-1 group-hover:text-primary transition-colors">
            {recipe.title}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-5 pt-0 flex-grow">
          <p className="text-muted-foreground text-sm line-clamp-2">
            {recipe.description}
          </p>
        </CardContent>
        
        <CardFooter className="p-5 pt-0 flex items-center text-primary text-sm font-medium">
          View Recipe
          <ChevronRight className="h-4 w-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
        </CardFooter>
      </Card>
    </Link>
  );
}
