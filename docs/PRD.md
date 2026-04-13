# Recipe Book Web App – Product Requirements

## Overview

Recipe Book is a web application that allows users to store and manage cooking recipes.

Users can add recipes, browse recipes, search recipes, and view detailed cooking instructions.

The application focuses on simplicity, clean UI, and ease of use.

---

## Core Features

1. View recipes (limited for non-authenticated users)
2. View recipe details (limited for non-authenticated users)
3. Add recipe (requires authentication)
4. Edit recipe (requires authentication)
5. Delete recipe (requires authentication)
6. Search recipes by title and ingredients (limited for non-authenticated users)

---

## Authentication

Authentication is optional but required for full access.

### Guest Users (Not Logged In)

Guest users can:

* View a limited number of recipes (e.g., first 10 recipes OR first page only)
* View limited recipe details
* Search recipes (limited results)

Restrictions:

* Pagination beyond the first page is blocked
* Full recipe details may be partially restricted (optional)
* Show prompt to log in for full access

---

### Authenticated Users

Authenticated users can:

* View all recipes (full pagination)
* View full recipe details
* Search all recipes
* Add recipes
* Edit recipes
* Delete recipes

---

## Recipe Data Model

Recipe

* id
* title
* description
* ingredients[]
* steps[]
* cookingTime
* image
* createdAt

---

## Pages

Home Page
Shows list of recipes (limited for guest users).

Recipe Details Page
Shows recipe information (limited for guest users).

Add Recipe Page
Form to create recipe (requires login).

Edit Recipe Page
Form to update recipe (requires login).

---

## UX Behavior

* When a guest user tries to:

  * paginate beyond limit
  * view full details
  * perform restricted actions

Show a modal:

"Sign in to unlock full access 🍳"

---

## Future Features

* Categories
* Favorites
* Cooking mode
* User accounts with private and public recipes
* Subscriptions for users