'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface SearchBarProps {
  variant?: 'navbar' | 'hero';
}

function SearchBarContent({ variant = 'navbar' }: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get('search') || '';
  const [query, setQuery] = useState(urlQuery);

  // Sync state if URL changes from outside (e.g., category pills)
  useEffect(() => {
    setQuery(urlQuery);
  }, [urlQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedQuery = query.trim();
    if (trimmedQuery) {
      router.push(`/recipes?search=${encodeURIComponent(trimmedQuery)}`);
    } else {
      router.push(`/recipes`);
    }
  };

  const isHero = variant === 'hero';

  return (
    <form onSubmit={handleSearch} className={`relative w-full ${isHero ? 'max-w-[600px]' : 'max-w-md'}`}>
      <div className="relative flex items-center w-full group">
        <Search className={`absolute text-muted-foreground group-focus-within:text-primary transition-colors duration-300 ${isHero ? 'left-4 h-5 w-5' : 'left-3 h-4 w-4'}`} />
        <Input
          className={
            isHero 
              ? "pl-12 py-6 text-base bg-muted/30 backdrop-blur-md border-border/60 hover:bg-muted/50 focus:bg-background transition-all duration-300 shadow-sm rounded-2xl"
              : "pl-9 bg-muted/40 backdrop-blur-sm border-border focus:bg-background transition-all duration-300 shadow-sm"
          }
          type="search"
          placeholder={isHero ? "Search for recipes, ingredients..." : "Search recipes..."}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        /> 
      </div>
    </form>
  );
}

export default function SearchBar({ variant = 'navbar' }: SearchBarProps) {
  return (
    <Suspense fallback={
      <div className={`relative w-full bg-muted animate-pulse ${variant === 'hero' ? 'max-w-[600px] h-12 rounded-2xl' : 'max-w-md h-10 rounded-md'}`} />
    }>
      <SearchBarContent variant={variant} />
    </Suspense>
  );
}
