import type { Recipe, Ingredient } from '../lib/types';

// User types matching API_CONTRACT.md
export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string;
  bio: string;
  socialLinks: {
    website: string;
    twitter: string;
    instagram: string;
    facebook: string;
  };
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// Mock token generation
export function createAuthTokens(userId: string = 'test-user-id', expired: boolean = false): AuthTokens {
  const now = Date.now();
  const expiry = expired ? now - 1000 : now + 900000; // 15 minutes from now or expired
  
  // Simple mock JWT format (not real JWT, just for testing)
  const accessToken = `mock.access.token.${userId}.${expiry}`;
  const refreshToken = `mock.refresh.token.${userId}.${now + 604800000}`; // 7 days
  
  return {
    accessToken,
    refreshToken,
  };
}

// Validate mock token format and check expiry
export function validateToken(token: string): { valid: boolean; userId: string | null; expired: boolean } {
  if (!token || !token.startsWith('mock.')) {
    return { valid: false, userId: null, expired: false };
  }
  
  const parts = token.split('.');
  if (parts.length < 5) {
    return { valid: false, userId: null, expired: false };
  }
  
  const userId = parts[3];
  const expiry = parseInt(parts[4], 10);
  const now = Date.now();
  const expired = expiry < now;
  
  return { valid: true, userId, expired };
}

// User factory
export function createUser(overrides: Partial<User> = {}): User {
  return {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    avatar: 'https://via.placeholder.com/150',
    bio: 'I love cooking!',
    socialLinks: {
      website: 'https://example.com',
      twitter: '@testuser',
      instagram: '@testuser',
      facebook: 'testuser',
    },
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

// Ingredient factory
export function createIngredient(overrides: Partial<Ingredient> = {}): Ingredient {
  return {
    id: `ingredient-${Math.random().toString(36).substring(7)}`,
    name: 'Test Ingredient',
    quantity: 1,
    unit: 'cup',
    notes: '',
    ...overrides,
  };
}

// Recipe factory
export function createRecipe(overrides: Partial<Recipe> = {}): Recipe {
  return {
    id: `recipe-${Math.random().toString(36).substring(7)}`,
    title: 'Test Recipe',
    description: 'A delicious test recipe',
    cookingTime: 30,
    image: 'https://via.placeholder.com/400x300',
    createdAt: new Date().toISOString(),
    ingredients: [
      createIngredient({ name: 'Flour', quantity: 2, unit: 'cups' }),
      createIngredient({ name: 'Sugar', quantity: 1, unit: 'cup' }),
    ],
    steps: [
      'Mix ingredients',
      'Bake at 350°F',
      'Enjoy!',
    ],
    ...overrides,
  };
}

// Seed data for tests
export const mockUsers = {
  testUser: createUser(),
  adminUser: createUser({
    id: 'admin-user-id',
    email: 'admin@example.com',
    name: 'Admin User',
  }),
};

export const mockRecipes: Recipe[] = [
  createRecipe({
    id: 'recipe-1',
    title: 'Classic Margherita Pizza',
    description: 'The quintessential pizza with tomato, mozzarella, and basil',
    cookingTime: 15,
    ingredients: [
      createIngredient({ id: 'ing-1-1', name: 'Pizza dough', quantity: 1, unit: 'ball' }),
      createIngredient({ id: 'ing-1-2', name: 'Tomato sauce', quantity: 0.5, unit: 'cup' }),
      createIngredient({ id: 'ing-1-3', name: 'Mozzarella', quantity: 200, unit: 'g' }),
      createIngredient({ id: 'ing-1-4', name: 'Fresh basil', quantity: 10, unit: 'leaves' }),
    ],
    steps: [
      'Roll out the pizza dough',
      'Spread tomato sauce evenly',
      'Add mozzarella cheese',
      'Bake at 475°F for 12-15 minutes',
      'Garnish with fresh basil',
    ],
  }),
  createRecipe({
    id: 'recipe-2',
    title: 'Chocolate Chip Cookies',
    description: 'Soft and chewy homemade cookies',
    cookingTime: 25,
    ingredients: [
      createIngredient({ id: 'ing-2-1', name: 'Butter', quantity: 1, unit: 'cup' }),
      createIngredient({ id: 'ing-2-2', name: 'Sugar', quantity: 0.75, unit: 'cup' }),
      createIngredient({ id: 'ing-2-3', name: 'Brown sugar', quantity: 0.75, unit: 'cup' }),
      createIngredient({ id: 'ing-2-4', name: 'Eggs', quantity: 2, unit: 'whole' }),
      createIngredient({ id: 'ing-2-5', name: 'Flour', quantity: 2.25, unit: 'cups' }),
      createIngredient({ id: 'ing-2-6', name: 'Chocolate chips', quantity: 2, unit: 'cups' }),
    ],
    steps: [
      'Cream butter and sugars together',
      'Beat in eggs one at a time',
      'Mix in flour gradually',
      'Fold in chocolate chips',
      'Drop spoonfuls onto baking sheet',
      'Bake at 375°F for 10-12 minutes',
    ],
  }),
  createRecipe({
    id: 'recipe-3',
    title: 'Caesar Salad',
    description: 'Crisp romaine with classic Caesar dressing',
    cookingTime: 10,
  }),
  createRecipe({
    id: 'recipe-4',
    title: 'Spaghetti Carbonara',
    description: 'Traditional Italian pasta with eggs, cheese, and pancetta',
    cookingTime: 20,
  }),
  createRecipe({
    id: 'recipe-5',
    title: 'Chicken Tikka Masala',
    description: 'Tender chicken in creamy tomato curry sauce',
    cookingTime: 45,
  }),
  createRecipe({
    id: 'recipe-6',
    title: 'Beef Tacos',
    description: 'Flavorful ground beef tacos with fresh toppings',
    cookingTime: 20,
  }),
  createRecipe({
    id: 'recipe-7',
    title: 'Greek Moussaka',
    description: 'Layered eggplant and meat casserole',
    cookingTime: 90,
  }),
  createRecipe({
    id: 'recipe-8',
    title: 'Thai Green Curry',
    description: 'Aromatic coconut curry with vegetables',
    cookingTime: 30,
  }),
  createRecipe({
    id: 'recipe-9',
    title: 'French Onion Soup',
    description: 'Rich caramelized onion soup with cheese',
    cookingTime: 60,
  }),
  createRecipe({
    id: 'recipe-10',
    title: 'Pad Thai',
    description: 'Classic Thai stir-fried noodles',
    cookingTime: 25,
  }),
  createRecipe({
    id: 'recipe-11',
    title: 'Beef Wellington',
    description: 'Elegant beef tenderloin wrapped in pastry',
    cookingTime: 120,
  }),
  createRecipe({
    id: 'recipe-12',
    title: 'Vegetable Stir Fry',
    description: 'Quick and healthy mixed vegetables',
    cookingTime: 15,
  }),
];
