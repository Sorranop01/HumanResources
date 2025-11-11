Purpose: Define how AI should configure, build, and optimize a React + TypeScript project using Vite for production.

🇬🇧 Section 1: AI Coding Rules (for AI to follow)
1. General Build Commands

Always use the following official commands:

pnpm build     # Build for production
pnpm preview   # Preview the production build locally


Do not modify the build pipeline unless instructed.

The output directory must be dist/ (default Vite behavior).

2. File Naming and Structure

Configuration file must be named vite.config.ts (TypeScript version only).

Always use ESM syntax (import/export), never require().

Example base structure:

vite.config.ts
├── plugins/
├── env/
└── src/

3. Basic Vite Config Template
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});


AI must always:

Use defineConfig() wrapper.

Import from path and use path.resolve() for aliases.

Set @ alias → ./src.

4. Environment Files

Support .env, .env.development, .env.production

AI must access env values via import.meta.env.VITE_...

const apiUrl = import.meta.env.VITE_API_URL;


Prefix all custom env vars with VITE_, otherwise Vite will not expose them.

5. Plugins

Use official plugins only (e.g. @vitejs/plugin-react, vite-tsconfig-paths).

Always configure React with JSX runtime enabled:

import react from '@vitejs/plugin-react';
plugins: [react({ jsxRuntime: 'automatic' })];


Never use unverified community plugins without explicit approval.

6. Build Optimization

Use build.sourcemap: false in production unless debugging.

Use optimizeDeps.include for large dependencies if startup time is slow.

Split vendor chunks automatically:

build: {
  rollupOptions: {
    output: {
      manualChunks: {
        vendor: ['react', 'react-dom', 'antd'],
      },
    },
  },
},

7. Static Assets

Assets (images, fonts, etc.) must live under public/.

Use relative imports for assets under src/assets/.

<img src="/logo.svg" alt="logo" />


Vite automatically handles asset hashing and bundling.

8. Preview Mode

To simulate production build:

pnpm preview


Output:

Local: http://localhost:4173/


Use this command to test routing, API calls, and static files before deployment.

9. Common Mistakes AI Must Avoid

❌ Writing require() in vite.config.ts
❌ Using process.env instead of import.meta.env
❌ Forgetting to use .tsx for files with JSX
❌ Importing paths without using aliases (../../../../)
✅ Always use @/ alias