# UI Specification

## Design Principles

- Clean modern UI
- Mobile-first responsive design
- Focus on readability
- Card-based layouts

---

## Layout

### Navbar

Contains:

- App logo
- Search bar
- Add recipe button

---

### Homepage

Sections:

Navbar

Recipe Grid

Recipe cards showing:

- Recipe image
- Title
- Cooking time
- Short description

---

### Recipe Details Page

Top section:

Recipe image
Recipe title
Cooking time

Sections:

Ingredients list
Cooking steps

Actions:

Edit recipe
Delete recipe

---

### Add Recipe Page

Form fields:

Title
Description
Cooking Time
Ingredients (dynamic list)
Steps (dynamic list)
Image URL

Submit button

---

## Components

Navbar  
RecipeCard  
RecipeGrid  
RecipeForm  
SearchBar  
IngredientList  
StepList

---

## Color Palette

### Theme Colors

- **Primary 50**: `#fff7ed`
- **Primary 100**: `#ffedd5`
- **Primary 500**: `#f97316` (Orange from logo)
- **Primary 600**: `#ea580c`
- **Secondary 50**: `#faf5ff`
- **Secondary 100**: `#f3e8ff`
- **Secondary 500**: `#a855f7` (Purple from logo shadow)
- **Secondary 600**: `#9333ea`

### Base Variables (Light Mode)

- **Background**: `#f8fafc`
- **Foreground**: `#0f172a`
- **Card**: `#ffffff`
- **Card Foreground**: `#0f172a`
- **Border**: `#e2e8f0`

### Base Variables (Dark Mode)

- **Background**: `#0f172a`
- **Foreground**: `#f8fafc`
- **Card**: `#1e293b`
- **Card Foreground**: `#f8fafc`
- **Border**: `#334155`
