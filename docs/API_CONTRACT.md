# Recipe Book API Contract (Frontend Integration Guide)

This document outlines the API endpoints, request/response formats, and integration patterns for the Recipe Book application.

## Base URL
```
/api
```

## Global Standards

### Request Headers
- **Authentication**: For authenticated requests, include `Authorization: Bearer <JWT_TOKEN>`.
- For `GET` requests, headers are optional. If no token is provided (or if it's invalid), the API treats the requester as a **Guest**.
- For `POST /recipes`, `PUT /recipes/:id`, and `DELETE /recipes/:id`, a valid JWT is **required**.
- For `POST` and `PUT` with file uploads, use `Content-Type: multipart/form-data`.
- For other `POST` or `PUT` requests, use `Content-Type: application/json`.

### Success Response Envelope
All successful requests return a `200 OK` (or `201 Created`) with the following shape:
```typescript
interface SuccessResponse<T> {
  success: true;
  data: T;
  isLimited?: boolean;      // true if content is restricted for guest users
  message?: string;        // explanation message (e.g., "Login to see more")
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
Failed requests return an appropriate HTTP status code (400, 401, 404, 500) with this shape:
```typescript
interface ErrorResponse {
  success: false;
  error: string; // Human-readable error message
  code?: string; // Machine-readable error code (e.g., "TOKEN_EXPIRED")
}
```

---

## Authentication & Guest Access

The API uses a dual-token system for security and user experience:

1.  **Access Token**: Short-lived (e.g., 15m). Include in `Authorization: Bearer <token>` header.
2.  **Refresh Token**: Long-lived (e.g., 7d). Used to obtain new access/refresh pairs.

### 1. Guest Users (Unauthenticated)
- **Identification**: No `Authorization` header provided or invalid token.
- **Recipe List**: Limited to the **first page** (maximum 10 results). Subsequent pages return a limited response.
- **Recipe Details**: `ingredients` and `steps` arrays are **omitted**.
- **Search**: Results are limited to 10 items.
- **Action**: Cannot Create, Update, or Delete recipes.

### 2. Authenticated Users
- **Identification**: Valid `Authorization: Bearer <token>` header.
- **Full Access**: No pagination limits, full recipe details, full search results.
- **Actions**: Full CRUD capabilities.

### 3. Token Expiration Logic
When an access token expires, the server returns a `401 Unauthorized` response with a specific error code:
```json
{
  "success": false,
  "error": "Access token expired. Please refresh your token.",
  "code": "TOKEN_EXPIRED"
}
```
The frontend should check for `code === "TOKEN_EXPIRED"` and call the `/auth/refresh` endpoint to get new tokens before retrying the original request.

---

## Data Models (TypeScript Interfaces)

```typescript
interface User {
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

interface Recipe {
  id: string;
  title: string;
  description: string;
  cookingTime: number;
  image: string;         // Pre-signed S3 URL
  createdAt: string;
  // Note: guest users will NOT receive these fields or they will be empty
  ingredients?: string[]; 
  steps?: string[];
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// For POST / PUT (Authenticated Only)
interface NewRecipeForm {
  title: string;
  ingredients: string;   // JSON string array
  steps: string;         // JSON string array
  description?: string;
  cookingTime?: number;
  image?: File;
}
```

---

## Endpoints

### 1. Authentication Endpoints

#### **`POST /auth/signup`**
Create a new user account.

- **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "strongpassword123",
    "name": "Jane Doe"
  }
  ```
- **Response `201 Created`**:
  ```json
  {
    "success": true,
    "data": {
      "user": User,
      "accessToken": "...",
      "refreshToken": "..."
    }
  }
  ```

---

#### **`POST /auth/login`**
Authenticate an existing user.

- **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "strongpassword123"
  }
  ```
- **Response `200 OK`**: Same as Signup.

---

#### **`GET /auth/me` (Protected)**
Get current user profile.

- **Response `200 OK`**: `SuccessResponse<{ user: User }>`

---

#### **`PATCH /auth/me` (Protected)**
Update current user profile.

- **Body (Partial)**:
  ```json
  {
    "name": "Updated Name",
    "bio": "Passionate cook!",
    "avatar": "https://...",
    "socialLinks": {
      "twitter": "@handle"
    }
  }
  ```
- **Response `200 OK`**: `SuccessResponse<{ user: User }>`

---

#### **`POST /auth/logout`**
Log out the current user.

- **Response `200 OK`**: `{ "success": true, "data": { "message": "Logged out successfully" } }`

---

#### **`POST /auth/refresh`**
Exchange a valid refresh token for a new access and refresh token pair (token rotation).

- **Body**: `{ "refreshToken": "string" }`
- **Response `200 OK`**: `SuccessResponse<AuthTokens>`

---

### 2. List & Search Recipes
**`GET /recipes`**

#### Access Rules:
- **Guest**: Returns `isLimited: true` and `message: "Login to see more recipes"` if `page > 1` or if results are capped.
- **Authenticated**: Returns full paginated results.

#### Query Parameters
| Parameter | Type   | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Current page |
| `limit` | `number` | `10` | Items per page |
| `search` | `string` | `""` | Keyword search |

---

### 3. Get Recipe Details
**`GET /recipes/:id`**

#### Access Rules:
- **Guest**: `ingredients` and `steps` are hidden. Returns `isLimited: true`.
- **Authenticated**: Returns full recipe object.

#### Response `200 OK` (Guest Example)
```json
{
  "success": true,
  "data": {
    "id": "60d21b4667d0d8992e610c85",
    "title": "Classic Margherita Pizza",
    "description": "The quintessential pizza...",
    "cookingTime": 15,
    "image": "https://...",
    "createdAt": "2024-03-20T..."
  },
  "isLimited": true,
  "message": "Login to see full ingredients and steps"
}
```

---

### 4. Create New Recipe (AUTH REQUIRED)
**`POST /recipes`**

Requires valid JWT. Send as `multipart/form-data`.

---

### 5. Update Recipe (AUTH REQUIRED)
**`PUT /recipes/:id`**

Requires valid JWT. Send as `multipart/form-data`.

---

### 6. Delete Recipe (AUTH REQUIRED)
**`DELETE /recipes/:id`**

Requires valid JWT.

---

## Frontend Integration Tips

1.  **Auth State**: Check `isLimited` in responses to decide when to show the "Sign in to unlock full access 🍳" modal.
2.  **Auth Interceptor**: Implement an Axios/Fetch interceptor that:
    *   Attaches the `accessToken` to every request.
    *   If a `401` occurs with `code: TOKEN_EXPIRED`, calls `/auth/refresh`.
    *   Updates the tokens in storage and retries the original request.
    *   If refresh fails (refresh token expired), logs the user out.
3.  **JWT Persistence**: Store `accessToken` and `refreshToken` in `localStorage` or a secure cookie.
4.  **Fallback UI**: For guest users, show a preview of recipes but blur or hide the sections for steps/ingredients with a CTA to log in.
5.  **Signed URLs**: Image URLs are temporary (24h). Always use the URL from the latest API response.