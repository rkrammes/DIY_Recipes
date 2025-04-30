# DIY Recipes API Documentation

This document provides details on the DIY Recipes system API, implemented using Next.js API Route Handlers.

## Authentication

Most API endpoints require authentication. Users must first obtain a session token (likely a JWT managed by Supabase Auth) by logging in via the frontend UI. Subsequent API requests must include this token, typically in the `Authorization: Bearer <token>` header or via a session cookie managed by Supabase.

API routes are protected server-side. Unauthenticated requests to protected routes will result in a `401 Unauthorized` error.

## Endpoints

The following endpoints are currently implemented based on the modernized features:

*(Note: Base path is assumed to be `/api`. Exact paths might differ based on implementation in `/src/app/api`.)*

### Authentication Endpoints

These endpoints are typically handled by the Supabase client library on the frontend but might have corresponding backend handlers.

-   **POST `/api/auth/signup`**
    -   Description: Registers a new user.
    -   Request Body: `{ "email": "user@example.com", "password": "yourpassword" }`
    -   Response (Success): `200 OK` with user session data.
    -   Response (Error): `400 Bad Request` (e.g., invalid input), `409 Conflict` (e.g., user already exists).
-   **POST `/api/auth/signin`**
    -   Description: Logs in an existing user.
    -   Request Body: `{ "email": "user@example.com", "password": "yourpassword" }`
    -   Response (Success): `200 OK` with user session data.
    -   Response (Error): `400 Bad Request` (e.g., invalid input), `401 Unauthorized` (e.g., invalid credentials).
-   **POST `/api/auth/signout`**
    -   Description: Logs out the current user.
    -   Request Body: None
    -   Response (Success): `200 OK`.
    -   Response (Error): `500 Internal Server Error`.

### Recipe Endpoints

-   **GET `/api/recipes`**
    -   Description: Retrieves a list of recipes accessible to the authenticated user.
    -   Authentication: Required.
    -   Parameters: None currently defined (potentially add pagination/filtering later).
    -   Response (Success): `200 OK` with an array of Recipe objects.
        ```json
        [
          { "id": "uuid-1", "name": "Recipe 1", "description": "...", ... },
          { "id": "uuid-2", "name": "Recipe 2", "description": "...", ... }
        ]
        ```
    -   Response (Error): `401 Unauthorized`, `500 Internal Server Error`.
-   **GET `/api/recipes/{id}`**
    -   Description: Retrieves the details of a specific recipe by its ID.
    -   Authentication: Required.
    -   Path Parameter: `{id}` - The unique identifier (UUID) of the recipe.
    -   Response (Success): `200 OK` with a single Recipe object.
        ```json
        { "id": "uuid-1", "name": "Recipe 1", "description": "...", "ingredients": [...], ... }
        ```
    -   Response (Error): `401 Unauthorized`, `404 Not Found`, `500 Internal Server Error`.

*(Note: POST, PUT, DELETE endpoints for recipes are part of ongoing development.)*

## Data Models (TypeScript Interfaces - Simplified)

These represent the expected structure of data objects. Refer to the actual type definitions in the codebase (`/src/lib/types.ts` or similar) for the complete structure.

```typescript
interface User {
  id: string; // UUID from Supabase Auth
  email: string;
  // other profile fields
}

interface Ingredient {
  id: string; // UUID
  name: string;
  quantity: number;
  unit: string;
  // other fields
}

interface Recipe {
  id: string; // UUID
  name: string;
  description: string;
  instructions: string;
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
  user_id: string; // Foreign key to User
  ingredients: Ingredient[];
  // other fields like analysis results, iteration history etc.
}