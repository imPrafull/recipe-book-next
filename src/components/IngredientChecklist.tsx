'use client';

import { useState } from 'react';
import { Check, RotateCcw } from 'lucide-react';

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

  const resetAll = () => {
    setCheckedItems(newSet => {
      const next = new Set(newSet);
      next.clear();
      return next;
    });
  };

  if (!ingredients || ingredients.length === 0) {
    return <p className="text-muted-foreground italic py-2">No ingredients listed.</p>;
  }

  const totalCount = ingredients.length;
  const checkedCount = checkedItems.size;
  const progressPercent = Math.round((checkedCount / totalCount) * 100);

  return (
    <div className="space-y-4">
      {/* Header & Progress Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Ingredients ({checkedCount}/{totalCount} ready)
          </span>
        </div>
        {checkedCount > 0 && (
          <button
            onClick={resetAll}
            className="text-xs font-medium text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors self-start sm:self-auto"
          >
            <RotateCcw className="w-3 h-3" />
            Reset checklist
          </button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-muted/60 h-1.5 rounded-full overflow-hidden">
        <div 
          className="bg-primary h-full transition-all duration-300 ease-out rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Checklist items */}
      <div className="grid grid-cols-1 gap-2.5 pt-1">
        {ingredients.map((ingredient, index) => {
          const isChecked = checkedItems.has(index);
          return (
            <button
              key={index}
              type="button"
              onClick={() => toggleItem(index)}
              className={`w-full group flex items-center gap-3.5 p-3.5 rounded-xl border transition-all duration-200 text-left cursor-pointer ${
                isChecked
                  ? 'bg-muted/30 border-border/40'
                  : 'bg-card border-border/70 hover:border-primary/40 hover:bg-accent/30 hover:shadow-xs'
              }`}
            >
              <div
                className={`flex-shrink-0 w-5 h-5 rounded-full border flex items-center justify-center transition-all duration-200 ${
                  isChecked
                    ? 'bg-primary border-primary text-primary-foreground scale-105'
                    : 'border-muted-foreground/40 group-hover:border-primary text-transparent bg-background'
                }`}
              >
                <Check className={`h-3.5 w-3.5 transition-transform duration-200 ${isChecked ? 'scale-100' : 'scale-0'}`} />
              </div>
              <span
                className={`text-base leading-snug transition-all duration-200 select-none ${
                  isChecked
                    ? 'text-muted-foreground line-through opacity-60 font-normal'
                    : 'text-foreground font-medium group-hover:text-foreground'
                }`}
              >
                {ingredient}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

