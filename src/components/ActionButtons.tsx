'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, CalendarPlus } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import AuthModal from './AuthModal';

export default function ActionButtons() {
  const { isAuthenticated, isLoading } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMessage, setAuthModalMessage] = useState('');

  const handleAction = (actionType: 'favourite' | 'mealplan') => {
    if (isLoading) return;

    if (!isAuthenticated) {
      setAuthModalMessage(
        actionType === 'favourite' 
          ? "Sign in to save this recipe to your favourites 🍳" 
          : "Sign in to add this recipe to your meal plan 🗓️"
      );
      setIsAuthModalOpen(true);
      return;
    }

    if (actionType === 'favourite') {
      toast.success('Favourites coming soon!');
    } else {
      toast.success('Meal planner coming soon!');
    }
  };

  return (
    <>
      <div className="flex items-center gap-3">
        {/* Save to Favourites Button */}
        <div className="relative group">
          <button
            type="button"
            onClick={() => handleAction('favourite')}
            className="w-10 h-10 rounded-full flex items-center justify-center border border-border bg-card text-foreground hover:bg-primary/5 hover:text-primary hover:border-primary/40 transition-all cursor-pointer shadow-xs"
            aria-label="Save to Favourites"
          >
            <Heart className="h-4.5 w-4.5 text-primary" />
          </button>
          <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-2.5 py-1 rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 font-medium">
            Save to Favourites
          </span>
        </div>

        {/* Add to Meal Plan Button */}
        <div className="relative group">
          <button
            type="button"
            onClick={() => handleAction('mealplan')}
            className="w-10 h-10 rounded-full flex items-center justify-center border border-border bg-card text-foreground hover:bg-secondary/5 hover:text-secondary hover:border-secondary/40 transition-all cursor-pointer shadow-xs"
            aria-label="Add to Meal Plan"
          >
            <CalendarPlus className="h-4.5 w-4.5 text-secondary" />
          </button>
          <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-2.5 py-1 rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 font-medium">
            Add to Meal Plan
          </span>
        </div>
      </div>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        message={authModalMessage}
      />
    </>
  );
}
