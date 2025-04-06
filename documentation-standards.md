# DIY Recipes Documentation Standards

## Purpose
Establish clear, consistent documentation practices to improve maintainability, onboarding, and collaboration.

---

## 1. Code Documentation with JSDoc

### General Guidelines
- Every function (public or private) **must** have a JSDoc comment.
- Include description, parameters, return values, and thrown errors.
- Use clear, concise language.
- Document complex algorithms with additional explanation and inline comments if necessary.

### JSDoc Template
```js
/**
 * [Short description of what the function does]
 *
 * @param {Type} paramName - Description of the parameter.
 * @param {Type} [optionalParam] - Description (mention optional/default).
 * @returns {Type} Description of the return value.
 * @throws {ErrorType} Description of error conditions (if applicable).
 */
function example(param1, optionalParam) { ... }
```

### Specifics
- **Parameters:** List all, including optional and default values.
- **Return:** Always specify, even if `void`.
- **Async Functions:** Note if function returns a `Promise<Type>`.
- **Callbacks:** Document callback signatures.
- **Complex Logic:** Include a high-level summary before the function, and inline comments within.

---

## 2. Architectural Documentation

### Content
- Overview of system design
- Key modules/components and their interactions
- Data flow diagrams (e.g., sequence diagrams, flowcharts)
- Technology stack and rationale
- Authentication & authorization flow
- Error handling strategies
- Deployment architecture (servers, third-party services)

### Format
- Use Markdown with embedded diagrams (Mermaid preferred).
- Place in `architecture.md` and linked documents.
- Keep diagrams simple but informative.

---

## 3. API Documentation

### Content
- Endpoint URL and HTTP method
- Purpose/description
- Request parameters (query, path, body)
- Response schema with examples
- Error codes and messages
- Authentication requirements

### Format
- Use Markdown tables or code blocks.
- Group endpoints by resource.
- Include example cURL requests where helpful.
- Place in dedicated API documentation file or within relevant modules.

---

## 4. README and Contribution Guidelines

### README.md Must Include:
- Project overview and purpose
- Setup instructions (dependencies, environment variables, running locally)
- Deployment instructions
- Key features
- Folder structure overview
- How to run tests
- Links to architectural/API docs
- License information

### Contribution Guidelines
- Coding standards (naming, formatting)
- Branching strategy
- Commit message conventions
- Code review process
- How to add/update documentation
- Located in `CONTRIBUTING.md` (linked from README)

---

## 5. Style and Formatting

- Use consistent Markdown syntax.
- Prefer sentence case for descriptions.
- Keep line lengths reasonable (~100 chars).
- Use code blocks for examples.
- Use Mermaid for diagrams when possible.
- Keep tone professional and concise.

---

## 6. Tools and Automation

- Use linters (`eslint`, `prettier`) to enforce style.
- Consider automated JSDoc coverage tools.
- Use Markdown linting to ensure consistency.

---

## Summary

Following these standards will ensure documentation is:
- Consistent across the codebase
- Helpful for onboarding and maintenance
- Easy to update alongside code changes
- Professional and accessible to all contributors