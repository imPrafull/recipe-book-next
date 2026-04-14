import { Clock, Users, Flame } from 'lucide-react';

interface RecipeMetaBarProps {
  cookingTime: number;
}

export default function RecipeMetaBar({ cookingTime }: RecipeMetaBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 py-4 border-y border-border/60 text-sm font-medium text-muted-foreground my-6">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <Clock className="h-4 w-4 text-primary" />
        </div>
        <span className="text-foreground">{cookingTime} mins</span>
      </div>
      
      <div className="w-1 bg-border h-4 rounded-full mix-blend-multiply hidden sm:block delay-100"></div>
      
      {/* Hardcoded forward-looking sections */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
          <Users className="h-4 w-4 text-secondary" />
        </div>
        <span className="text-foreground">4 Servings</span>
      </div>

      <div className="w-1 bg-border h-4 rounded-full mix-blend-multiply hidden sm:block"></div>
      
      <div className="flex items-center gap-2">
        <div className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-xs uppercase tracking-wider font-bold shadow-sm">
          Dinner
        </div>
      </div>
    </div>
  );
}
