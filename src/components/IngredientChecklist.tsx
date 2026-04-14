'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';

interface IngredientChecklistProps {
  ingredients: string[];
}

export default function IngredientChecklist({ ingredients }: IngredientChecklistProps) {
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());

  const toggleItem = (index: number) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(index)) {
      newChecked.delete(index);
    } else {
      newChecked.add(index);
    }
    setCheckedItems(newChecked);
  };

  if (!ingredients || ingredients.length === 0) {
    return <p className="text-muted-foreground italic">No ingredients listed.</p>;
  }

  return (
    <div className="space-y-3">
      {ingredients.map((ingredient, index) => {
        const isChecked = checkedItems.has(index);
        return (
          <button
            key={index}
            onClick={() => toggleItem(index)}
            className="w-full group flex items-start gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors text-left"
          >
            <div className={`mt-0.5 flex-shrink-0 w-6 h-6 rounded-md border flex items-center justify-center transition-colors shadow-sm ${
              isChecked 
                ? 'bg-primary border-primary text-primary-foreground' 
                : 'bg-background border-border group-hover:border-primary/50'
            }`}>
              {isChecked && <Check className="h-4 w-4" />}
            </div>
            <span className={`text-base leading-relaxed transition-all duration-300 ${
              isChecked ? 'text-muted-foreground line-through opacity-70' : 'text-foreground'
            }`}>
              {ingredient}
            </span>
          </button>
        );
      })}
    </div>
  );
}
