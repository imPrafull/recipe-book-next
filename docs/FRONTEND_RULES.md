# Frontend Coding Rules

Framework: React with Next.js
Styling: Tailwind CSS

---

## Component Rules

- Use functional components
- Keep components small and reusable
- Separate UI and logic

---

## Folder Structure

```
app/
  (auth)/
    login/
      page.tsx
    signup/
      page.tsx
  recipes/
    [id]/
      page.tsx
    new/
      page.tsx
    [id]/edit/
      page.tsx
  page.tsx              ← Home / recipe list
  layout.tsx

components/
  Navbar.tsx
  RecipeCard.tsx
  RecipeGrid.tsx
  RecipeForm.tsx
  SearchBar.tsx
  IngredientList.tsx
  StepList.tsx
  Pagination.tsx
  AuthModal.tsx         ← "Sign in to unlock full access 🍳" modal
  LoginForm.tsx
  SignupForm.tsx

hooks/
  useRecipes.ts         ← fetch recipe list
  useRecipe.ts          ← fetch single recipe
  useAuth.ts            ← auth state, login, signup, logout

context/
  AuthContext.tsx        ← global auth state (user, tokens, isAuthenticated)

lib/
  api/
    client.ts           ← axios instance with base URL and interceptors
    recipes.ts          ← recipe API functions (getRecipes, getRecipe, createRecipe, etc.)
    auth.ts             ← auth API functions (login, signup, logout, refresh)
  types.ts              ← TypeScript interfaces mirrored from API_CONTRACT
  utils.ts
```

---

## TypeScript Types (lib/types.ts)

Keep all API types in `lib/types.ts`. These must stay in sync with API_CONTRACT.md.

```ts
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

export interface Recipe {
  id: string;
  title: string;
  description: string;
  cookingTime: number;
  image: string;
  createdAt: string;
  ingredients?: string[];  // omitted for guest users
  steps?: string[];        // omitted for guest users
}

export interface SuccessResponse<T> {
  success: true;
  data: T;
  isLimited?: boolean;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface ErrorResponse {
  success: false;
  error: string;
  code?: string;
}
```

---

## API Client (lib/api/client.ts)

Use axios. Create a single shared instance with the base URL set to `/api`.

Implement a request interceptor that attaches the access token to every request:

```ts
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

Implement a response interceptor that handles token expiry:

```ts
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && error.response?.data?.code === 'TOKEN_EXPIRED' && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const { data } = await axios.post('/api/auth/refresh', { refreshToken });
        localStorage.setItem('accessToken', data.data.accessToken);
        localStorage.setItem('refreshToken', data.data.refreshToken);
        original.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return instance(original);
      } catch {
        // Refresh failed — log user out
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
```

---

## Auth State (context/AuthContext.tsx)

Store the current user and auth state globally using React Context.

Context should expose:
- `user: User | null`
- `isAuthenticated: boolean`
- `login(email, password): Promise<void>`
- `signup(name, email, password): Promise<void>`
- `logout(): Promise<void>`

On app load, check localStorage for existing tokens and call `GET /auth/me` to rehydrate the user.

Token storage:
- Store `accessToken` and `refreshToken` in `localStorage`.
- Clear both on logout.

---

## Guest UX

Check `isLimited` in API responses to decide when to show restricted UI.

Rules:
- If `response.isLimited === true` on the recipe list, show the `AuthModal` when the user tries to paginate beyond page 1.
- If `response.isLimited === true` on recipe details, blur or hide the ingredients and steps sections and show a CTA to log in.
- The `AuthModal` copy: **"Sign in to unlock full access 🍳"**

---

## Recipe Form Serialization

When submitting `POST /recipes` or `PUT /recipes/:id`, the form must be sent as `multipart/form-data`.

`ingredients` and `steps` must be serialized as JSON strings before appending to FormData:

```ts
const formData = new FormData();
formData.append('title', title);
formData.append('description', description);
formData.append('cookingTime', String(cookingTime));
formData.append('ingredients', JSON.stringify(ingredients));  // ← must be JSON string
formData.append('steps', JSON.stringify(steps));              // ← must be JSON string
if (imageFile) formData.append('image', imageFile);
```

Do NOT send ingredients or steps as plain arrays — the backend expects JSON strings.

---

## State Management

Use React hooks.
Use `AuthContext` for global auth state.
Prefer custom hooks for API calls.

---

## Naming

Components: PascalCase

Examples:
RecipeCard
RecipeForm
AuthModal
LoginForm

Hooks: camelCase starting with "use"

Examples:
useRecipes
useRecipe
useAuth
