'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Clock, Lock, Heart, ChefHat } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export interface Recipe {
  id: string;
  title: string;
  description: string;
  cookingTime: number;
  image: string;
  ingredients?: string[];
  steps?: string[];
  isLocked?: boolean; // Contextual prop for guest lock
}

interface RecipeCardProps {
  recipe: Recipe;
  variant?: 'landscape' | 'portrait';
}

export default function RecipeCard({ recipe, variant = 'portrait' }: RecipeCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsFavorite(!isFavorite);
  };

  // Deterministic color fallback based on title
  const getFallbackColor = (title: string) => {
    const colors = [
      'from-orange-400 to-rose-400', 'from-emerald-400 to-teal-500', 
      'from-blue-400 to-indigo-500', 'from-violet-400 to-fuchsia-500', 
      'from-amber-300 to-orange-500', 'from-rose-400 to-pink-600'
    ];
    let hash = 0;
    for (let i = 0; i < title.length; i++) {
      hash = title.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const fallbackGradient = getFallbackColor(recipe.title);

  const ImageContent = (
    <div className="relative h-full w-full overflow-hidden bg-muted group-hover:shadow-inner transition-all duration-500">
      {recipe.image ? (
        <img 
          src={recipe.image} 
          alt={recipe.title} 
          className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-[1.03] group-hover:brightness-105"
          loading="lazy"
        />
      ) : (
        <div className={`w-full h-full bg-gradient-to-br ${fallbackGradient} flex items-center justify-center relative overflow-hidden`}>
          <div className="absolute inset-0 bg-black/10 mix-blend-overlay"></div>
          <span className="text-white/40 text-8xl font-black uppercase tracking-tighter select-none rotate-[-5deg] scale-150 transform-gpu mix-blend-overlay">
            {recipe.title.charAt(0)}
          </span>
          <ChefHat className="h-16 w-16 text-white/50 drop-shadow-md z-10" />
        </div>
      )}

      {/* Badges Overlay */}
      <div className="absolute top-4 left-4 z-20 flex gap-2">
        <Badge className="bg-background/80 hover:bg-background/90 text-foreground backdrop-blur-md shadow-sm border-none font-semibold px-3 py-1">
          {variant === 'landscape' ? 'Dinner' : 'Breakfast'}
        </Badge>
      </div>

      {/* Favorite Quick Action */}
      <button 
        onClick={toggleFavorite}
        className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-background/80 hover:bg-background/90 backdrop-blur-md transition-all duration-300 shadow-sm group/btn hover:scale-105 active:scale-95"
      >
        <Heart className={`h-4 w-4 transition-colors ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-muted-foreground group-hover/btn:text-rose-500'}`} />
      </button>

      {/* Content Fade Overlay (Portrait only gets bottom fade, Landscape gets none) */}
      {variant === 'portrait' && (
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-90 bottom-[-2px] pointer-events-none" />
      )}

      {/* Guest Lock Overlay */}
      {recipe.isLocked && (
        <div className="absolute inset-0 bg-background/20 backdrop-blur-[2px] z-30 flex items-center justify-center transition-opacity">
           <div className="bg-background/90 p-4 rounded-full flex items-center justify-center shadow-xl border border-border/50">
             <Lock className="h-5 w-5 text-foreground" />
           </div>
        </div>
      )}
    </div>
  );

  if (variant === 'landscape') {
    return (
      <Link href={`/recipes/${recipe.id}`} className="block h-[220px] group border border-border/40 rounded-xl overflow-hidden bg-card transition-all duration-300 hover:border-primary/30 hover:shadow-lg shadow-sm">
        <div className="flex h-full w-full">
          <div className="w-[45%] flex-shrink-0 relative overflow-hidden">
            {ImageContent}
          </div>
          <div className="flex-1 p-6 md:p-8 flex flex-col justify-center min-w-0 bg-card z-10 relative">
            <h3 className="text-2xl md:text-3xl font-extrabold text-foreground leading-tight line-clamp-2 mb-3 group-hover:text-primary transition-colors">
              {recipe.title}
            </h3>
            <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed mb-6 max-w-sm">
              {recipe.description || 'A delicious recipe waiting to be cooked.'}
            </p>
            <div className="flex items-center gap-1.5 text-muted-foreground text-sm font-semibold tracking-wide uppercase">
              <Clock className="h-4 w-4 text-primary/70" />
              <span>{recipe.cookingTime} mins</span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Portrait Variant (default)
  return (
    <Link href={`/recipes/${recipe.id}`} className="block group border border-border/40 rounded-xl overflow-hidden bg-card transition-all duration-300 hover:border-primary/30 hover:shadow-xl shadow-sm flex flex-col h-full min-h-[420px]">
      <div className="relative h-[60%] flex-shrink-0">
        {ImageContent}
      </div>
      
      <div className="flex-1 px-6 pb-8 pt-2 flex flex-col relative z-10">
        <h3 className="text-2xl font-extrabold text-foreground leading-snug line-clamp-2 mt-2 group-hover:text-primary transition-colors">
          {recipe.title}
        </h3>
        
        <div className="mt-auto pt-6 flex items-center gap-2 text-muted-foreground text-sm font-semibold tracking-wide uppercase">
          <Clock className="h-4 w-4 text-primary/70" />
          <span>{recipe.cookingTime} mins</span>
        </div>
      </div>
    </Link>
  );
}
