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
      <div className="flex gap-3 my-6">
        <Button 
          variant="outline" 
          size="lg" 
          className="flex-1 rounded-xl shadow-sm hover:border-primary hover:text-primary transition-colors"
          onClick={() => handleAction('favourite')}
        >
          <Heart className="h-5 w-5 mr-2" />
          Save to Favourites
        </Button>
        <Button 
          variant="outline" 
          size="lg" 
          className="flex-1 rounded-xl shadow-sm hover:border-secondary hover:text-secondary transition-colors"
          onClick={() => handleAction('mealplan')}
        >
          <CalendarPlus className="h-5 w-5 mr-2" />
          Add to Meal Plan
        </Button>
      </div>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        message={authModalMessage}
      />
    </>
  );
}
