# CONTRIBUTING.md

## Overview
Welcome to the Symbolkraft DIY Recipes Web App project! This document outlines the guidelines and best practices for contributing to this project. Its purpose is to ensure consistency, maintain context across files, and support efficient collaboration—especially when working with AI tools like ChatGPT.

## Project Architecture & Context
Before making changes, please review the following key documents in the repository:
- **README.md:** Provides a high-level overview of the project’s architecture, including module summaries.
- **CHANGELOG.md:** Tracks major changes and version updates.
- **.env.example:** Template for environment variables (ensure your actual credentials remain secure).
- **Module Files:** Each file (e.g., `index.js`, `csvImporter.js`, `authUtils.js`, `aiSuggestion.js`, `supabaseConnector.js`, `vercelConfig.js`) includes detailed headers and inline comments that explain its role in the overall system.

## Code Style Guidelines
- **File Headers:**  
  Each file should begin with a header that includes:
  - The file’s purpose and role in the project.
  - The overall project context ("Big Picture").
  - Related modules and dependencies.
  - Version tags and last updated dates.
- **Inline Comments:**  
  Use inline comments to explain non-obvious logic, data flow, and important design decisions. These comments help maintain context even when memory limitations occur in ChatGPT sessions.
- **Cross-File References:**  
  When modifying one module, update references in related modules as needed. This helps maintain a cohesive understanding of how different parts of the project interact.

## Workflow Instructions
- **Branching:**  
  Always work on a feature branch when making changes. Use clear, descriptive branch names.
- **Commit Messages:**  
  Write detailed commit messages that explain the context and impact of your changes. Reference updated modules and the CHANGELOG.md if applicable.
- **Testing:**  
  Test your changes locally before pushing. Ensure that any modifications to environment variables, data flow, or module interactions are verified.
- **Documentation Updates:**  
  For any major updates (new features, significant refactoring, configuration changes), update the relevant file headers and the CHANGELOG.md. This ensures that the overall context remains clear.
- **Session Kickoff:**  
  When starting a new ChatGPT session for project assistance, reference the README.md, CHANGELOG.md, and CONTRIBUTING.md files to quickly re-establish the project context.

## Submitting Changes
- Once you have made and tested your changes:
  1. Commit your updates with a detailed commit message.
  2. Push your branch to the repository.
  3. Create a pull request for review, ensuring that you reference any related issues or context notes.
- If necessary, update the CHANGELOG.md with a summary of your changes.

## Additional Resources
- **README.md:** For an overall project overview.
- **CHANGELOG.md:** To see the historical evolution of the project.
- **Module Files:** Each file’s header provides context on its role and integration within the project.
- **Deployment Guides:** Refer to your `vercelConfig.js` and Vercel documentation for deployment specifics.

Thank you for contributing to the Symbolkraft DIY Recipes Web App! Your efforts help maintain a clean, efficient, and context-rich codebase that benefits all collaborators.

---
