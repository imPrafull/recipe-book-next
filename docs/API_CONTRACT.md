# Recipe Book API Contract (Frontend Integration Guide)

This document outlines the API endpoints, request/response formats, and integration patterns for the Recipe Book application.

## Base URL
```
/api
```

## Global Standards

### Request Headers
- For `GET` and `DELETE` requests, no special headers are required.
- For `POST /recipes` and `PUT /recipes/:id`, use `Content-Type: multipart/form-data` (the request includes a file upload).
- For any other `POST` or `PUT` requests, use `Content-Type: application/json`.

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
  image: string;         // Pre-signed S3 URL, valid for 24 hours
  createdAt: string;     // ISO Date string
}

// For POST / PUT, send as multipart/form-data.
// `image` is an optional file field (jpg/jpeg/png/webp, max 5 MB).
// `ingredients` and `steps` must be JSON-encoded strings in the form body.
interface NewRecipeForm {
  title: string;
  ingredients: string;   // JSON string – e.g. '["Egg", "Flour"]'
  steps: string;         // JSON string – e.g. '["Mix", "Bake"]'
  description?: string;
  cookingTime?: number;
  image?: File;
}

type UpdateRecipeForm = Partial<NewRecipeForm>;
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

Send as `multipart/form-data`. Array fields (`ingredients`, `steps`) must be JSON-encoded strings.

#### Form Fields
| Field | Type | Required | Notes |
| :--- | :--- | :--- | :--- |
| `title` | `string` | Yes | |
| `ingredients` | `string` | Yes | JSON-encoded array – `'["Egg","Flour"]'` |
| `steps` | `string` | Yes | JSON-encoded array – `'["Mix","Bake"]'` |
| `description` | `string` | No | |
| `cookingTime` | `number` | No | In minutes |
| `image` | `File` | No | jpg/jpeg/png/webp, max 5 MB |

#### Example (JavaScript `fetch`)
```js
const form = new FormData();
form.append('title', 'Spaghetti Carbonara');
form.append('description', 'Authentic Italian pasta');
form.append('ingredients', JSON.stringify(['Spaghetti', 'Eggs', 'Pecorino', 'Guanciale']));
form.append('steps', JSON.stringify(['Boil water', 'Fry guanciale', 'Mix eggs and cheese', 'Combine']));
form.append('cookingTime', '20');
form.append('image', imageFile); // File object from <input type="file">

fetch('/api/recipes', { method: 'POST', body: form });
```

---

### 4. Update Recipe
**`PUT /recipes/:id`**

Send as `multipart/form-data`. All fields are optional — only included fields are updated.

#### Example (JavaScript `fetch` — update title and image)
```js
const form = new FormData();
form.append('title', 'Better Spaghetti Carbonara');
form.append('image', newImageFile);

fetch('/api/recipes/60d21b4667d0d8992e610c85', { method: 'PUT', body: form });
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
5.  **Signed Image URLs**: The `image` field in responses is a pre-signed S3 URL valid for **24 hours**. Do not persist these URLs — always use the freshly returned URL from the API response. Re-fetch the recipe if a cached URL has expired.