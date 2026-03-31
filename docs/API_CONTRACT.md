# Recipe Book API Contract (Frontend Integration Guide)

This document outlines the API endpoints, request/response formats, and integration patterns for the Recipe Book application.

## Base URL
```
/api
```

## Global Standards

### Request Headers
For `POST` and `PUT` requests, ensure the following header is included:
- `Content-Type: application/json`

### Success Response Envelope
All successful requests return a `200 OK` (or `201 Created`) with the following shape:
```typescript
interface SuccessResponse<T> {
  success: true;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}
```

### Error Response Envelope
Failed requests return an appropriate HTTP status code (400, 404, 500) with this shape:
```typescript
interface ErrorResponse {
  success: false;
  error: string; // Human-readable error message
}
```

---

## Data Models (TypeScript Interfaces)

```typescript
interface Recipe {
  id: string;            // Unique identifier
  title: string;         // Recipe name
  description: string;   // Short summary
  ingredients: string[]; // List of ingredients
  steps: string[];       // Step-by-step instructions
  cookingTime: number;   // In minutes
  image: string;         // URL to the image
  createdAt: string;     // ISO Date string
}

type NewRecipe = Omit<Recipe, 'id' | 'createdAt'>;
type UpdateRecipe = Partial<NewRecipe>;
```

---

## Endpoints

### 1. List & Search Recipes
**`GET /recipes`**

Use this to fetch the main grid of recipes. Supports pagination and keyword search.

#### Query Parameters
| Parameter | Type   | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Current page |
| `limit` | `number` | `10` | Items per page (Max 100) |
| `search` | `string` | `""` | Search in **title**, **description**, or **ingredients** |

#### Example Fetch
`GET /api/recipes?search=pasta&page=1&limit=6`

---

### 2. Get Recipe Details
**`GET /recipes/:id`**

Fetches a single recipe by its unique ID.

#### Response `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "60d21b4667d0d8992e610c85",
    "title": "Classic Margherita Pizza",
    ...
  }
}
```

---

### 3. Create New Recipe
**`POST /recipes`**

#### Request Body
```json
{
  "title": "Spaghetti Carbonara",
  "description": "Authentic Italian pasta",
  "ingredients": ["Spaghetti", "Eggs", "Pecorino", "Guanciale"],
  "steps": ["Boil water", "Fry guanciale", "Mix eggs and cheese", "Combine"],
  "cookingTime": 20,
  "image": "https://example.com/carbonara.jpg"
}
```

---

### 4. Update Recipe
**`PUT /recipes/:id`**

You can send partial updates. Only the fields included in the body will be modified.

#### Request Body (Example: Update title only)
```json
{
  "title": "Better Spaghetti Carbonara"
}
```

---

### 5. Delete Recipe
**`DELETE /recipes/:id`**

#### Response `200 OK`
```json
{
  "success": true,
  "data": {
    "message": "Recipe deleted successfully"
  }
}
```

---

## Frontend Integration Tips

1.  **Search Debouncing**: When implementing the search bar, use a debounce (e.g., 300ms) to avoid hitting the API on every keystroke.
2.  **Pagination State**: Store the `pagination` object from the response to manage your `Next` and `Previous` button states using `hasNextPage` and `hasPrevPage`.
3.  **Loading States**: Since this is a real-world API, ensure your UI handles loading and error states gracefully using the `success` flag.
4.  **Optimistic UI**: For `PUT` and `DELETE` actions, you can update the local UI state before the server responds for a snappier feel.