# Roo Code Mode Definitions & Workflows

This document outlines the purpose, efficient usage, escalation guidelines, prompt examples, and Boomerang task integration for each Roo Code mode, optimized for cost efficiency and high-quality output.

---

## 1. Code Mode (code)

**Purpose:**
Specialized for writing, reviewing, and refactoring code. Focuses on generating functional, modular, and maintainable code based on user specifications.

**Efficiency Instructions:**
*   **Be Specific:** Provide clear, detailed requirements. Instead of "build a login form," specify "create an HTML form with email and password fields, a submit button, and basic client-side validation for email format."
*   **Request Modularity:** Ask for code in functions, classes, or components. "Write a JavaScript function `validateEmail(email)` that returns true if the email format is valid."
*   **Iterative Development:** For complex features, request a basic skeleton first, then ask for specific parts to be fleshed out. "Generate the basic HTML structure for a product card," followed by "Add CSS styles for the product card title and price."
*   **Use Comments:** Prefer in-code comments for explanations over lengthy descriptions in the response.
*   **Leverage Free Tiers:** Aim to complete tasks within the free tier limits by breaking down large requests.

**Escalation Guidelines:**
*   Highly complex algorithms or niche domain logic requiring deep expertise.
*   Tasks demanding extremely high accuracy or performance optimization where free models struggle.
*   When hitting rate limits on free models and the task is time-sensitive.

**Prompt Examples:**
*   "Refactor this JavaScript function to use async/await instead of Promises: `[code snippet]`"
*   "Generate a Python Flask route `/api/users` that fetches all users from a PostgreSQL database (assume DB connection `db_conn` exists)."
*   "Create a React component `UserProfile` that takes `userName` and `avatarUrl` as props and displays them."

**Boomerang Integration:**
*   **Delegate to Ask:** If a coding task requires external information (e.g., "What's the latest syntax for CSS Grid?"), delegate: `<new_task><mode>ask</mode><message>Explain the current CSS Grid syntax with examples.</message></new_task>`
*   **Delegate to Debug:** If generated code has errors or unexpected behavior: `<new_task><mode>debug</mode><message>Debug this Python code: [code snippet] - it throws a TypeError.</message></new_task>`
*   **Delegate to Architect:** For high-level design questions before coding: `<new_task><mode>architect</mode><message>Should I use WebSockets or SSE for a real-time chat feature in my Node.js app? Outline pros and cons.</message></new_task>`

---

## 2. Ask Mode (ask)

**Purpose:**
Answering technical questions, providing explanations, and retrieving information across various domains (APIs, libraries, concepts, syntax, etc.).

**Efficiency Instructions:**
*   **Targeted Questions:** Ask specific, focused questions. Instead of "Tell me about React," ask "Explain the difference between `useState` and `useEffect` hooks in React."
*   **Request Conciseness:** Ask for brief explanations or bullet points. "List the main benefits of using TypeScript over JavaScript."
*   **Specify Format:** Request information in a specific format if needed. "Provide a code example for making a POST request using the `fetch` API in JavaScript."

**Escalation Guidelines:**
*   Questions requiring in-depth research or synthesis of information from multiple complex sources.
*   Highly specialized or obscure technical topics.
*   When needing comprehensive tutorials or documentation generation.

**Prompt Examples:**
*   "What is the purpose of a `.gitignore` file?"
*   "Explain RESTful API principles in bullet points."
*   "Provide a simple Python example for reading a CSV file using the `csv` module."

**Boomerang Integration:**
*   **Delegate to Code:** If an explanation requires a practical code example: `<new_task><mode>code</mode><message>Generate a Python script demonstrating the concept of list comprehensions explained previously.</message></new_task>`
*   **Delegate to Architect:** For questions about best practices or design patterns: `<new_task><mode>architect</mode><message>Based on the explanation of microservices, what are common communication patterns between them?</message></new_task>`

---

## 3. Debug Mode (debug)

**Purpose:**
Identifying and resolving errors, bugs, and unexpected behavior in code snippets or applications.

**Efficiency Instructions:**
*   **Provide Context:** Include the code snippet, the error message (full traceback if possible), the expected behavior, and the actual behavior.
*   **Isolate the Problem:** If possible, narrow down the issue to a specific function or section of code before submitting.
*   **State Environment:** Mention relevant environment details (e.g., "Running Node.js v18 on macOS," "Using Python 3.10 with Flask v2").
*   **Ask for Specific Fixes:** Request potential fixes or explanations of the error. "Explain this `NullPointerException` and suggest how to fix it in the provided Java code."

**Escalation Guidelines:**
*   Complex, intermittent bugs requiring deep system analysis.
*   Debugging issues in large, unfamiliar codebases.
*   Performance bottlenecks requiring profiling and advanced optimization techniques.

**Prompt Examples:**
*   "My JavaScript code `[snippet]` throws `Uncaught TypeError: Cannot read property 'name' of undefined`. Expected behavior: log the user's name. Actual behavior: error. How do I fix this?"
*   "Explain the following Python traceback: `[traceback]` and suggest a fix for the code `[snippet]`."
*   "This CSS rule `[rule]` isn't applying as expected. Expected: red background. Actual: no background change. Here's the relevant HTML: `[html]`."

**Boomerang Integration:**
*   **Delegate to Code:** Once the bug is identified, delegate the fix implementation: `<new_task><mode>code</mode><message>Apply the suggested fix (add null check) to this JavaScript function: [code snippet].</message></new_task>`
*   **Delegate to Ask:** If the error involves a concept needing clarification: `<new_task><mode>ask</mode><message>Explain what 'race conditions' are in the context of the threading issue we discussed.</message></new_task>`
*   **Delegate to Architect:** If the bug points to a potential design flaw: `<new_task><mode>architect</mode><message>The recurring null pointer errors suggest a potential issue with state management. What are better approaches for managing user state in this scenario?</message></new_task>`

---

## 4. Architect Mode (architect)

**Purpose:**
High-level system design, technical planning, architectural decisions, technology stack selection, and outlining software structures.

**Efficiency Instructions:**
*   **Define Goals & Constraints:** Clearly state the project goals, requirements, and constraints (e.g., budget, scalability needs, team expertise, performance targets).
*   **Ask for Comparisons:** Request comparisons between different technologies or approaches. "Compare using a monolithic vs. microservices architecture for an e-commerce platform."
*   **Request Diagrams/Outlines:** Ask for high-level diagrams (described in text/markdown) or outlines. "Outline the key components and data flow for a real-time notification system."
*   **Focus on Trade-offs:** Ask about the pros and cons of different architectural choices.

**Escalation Guidelines:**
*   Designing highly complex, large-scale, or mission-critical systems.
*   Requiring deep domain expertise (e.g., fintech, healthcare compliance).
*   Needing detailed cost analysis or infrastructure planning.

**Prompt Examples:**
*   "Outline a suitable architecture for a blog platform focusing on SEO and performance. Suggest a tech stack (frontend, backend, database)."
*   "What are the trade-offs between SQL and NoSQL databases for storing user profile data with flexible schemas?"
*   "Design the API endpoints (method, path, purpose) for a basic CRUD application managing 'tasks'."

**Boomerang Integration:**
*   **Delegate to Code:** To implement specific components of the architecture: `<new_task><mode>code</mode><message>Generate the boilerplate code for the Node.js authentication service outlined in the architecture plan.</message></new_task>`
*   **Delegate to Ask:** For clarification on specific technologies mentioned: `<new_task><mode>ask</mode><message>Explain the CAP theorem mentioned in the database comparison.</message></new_task>`
*   **Delegate to Debug:** If potential issues are foreseen in the design: `<new_task><mode>debug</mode><message>Analyze this proposed data flow for potential bottlenecks or race conditions: [diagram description].</message></new_task>` (Note: Debug might need code or more specifics).

---

## 5. Boomerang Mode (boomerang)

**Purpose:**
Orchestrating complex workflows by breaking down large tasks and delegating sub-tasks to specialized modes (Code, Ask, Debug, Architect). Acts as a project manager.

**Efficiency Instructions:**
*   **Define the Overall Goal:** Clearly state the end-to-end task. "Build a simple web app that displays the current weather for a given city using an external API."
*   **Break Down the Task:** Outline the high-level steps involved. "1. Design API endpoints. 2. Choose weather API. 3. Implement backend logic. 4. Create frontend UI. 5. Connect frontend and backend."
*   **Initiate the First Step:** Start by delegating the first logical sub-task. `<new_task><mode>architect</mode><message>Design the API endpoint(s) needed for a web app that takes a city name and returns current weather data.</message></new_task>`
*   **Sequential Delegation:** Use the output of one task as input for the next, delegating step-by-step. After Architect designs the API, `<new_task><mode>ask</mode><message>Recommend a free weather API that provides current weather data by city name.</message></new_task>`, then `<new_task><mode>code</mode><message>Write a Python Flask function for the designed endpoint '/weather?city=<city>' using the recommended API '[API Name]'.</message></new_task>`, and so on.

**Escalation Guidelines:**
*   Boomerang itself rarely needs escalation, as it delegates. Escalation happens within the *delegated* tasks based on the guidelines of the target mode (Code, Ask, etc.).

**Prompt Examples:**
*   (Initial Task) "Orchestrate the creation of a command-line tool that converts Markdown files to HTML. Steps: 1. Choose Markdown library. 2. Write core conversion logic. 3. Handle file I/O. 4. Parse command-line arguments."
*   (Follow-up after Ask identifies library) `<new_task><mode>code</mode><message>Write a Python function `convert_markdown(markdown_string)` using the 'markdown' library identified previously.</message></new_task>`
*   (Follow-up after Code provides function) `<new_task><mode>code</mode><message>Write Python code to read a file specified by a command-line argument, pass its content to the `convert_markdown` function, and write the HTML output to a new file named '[input_filename].html'. Use the 'argparse' module.</message></new_task>`

**Boomerang Integration:**
*   Boomerang *is* the integration mechanism. It delegates tasks to Code, Ask, Debug, and Architect based on the sub-task requirements. It receives results and initiates subsequent tasks.