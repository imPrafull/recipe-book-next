# API Contract

Base URL

/api

---

GET /recipes

Returns list of recipes

---

GET /recipes/:id

Returns a single recipe

---

POST /recipes

Creates a recipe

Body:

{
  "title": "Pasta",
  "description": "Creamy pasta",
  "ingredients": [],
  "steps": [],
  "cookingTime": 20,
  "image": "url"
}

---

PUT /recipes/:id

Updates recipe

---

DELETE /recipes/:id

Deletes recipe