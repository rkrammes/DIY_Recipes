# DIY Recipes: Data Model

This document outlines the core data model for the DIY Recipes application, based on the comprehensive architectural vision. It defines the main entities and their relationships, providing a foundation for database design and API development.

## Core Entities

### User
Represents a user of the application.
-   Authentication information
-   Preferences

### Recipe
Represents a single recipe.
-   Core recipe information (e.g., name, description)
-   Ingredients (with amounts and units)
-   Instructions (ordered steps)
-   Categories (hierarchical organization)
-   Tags (flexible labeling system)
-   Media (images, videos)
-   Notes
-   Versions (historical versions)

### Ingredient
Represents an ingredient used in recipes.
-   Ingredient details and properties (e.g., nutritional info)
-   Alternatives (substitution options)
-   Categories (classification)

### Category
Represents a category for organizing recipes or ingredients.
-   Hierarchical structure

### Tag
Represents a tag for flexible labeling of recipes.

### Version
Represents a historical version of a recipe.

## Entity Relationships

-   A **User** can own multiple **Recipes**.
-   A **User** can mark **Recipes** as favorites.
-   A **User** has **Preferences**.
-   A **Recipe** contains multiple **Ingredients** (with specific amounts and units for that recipe).
-   A **Recipe** has ordered **Instructions**.
-   A **Recipe** can belong to one or more **Categories**.
-   A **Recipe** can have multiple **Tags**.
-   A **Recipe** can have associated **Media**.
-   A **Recipe** can have **Notes**.
-   A **Recipe** can have multiple **Versions**.
-   An **Ingredient** can have **Properties**.
-   An **Ingredient** can have **Alternatives** (other ingredients).
-   An **Ingredient** can belong to one or more **Categories**.