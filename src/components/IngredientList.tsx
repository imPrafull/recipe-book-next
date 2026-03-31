interface IngredientListProps {
  ingredients: string[];
}

export default function IngredientList({ ingredients }: IngredientListProps) {
  if (!ingredients || ingredients.length === 0) {
    return <p className="text-muted-foreground italic">No ingredients specified.</p>;
  }

  return (
    <ul className="space-y-3">
      {ingredients.map((ingredient, index) => (
        <li key={index} className="flex items-start bg-muted/50 rounded-lg p-3 border border-border transition-colors hover:bg-muted/80 hover:shadow-sm">
          <div className="flex-shrink-0 mt-0.5 mr-3">
            <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
            </div>
          </div>
          <span className="text-foreground leading-relaxed">{ingredient}</span>
        </li>
      ))}
    </ul>
  );
}
