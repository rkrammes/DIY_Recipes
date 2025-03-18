# SESSION_CONTEXT.md

## Purpose
This document serves as a quick-reference guide to re-establish the context of the Symbolkraft DIY Recipes Web App project in new ChatGPT sessions. It provides a consolidated overview of the project’s architecture, key modules, and workflow instructions.

## Project Overview
- **Project Name:** Symbolkraft DIY Recipes Web App
- **Core Functionalities:**
  - **CSV Imports:** Batch processing for recipes and ingredients.
  - **AI Suggestions:** Data-driven creative recommendations for enhancing recipes.
  - **Secure Authentication:** User authentication with bcryptjs.
  - **Deployment & Backend:** Continuous deployment via Vercel and data management through Supabase.

## Key Modules and Their Roles
1. **index.js**  
   - **Role:** Bootstraps the application, sets up middleware, and defines API endpoints.
2. **csvImporter.js**  
   - **Role:** Handles CSV file uploads, parsing, and converts CSV data into structured objects.
3. **authUtils.js**  
   - **Role:** Manages user authentication, including password hashing and verification.
4. **aiSuggestion.js**  
   - **Role:** Provides AI-based suggestions for recipe modifications.
5. **supabaseConnector.js**  
   - **Role:** Manages interactions with the Supabase backend, storing and retrieving data.
6. **vercelConfig.js**  
   - **Role:** Contains deployment configurations and environment variables.
7. **CHANGELOG.md**  
   - **Role:** Tracks major updates and version changes for the project.
8. **.env.example**  
   - **Role:** Template for environment variables (rename to .env for actual deployment).
9. **CONTRIBUTING.md**  
   - **Role:** Provides guidelines and best practices for contributing to the project.

## Workflow Instructions for New Sessions
- **Step 1:** Read this **SESSION_CONTEXT.md** file to quickly re-establish context.
- **Step 2:** Refer to **README.md** for a high-level project overview.
- **Step 3:** Use the headers and inline comments in each module file to understand specific functionalities.
- **Step 4:** Check **CHANGELOG.md** for recent updates and major changes.
- **Step 5:** Follow the guidelines in **CONTRIBUTING.md** for best practices on code modifications and contributions.

## Final Notes
- **Update as Needed:** This file should be updated whenever new modules are added or major changes are made.
- **Consistency:** Using this document consistently helps both ChatGPT and human collaborators maintain a clear understanding of the project, minimizing context loss due to session limitations.

---

**Instructions for Developers and ChatGPT:**
1. Before starting any work or seeking assistance, review this file.
2. Use the summaries and references provided to navigate the project quickly.
3. Ensure all modifications follow the guidelines outlined in the CONTRIBUTING.md file.

Thank you for contributing to the Symbolkraft DIY Recipes Web App!
