import { Recipe } from '@/components/RecipeCard';

// In-memory database for demo purposes
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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search');
  
  if (search) {
    const filtered = recipes.filter(r => r.title.toLowerCase().includes(search.toLowerCase()));
    return Response.json(filtered);
  }
  
  return Response.json(recipes);
}

export async function POST(request: Request) {
  const body = await request.json();
  const newRecipe: Recipe = {
    ...body,
    id: Date.now().toString(),
  };
  
  recipes.push(newRecipe);
  return Response.json(newRecipe, { status: 201 });
}
