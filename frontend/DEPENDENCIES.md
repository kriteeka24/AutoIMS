# AutoIMS Frontend - Dependencies

> **Note**: Frontend dependencies are managed via `package.json`.  
> Install with: `npm install`

---

## Production Dependencies

| Package             | Version  | Description                                     |
| ------------------- | -------- | ----------------------------------------------- |
| `react`             | ^19.2.0  | Core React library for building user interfaces |
| `react-dom`         | ^19.2.0  | React DOM rendering library                     |
| `react-router-dom`  | ^7.12.0  | Declarative routing for React applications      |
| `tailwindcss`       | ^4.1.18  | Utility-first CSS framework                     |
| `@tailwindcss/vite` | ^4.1.18  | Tailwind CSS plugin for Vite                    |
| `lucide-react`      | ^0.563.0 | Beautiful & consistent icon library for React   |

---

## Development Dependencies

| Package                       | Version | Description                          |
| ----------------------------- | ------- | ------------------------------------ |
| `vite`                        | ^7.2.4  | Next-generation frontend build tool  |
| `@vitejs/plugin-react`        | ^5.1.1  | Vite plugin for React support        |
| `eslint`                      | ^9.39.1 | JavaScript linting utility           |
| `@eslint/js`                  | ^9.39.1 | ESLint JavaScript configuration      |
| `eslint-plugin-react-hooks`   | ^7.0.1  | ESLint rules for React Hooks         |
| `eslint-plugin-react-refresh` | ^0.4.24 | ESLint plugin for React Refresh      |
| `globals`                     | ^16.5.0 | Global identifiers for ESLint        |
| `@types/react`                | ^19.2.5 | TypeScript definitions for React     |
| `@types/react-dom`            | ^19.2.3 | TypeScript definitions for React DOM |

---

## Quick Start

```bash
# Install all dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint
```

---

## Version Requirements

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
