'use client';

import { useAuth } from '@/lib/auth-context';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Lock } from 'lucide-react';
import { useState } from 'react';
import AuthModal from './AuthModal';

export default function FavouritesTeaser() {
  const { isAuthenticated, isLoading } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (isLoading) return null;

  return (
    <div className="mb-16">
      <h2 className="text-2xl font-bold tracking-tight mb-6 flex items-center gap-2">
        <Heart className="h-6 w-6 text-primary fill-primary/20" />
        My Favourites
      </h2>
      
      <div className="relative">
        {/* Fake Grid of Skeleton Cards to act as background for guest or empty state */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 ${!isAuthenticated ? 'filter blur-sm opacity-60 pointer-events-none select-none' : ''}`}>
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden border-dashed border-border/60 bg-muted/20">
              <div className="aspect-video bg-muted/40 animate-pulse"></div>
              <CardContent className="p-4 space-y-3">
                <div className="h-5 bg-muted/60 rounded w-3/4 animate-pulse"></div>
                <div className="h-4 bg-muted/40 rounded w-full animate-pulse"></div>
                <div className="h-4 bg-muted/40 rounded w-2/3 animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Overlay for Guests */}
        {!isAuthenticated && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10">
            <div className="bg-background/95 backdrop-blur-md border border-border p-8 rounded-2xl shadow-xl max-w-sm w-full mx-auto transform transition-all hover:scale-105 duration-300">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Sign in to save favourites</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Curate your own personal cookbook by saving recipes you love.
              </p>
              <Button onClick={() => setIsModalOpen(true)} className="w-full shadow-md font-semibold text-md h-12">
                Unlock Favourites
              </Button>
            </div>
          </div>
        )}

        {/* Overlay for Authenticated Users (Empty State) */}
        {isAuthenticated && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10">
            <div className="bg-background/80 backdrop-blur-sm border border-dashed border-border p-8 rounded-2xl max-w-md w-full mx-auto">
              <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-2">No favourites yet</h3>
              <p className="text-sm text-muted-foreground">
                You haven&apos;t saved any favourites yet. Tap the heart icon on any recipe to add it here!
              </p>
            </div>
          </div>
        )}
      </div>

      <AuthModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        message="Sign in to save and view your favourite recipes 🍳"
      />
    </div>
  );
}
