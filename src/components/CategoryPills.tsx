'use client';

import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter, useSearchParams } from 'next/navigation';

function CategoryPillsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSearch = searchParams.get('search') || '';

  const categories = [
    "All Recipes",
    "Breakfast", 
    "Quick & Easy", 
    "Vegetarian", 
    "Pasta", 
    "Soups",
    "Desserts",
    "Comfort Food"
  ];

  const handleSelect = (cat: string) => {
    if (cat === "All Recipes") {
      router.push('/recipes');
    } else {
      router.push(`/recipes?search=${encodeURIComponent(cat)}`);
    }
  };

  return (
    <div className="w-full overflow-x-auto pb-4 mb-8 scrollbar-hide">
      <div className="flex gap-3 min-w-max px-1">
        {categories.map((cat) => {
          const isActive = cat === "All Recipes" ? !currentSearch : currentSearch === cat;
          
          return (
            <Button
              key={cat}
              onClick={() => handleSelect(cat)}
              variant={isActive ? "default" : "outline"}
              className={`rounded-full px-6 transition-all duration-300 font-medium ${
                isActive 
                  ? "bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-md shadow-secondary/20" 
                  : "hover:border-secondary hover:text-secondary border-border bg-background"
              }`}
            >
              {cat}
            </Button>
          );
        })}
      </div>
    </div>
  );
}

export default function CategoryPills() {
  return (
    <Suspense fallback={<div className="h-10 mb-8" />}>
      <CategoryPillsContent />
    </Suspense>
  );
}
