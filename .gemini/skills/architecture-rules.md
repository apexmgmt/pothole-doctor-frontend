# Architecture and Coding Standards

When writing code for this project, you MUST adhere to the following rules:

1. **SOLID Principles**: Always follow SOLID principles. Ensure that components and functions are modular, maintainable, and have a single responsibility.
2. **Reusable Components**: Any reusable UI component (such as a Button, Table, Input, etc.) that can be used globally MUST be created inside the `@/components/` directory.
3. **Pages and Views Separation**: 
   - Route files (pages) must **ONLY** contain server-side code (e.g., data fetching, server actions, or metadata).
   - The client-side code and the actual UI layout for a route MUST be created in the `@/views/<route-name>/index.tsx` directory.
   - The server-side page should import and render the client-side view from `@/views/`.
