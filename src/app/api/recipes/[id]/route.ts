import { Recipe } from '@/components/RecipeCard';

// Since this is in-memory for testing, we must share state or just use the same initial data.
// In a real app we'd use a DB. We'll duplicate the state just to satisfy routing for now, 
// though actually it's better to isolate data logic.
// However, since it's a demo, we will use fetch calls to the Next Server for mutations.

let recipes: Recipe[] = [
  {
    id: "1",
    title: "Creamy Garlic Parmesan Pasta",
    description: "A rich and delicious pasta dish ready in under 30 minutes. Perfect for easy weeknight dinners.",
    cookingTime: 25,
    image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&q=80",
    ingredients: [
      "8 oz fettuccine or linguine",
      "2 tbsp butter",
      "4 cloves garlic, minced",
      "1 cup heavy cream",
      "1/2 cup grated Parmesan cheese",
      "Salt and pepper to taste"
    ],
    steps: [
      "Boil pasta in salted water according to package instructions.",
      "Melt butter in a large skillet over medium heat.",
      "Add minced garlic and sauté until fragrant (about 1 minute).",
      "Stir in heavy cream and let it simmer for 3-4 minutes until slightly thickened.",
      "Whisk in Parmesan cheese until smooth.",
      "Toss the cooked pasta in the sauce. Serve hot with extra cheese!"
    ]
  },
  {
    id: "2",
    title: "Classic Avocado Toast",
    description: "Simple, healthy, and incredibly satisfying breakfast.",
    cookingTime: 10,
    image: "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=800&q=80",
    ingredients: [
      "2 slices sourdough bread",
      "1 ripe avocado",
      "1/2 lemon, juiced",
      "Pinch of red pepper flakes",
      "Sea salt and black pepper"
    ],
    steps: [
      "Toast the bread slices until golden brown.",
      "Cut the avocado in half, remove the pit, and scoop the flesh into a bowl.",
      "Mash the avocado with lemon juice, salt, and pepper.",
      "Spread the mashed avocado evenly onto the toast.",
      "Sprinkle with red pepper flakes and serve immediately."
    ]
  }
];

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Await the params according to Next.js 15 routing rules
  const { id } = await params;
  const recipe = recipes.find(r => r.id === id);
  if (!recipe) return new Response('Not Found', { status: 404 });
  return Response.json(recipe);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const index = recipes.findIndex(r => r.id === id);
  if (index === -1) return new Response('Not Found', { status: 404 });
  
  const body = await request.json();
  recipes[index] = { ...recipes[index], ...body, id }; // Ensure ID stays same
  return Response.json(recipes[index]);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const initialLength = recipes.length;
  recipes = recipes.filter(r => r.id !== id);
  
  if (recipes.length === initialLength) {
    return new Response('Not Found', { status: 404 });
  }
  
  return new Response(null, { status: 204 });
}
