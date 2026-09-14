'use client';

import { useState } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Clock,
  CalendarDays,
  Info,
  Trash2,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useMealPlanner } from '@/hooks/useMealPlanner';
import MealPlannerGrid from '@/components/MealPlannerGrid';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export default function MealPlannerPage() {
  const {
    addRecipeToSlot,
    removeRecipeFromSlot,
    getSlotRecipes,
    hasAnyRecipes,
    formattedWeekRange,
    weekStatus,
    isCurrentWeek,
    dayDates,
    isLoading,
    isSaving,
    error,
    goToPreviousWeek,
    goToNextWeek,
    goToCurrentWeek,
    clearWeek,
  } = useMealPlanner();

  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  const handleConfirmClear = async () => {
    setConfirmClearOpen(false);
    await clearWeek();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-primary/10 via-secondary/5 to-background border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6 space-y-4">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            {/* Title & Status Badge */}
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary/10 rounded-xl border border-primary/20 shadow-xs">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight">
                    Weekly Meal Planner
                  </h1>

                  {/* Saving/Loading Indicator */}
                  {isSaving && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Saving...
                    </span>
                  )}

                  {/* Top Level Week Status Indicator */}
                  {isCurrentWeek && (
                    <>
                      <div className="md:hidden relative group">
                        <button
                          className="inline-flex items-center justify-center transition-colors"
                          title="Current Week"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        </button>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-slate-900 dark:bg-slate-950 text-white text-xs rounded-lg px-2.5 py-1.5 whitespace-nowrap z-50 pointer-events-none shadow-lg">
                          Current Week
                        </div>
                      </div>
                      <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Current Week
                      </span>
                    </>
                  )}
                  {weekStatus === 'past' && (
                    <>
                      <div className="md:hidden relative group">
                        <button
                          className="inline-flex items-center justify-center transition-colors"
                          title="Past Week Archive"
                        >
                          <Info className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                        </button>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-slate-900 dark:bg-slate-950 text-white text-xs rounded-lg p-2.5 whitespace-nowrap z-50 pointer-events-none shadow-lg">
                          <Clock className="h-3 w-3 inline mr-1.5" />
                          Past Week: {formattedWeekRange}
                        </div>
                      </div>
                      <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                        <Clock className="h-3 w-3" />
                        Past Week
                      </span>
                    </>
                  )}
                  {weekStatus === 'future' && (
                    <>
                      <div className="md:hidden relative group">
                        <button
                          className="inline-flex items-center justify-center transition-colors"
                          title="Upcoming Week"
                        >
                          <CalendarDays className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                        </button>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-slate-900 dark:bg-slate-950 text-white text-xs rounded-lg px-2.5 py-1.5 whitespace-nowrap z-50 pointer-events-none shadow-lg">
                          Upcoming Week
                        </div>
                      </div>
                      <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                        <CalendarDays className="h-3 w-3" />
                        Upcoming
                      </span>
                    </>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Plan your meals and organize your week
                </p>
              </div>
            </div>

            {/* Week Navigation Controls & Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
              {/* Clear Week Button - Positioned BEFORE navigation pill box on XL screens */}
              {hasAnyRecipes && (
                <button
                  onClick={() => setConfirmClearOpen(true)}
                  disabled={isSaving || isLoading}
                  title="Clear all meals for this week"
                  className="hidden xl:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl transition-all duration-200 border border-rose-500/30 shadow-xs whitespace-nowrap disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Clear Week</span>
                </button>
              )}

              {/* This Week Button - Positioned BEFORE navigation pill box on XL screens */}
              {!isCurrentWeek && (
                <button
                  onClick={goToCurrentWeek}
                  title="Jump to Current Week"
                  className="hidden xl:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 rounded-xl transition-all duration-200 border border-primary/30 shadow-xs whitespace-nowrap"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>This Week</span>
                </button>
              )}

              {/* Fixed Navigation Pill Box */}
              <div className="flex items-center gap-2 bg-background/80 backdrop-blur border border-border/60 p-1.5 rounded-xl shadow-xs">
                <button
                  onClick={goToPreviousWeek}
                  title="Previous Week"
                  aria-label="Previous Week"
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-foreground bg-muted/40 hover:bg-muted rounded-lg transition-colors border border-border/40"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Prev Week</span>
                </button>

                <div className="px-3 py-1 text-center bg-muted/20 rounded-lg border border-border/20">
                  <span className="text-sm font-semibold text-foreground whitespace-nowrap flex items-center gap-1.5">
                    {formattedWeekRange}
                    {isLoading && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
                  </span>
                </div>

                <button
                  onClick={goToNextWeek}
                  title="Next Week"
                  aria-label="Next Week"
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-foreground bg-muted/40 hover:bg-muted rounded-lg transition-colors border border-border/40"
                >
                  <span className="hidden sm:inline">Next Week</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Clear Week Button - Shown AFTER pill box on small/medium screens (< XL) */}
              {hasAnyRecipes && (
                <button
                  onClick={() => setConfirmClearOpen(true)}
                  disabled={isSaving || isLoading}
                  title="Clear all meals for this week"
                  className="flex xl:hidden items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl transition-all duration-200 border border-rose-500/30 shadow-xs whitespace-nowrap disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Clear Week</span>
                </button>
              )}

              {/* This Week Button - Shown AFTER pill box on small/medium screens (< XL) */}
              {!isCurrentWeek && (
                <button
                  onClick={goToCurrentWeek}
                  title="Jump to Current Week"
                  className="flex xl:hidden items-center gap-1.5 px-3 py-2 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 rounded-xl transition-all duration-200 border border-primary/30 shadow-xs whitespace-nowrap"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">This Week</span>
                </button>
              )}
            </div>
          </div>

          {/* Meal Types Legend */}
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground pt-1 border-t border-border/20">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-amber-500"></span>
              <span>Breakfast</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Lunch</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-orange-500"></span>
              <span>Dinner</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-purple-500"></span>
              <span>Snack 1</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-500"></span>
              <span>Snack 2</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3 text-sm text-rose-700 dark:text-rose-300">
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Context Banner based on Week Status */}
        {weekStatus === 'past' && (
          <div className="hidden md:flex mb-6 p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl items-center justify-between text-sm text-amber-800 dark:text-amber-300">
            <div className="flex items-center gap-2.5">
              <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>
                <strong className="font-semibold">Past Week Archive:</strong> You are viewing meal plans for <strong>{formattedWeekRange}</strong>.
              </span>
            </div>
            <button
              onClick={goToCurrentWeek}
              className="text-xs font-semibold text-amber-700 dark:text-amber-300 underline hover:no-underline whitespace-nowrap ml-2"
            >
              Return to Current Week &rarr;
            </button>
          </div>
        )}

        {weekStatus === 'future' && (
          <div className="hidden md:flex mb-6 p-3.5 bg-blue-500/10 border border-blue-500/20 rounded-xl items-center justify-between text-sm text-blue-800 dark:text-blue-300">
            <div className="flex items-center gap-2.5">
              <CalendarDays className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>
                <strong className="font-semibold">Future Planner:</strong> Preparing upcoming meals for <strong>{formattedWeekRange}</strong>.
              </span>
            </div>
            <button
              onClick={goToCurrentWeek}
              className="text-xs font-semibold text-blue-700 dark:text-blue-300 underline hover:no-underline whitespace-nowrap ml-2"
            >
              Return to Current Week &rarr;
            </button>
          </div>
        )}

        {/* Helpful tip for empty weeks */}
        {!hasAnyRecipes && !isLoading && (
          <div className="mb-8 p-4 bg-primary/5 border border-primary/20 rounded-xl text-center">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">👋 No meals planned for this week yet:</span> Click any "+ Add recipe" button below to start planning meals for {formattedWeekRange}.
            </p>
          </div>
        )}

        {/* Meal planner grid */}
        <MealPlannerGrid
          getSlotRecipes={getSlotRecipes}
          onAddRecipe={addRecipeToSlot}
          onRemoveRecipe={removeRecipeFromSlot}
          dayDates={dayDates}
        />
      </div>

      {/* Confirmation Dialog for Clearing Week */}
      <Dialog open={confirmClearOpen} onOpenChange={setConfirmClearOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
              <Trash2 className="h-5 w-5" />
              Clear Week's Meal Plan?
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to remove all planned meals for <strong>{formattedWeekRange}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 justify-end mt-4">
            <Button variant="outline" onClick={() => setConfirmClearOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmClear}>
              Yes, Clear Week
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Footer Note */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="text-center text-xs text-muted-foreground/70">
          <p>
            Your meal plans are automatically saved and synced with your account.
          </p>
        </div>
      </div>
    </div>
  );
}
