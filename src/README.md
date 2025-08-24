# React Project Structure

## 📁 Folder Structure

```
src/
├── components/          # Reusable UI components
│   ├── admin/          # Admin-specific components
│   ├── analytics/      # Analytics and chart components
│   ├── employee/       # Employee-specific components
│   └── ui/             # Generic UI components
├── pages/              # Page-level components
│   ├── admin/          # Admin pages
│   └── ...             # Other page components
├── hooks/              # Custom React hooks
├── context/            # React context providers
├── lib/                # Third-party library configurations
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── services/           # API calls and external services
├── styles/             # Global styles and CSS modules
├── assets/             # Static assets (images, icons, etc.)
├── constants/          # Application constants
├── config/             # Configuration files
└── scripts/            # Build and utility scripts
```

## 🎯 Best Practices

### File Naming

- **PascalCase** for components: `UserProfile.tsx`
- **camelCase** for utilities: `formatDate.ts`
- **UPPER_SNAKE_CASE** for constants: `API_ENDPOINTS.ts`

### Component Structure

```typescript
// 1. Imports
import React from "react";

// 2. Interface definition
interface Props {
  title: string;
  onAction?: () => void;
}

// 3. Component definition
const Component: React.FC<Props> = ({ title, onAction }) => {
  return (
    <div>
      <h1>{title}</h1>
      <button onClick={onAction}>Action</button>
    </div>
  );
};

// 4. Export
export default Component;
```

### State Management

- Use **React Context** for global state
- Use **local state** for component-specific state
- Use **custom hooks** for reusable state logic

### API Layer

- Centralize API calls in `services/`
- Use consistent error handling
- Implement proper loading states

### Styling

- Use **Tailwind CSS** for utility classes
- Define design tokens in `styles/globals.css`
- Use CSS custom properties for theming
