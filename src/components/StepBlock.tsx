'use client';

import { useState } from 'react';
import { Check, RotateCcw } from 'lucide-react';

interface StepBlockProps {
  steps: string[];
}

export default function StepBlock({ steps }: StepBlockProps) {
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const toggleStep = (index: number) => {
    const next = new Set(completedSteps);
    if (next.has(index)) {
      next.delete(index);
    } else {
      next.add(index);
    }
    setCompletedSteps(next);
  };

  const resetAll = () => {
    setCompletedSteps(newSet => {
      const next = new Set(newSet);
      next.clear();
      return next;
    });
  };

  if (!steps || steps.length === 0) {
    return <p className="text-muted-foreground italic py-2">No steps listed.</p>;
  }

  const totalCount = steps.length;
  const completedCount = completedSteps.size;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="space-y-4">
      {/* Header & Progress Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Steps ({completedCount}/{totalCount} completed)
          </span>
        </div>
        {completedCount > 0 && (
          <button
            type="button"
            onClick={resetAll}
            className="text-xs font-medium text-muted-foreground hover:text-secondary flex items-center gap-1 transition-colors self-start sm:self-auto cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            Reset steps
          </button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-muted/60 h-1.5 rounded-full overflow-hidden">
        <div 
          className="bg-secondary h-full transition-all duration-300 ease-out rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Step Items */}
      <div className="space-y-3 pt-1">
        {steps.map((step, index) => {
          const isDone = completedSteps.has(index);
          const stepNum = index + 1;

          return (
            <div
              key={index}
              onClick={() => toggleStep(index)}
              className={`group relative p-4 sm:p-4.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                isDone
                  ? 'bg-muted/30 border-border/40'
                  : 'bg-card border-border/70 hover:border-secondary/40 hover:bg-accent/30 hover:shadow-xs'
              }`}
            >
              {/* Top header row inside step card */}
              <div className="flex items-center justify-between gap-3 mb-2.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-md text-xs font-bold tracking-wider uppercase transition-colors ${
                      isDone
                        ? 'bg-muted text-muted-foreground'
                        : 'bg-secondary/15 text-secondary border border-secondary/20 group-hover:bg-secondary group-hover:text-secondary-foreground'
                    }`}
                  >
                    Step {stepNum.toString().padStart(2, '0')}
                  </span>
                </div>

                {/* Completion badge toggle */}
                <div
                  className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium transition-all ${
                    isDone
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-semibold'
                      : 'text-muted-foreground/60 group-hover:text-muted-foreground'
                  }`}
                >
                  <div
                    className={`w-3.5 h-3.5 rounded-full flex items-center justify-center transition-all ${
                      isDone
                        ? 'bg-emerald-500 text-white'
                        : 'border border-border/80 group-hover:border-secondary'
                    }`}
                  >
                    {isDone && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </div>
                  <span>{isDone ? 'Completed' : 'Mark done'}</span>
                </div>
              </div>

              {/* Step text content */}
              <p
                className={`text-base leading-relaxed transition-all select-none ${
                  isDone
                    ? 'text-muted-foreground line-through opacity-75 font-normal'
                    : 'text-foreground/90 font-normal'
                }`}
              >
                {step}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}


