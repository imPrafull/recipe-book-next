'use client';

import { Suspense, useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';

function CategoryPillsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSearch = searchParams.get('search') || '';
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [needsScroll, setNeedsScroll] = useState(false);

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

  const checkScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    const hasScroll = scrollWidth > clientWidth;
    
    setNeedsScroll(hasScroll);
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    checkScroll();
    const handleScroll = () => checkScroll();
    const handleResize = () => checkScroll();

    container.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);

    return () => {
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    scrollContainerRef.current?.scrollBy({
      left: direction === 'left' ? -300 : 300,
      behavior: 'smooth',
    });
  };

  const handleSelect = (cat: string) => {
    router.push(cat === "All Recipes" ? '/recipes' : `/recipes?search=${encodeURIComponent(cat)}`);
  };

  return (
    <div className="relative flex items-center gap-2">
      {/* Left Arrow - Only show if scrolling is needed AND not at start */}
      {needsScroll && canScrollLeft && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-0 top-[38%] -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-muted hover:bg-muted transition-colors disabled:opacity-50"
          onClick={() => scroll('left')}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      )}

      {/* Scrollable Container */}
      <div 
        ref={scrollContainerRef}
        className="w-full overflow-x-auto pb-2 scroll-smooth [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted-foreground/30 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/50"
      >
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

      {/* Right Arrow - Only show if scrolling is needed AND not at end */}
      {needsScroll && canScrollRight && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-0 top-[38%] -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-muted hover:bg-muted transition-colors disabled:opacity-50"
          onClick={() => scroll('right')}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}
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
