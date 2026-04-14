import { Button } from '@/components/ui/button';

export default function CategoryPills() {
  const categories = [
    "All Recipes",
    "Breakfast", 
    "Quick & Easy", 
    "Vegetarian", 
    "Pasta", 
    "Soups",
    "Desserts",
    "Comfort Food"
  ];

  return (
    <div className="w-full overflow-x-auto pb-4 mb-8 scrollbar-hide">
      <div className="flex gap-3 min-w-max px-1">
        {categories.map((cat, index) => (
          <Button
            key={cat}
            variant={index === 0 ? "default" : "outline"}
            className={`rounded-full px-6 transition-all duration-300 font-medium ${
              index === 0 
                ? "bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-md shadow-secondary/20" 
                : "hover:border-secondary hover:text-secondary border-border bg-background"
            }`}
          >
            {cat}
          </Button>
        ))}
      </div>
    </div>
  );
}
