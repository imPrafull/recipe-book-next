interface IngredientListProps {
  ingredients: string[];
}

export default function IngredientList({ ingredients }: IngredientListProps) {
  if (!ingredients || ingredients.length === 0) {
    return <p className="text-slate-500 italic">No ingredients specified.</p>;
  }

  return (
    <ul className="space-y-3">
      {ingredients.map((ingredient, index) => (
        <li key={index} className="flex items-start bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700 transition-colors hover:bg-white dark:hover:bg-slate-800 hover:border-primary-100 dark:hover:border-primary-500/30 hover:shadow-sm">
          <div className="flex-shrink-0 mt-0.5 mr-3">
            <div className="h-5 w-5 rounded-full bg-primary-100 dark:bg-primary-500/20 flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-500"></span>
            </div>
          </div>
          <span className="text-slate-700 dark:text-slate-300 leading-relaxed">{ingredient}</span>
        </li>
      ))}
    </ul>
  );
}
