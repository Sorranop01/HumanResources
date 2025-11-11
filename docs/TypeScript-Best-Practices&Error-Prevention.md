🎯 TypeScript Best Practices & Error Prevention
1. Type Imports & Exports
typescript// ✅ CORRECT - Use type imports for types
import type { FC, PropsWithChildren } from 'react';
import type { Product, Order } from '@ecolife/types';
import { useState, useEffect } from 'react';

// ❌ WRONG - Mixing type and value imports
import { FC, useState } from 'react'; // FC is a type!
2. Strict Mode Configurations
typescript// tsconfig.json ที่ apps/admin-panel/
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true,
    "types": ["vite/client", "@types/node"],
    "paths": {
      "@/*": ["./src/*"],
      "@ecolife/types": ["../../packages/types/src"],
      "@ecolife/ui-core": ["../../packages/ui-core/src"],
      "@ecolife/utils": ["../../packages/utils/src"]
    }
  }
}
3. Common TypeScript Patterns
typescript// ✅ Handle undefined/null safely
interface UserData {
  name?: string;
  items?: string[];
}

const processUser = (user: UserData) => {
  // Use optional chaining
  const itemCount = user.items?.length ?? 0;
  
  // Type narrowing
  if (user.name) {
    console.log(user.name.toUpperCase()); // Safe!
  }
  
  // Array safety with noUncheckedIndexedAccess
  const firstItem = user.items?.[0];
  if (firstItem) {
    // firstItem is string here, not string | undefined
  }
};
4. Zod Schema Integration
typescript// packages/types/src/product.ts
import { z } from 'zod';

// Define schema first
export const ProductSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  price: z.number().positive().multipleOf(0.01),
  category: z.enum(['food', 'beverage', 'dessert']),
  isActive: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Infer type from schema
export type Product = z.infer<typeof ProductSchema>;

// Create type-safe function
export const validateProduct = (data: unknown): Product => {
  return ProductSchema.parse(data); // Throws if invalid
};

// Safe parse without throwing
export const safeValidateProduct = (data: unknown) => {
  const result = ProductSchema.safeParse(data);
  if (result.success) {
    return { data: result.data, error: null };
  }
  return { data: null, error: result.error };
};
⚙️ Vite Configuration
Complete vite.config.ts
typescript// apps/admin-panel/vite.config.ts
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [
      react({
        babel: {
          plugins: [
            ['@babel/plugin-proposal-decorators', { legacy: true }],
          ],
        },
      }),
      // Bundle analyzer (optional)
      mode === 'analyze' && visualizer({
        open: true,
        filename: 'dist/stats.html',
      }),
    ].filter(Boolean),
    
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@ecolife/types': path.resolve(__dirname, '../../packages/types/src'),
        '@ecolife/ui-core': path.resolve(__dirname, '../../packages/ui-core/src'),
        '@ecolife/utils': path.resolve(__dirname, '../../packages/utils/src'),
      },
    },
    
    server: {
      port: 3000,
      host: true, // Enable network access
      strictPort: true,
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:5001',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
    
    build: {
      outDir: 'dist',
      sourcemap: mode !== 'production',
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'ui-vendor': ['antd', '@mui/material'],
            'firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
            'query': ['@tanstack/react-query'],
          },
        },
      },
      chunkSizeWarningLimit: 1000,
    },
    
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'antd',
        '@mui/material',
        'firebase/app',
        '@tanstack/react-query',
      ],
      exclude: ['@ecolife/types', '@ecolife/ui-core', '@ecolife/utils'],
    },
    
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode),
    },
  };
});
🔥 Firebase Functions Setup
1. Functions Configuration (CommonJS)
javascript// functions/src/index.js
const { onRequest } = require('firebase-functions/v2/https');
const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { setGlobalOptions } = require('firebase-functions/v2');

// Set global options for ALL functions
setGlobalOptions({
  region: 'asia-southeast1',
  timeoutSeconds: 60,
  memory: '256MiB',
});

// HTTP Function
exports.api = onRequest(
  {
    cors: ['https://admin.ecolife.com'],
    maxInstances: 10,
  },
  async (req, res) => {
    try {
      // Your logic here
      res.json({ success: true });
    } catch (error) {
      console.error('API Error:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

// Firestore Trigger
exports.onOrderCreated = onDocumentCreated(
  'orders/{orderId}',
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) {
      console.log('No data associated with the event');
      return;
    }
    
    const data = snapshot.data();
    // Process order...
  }
);
2. Environment Variables (.env files)
bash# apps/admin-panel/.env.development
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=admin-system-bc043.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=admin-system-bc043
VITE_FIREBASE_STORAGE_BUCKET=admin-system-bc043.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
VITE_ALGOLIA_APP_ID=YOUR_APP_ID
VITE_ALGOLIA_SEARCH_KEY=YOUR_SEARCH_KEY
🎨 Component Patterns
1. Feature-Sliced Design Structure
typescript// apps/admin-panel/src/domains/product/
├── api/
│   └── productApi.ts         // API calls & React Query hooks
├── components/
│   ├── ProductList.tsx       // UI Components
│   └── ProductForm.tsx
├── stores/
│   └── productStore.ts       // Zustand store
├── types/
│   └── index.ts             // Local types
└── index.ts                  // Public exports
2. React Query Pattern
typescript// apps/admin-panel/src/domains/product/api/productApi.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, doc, getDoc, setDoc, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Product } from '@ecolife/types';
import { ProductSchema } from '@ecolife/types';

// Query Keys factory
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters: string) => [...productKeys.lists(), { filters }] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
};

// Fetch hook with type safety
export const useProduct = (id: string) => {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: async () => {
      const docRef = doc(db, 'products', id);
      const snapshot = await getDoc(docRef);
      
      if (!snapshot.exists()) {
        throw new Error('Product not found');
      }
      
      const data = snapshot.data();
      return ProductSchema.parse({ ...data, id: snapshot.id });
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
};

// Mutation with optimistic update
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (product: Product) => {
      const validated = ProductSchema.parse(product);
      const { id, ...data } = validated;
      
      await setDoc(doc(db, 'products', id), {
        ...data,
        updatedAt: new Date(),
      });
      
      return validated;
    },
    onMutate: async (newProduct) => {
      // Optimistic update
      await queryClient.cancelQueries({
        queryKey: productKeys.detail(newProduct.id),
      });
      
      const previousProduct = queryClient.getQueryData(
        productKeys.detail(newProduct.id)
      );
      
      queryClient.setQueryData(
        productKeys.detail(newProduct.id),
        newProduct
      );
      
      return { previousProduct };
    },
    onError: (err, newProduct, context) => {
      // Rollback on error
      if (context?.previousProduct) {
        queryClient.setQueryData(
          productKeys.detail(newProduct.id),
          context.previousProduct
        );
      }
    },
    onSettled: (data) => {
      // Invalidate and refetch
      if (data) {
        queryClient.invalidateQueries({
          queryKey: productKeys.detail(data.id),
        });
      }
    },
  });
};
🧪 Testing Configuration
Vitest Setup
typescript// apps/admin-panel/vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: ['node_modules/', 'src/test/'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@ecolife/types': path.resolve(__dirname, '../../packages/types/src'),
      '@ecolife/ui-core': path.resolve(__dirname, '../../packages/ui-core/src'),
      '@ecolife/utils': path.resolve(__dirname, '../../packages/utils/src'),
    },
  },
});
Test Example
typescript// apps/admin-panel/src/domains/product/components/ProductList.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProductList } from './ProductList';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('ProductList', () => {
  it('should render loading state', () => {
    render(<ProductList />, { wrapper: createWrapper() });
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });
  
  it('should render products', async () => {
    // Mock Firebase
    vi.mock('@/lib/firebase', () => ({
      db: {},
    }));
    
    render(<ProductList />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      expect(screen.getByText('Product 1')).toBeInTheDocument();
    });
  });
});
🛠️ Biome Configuration
json// biome.json
{
  "$schema": "https://biomejs.dev/schemas/1.9.4/schema.json",
  "organizeImports": {
    "enabled": true
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "complexity": {
        "noForEach": "off",
        "useOptionalChain": "error"
      },
      "style": {
        "noNonNullAssertion": "warn",
        "useImportType": "error",
        "useNodejsImportProtocol": "error"
      },
      "suspicious": {
        "noExplicitAny": "error",
        "noConsoleLog": "warn"
      }
    }
  },
  "formatter": {
    "enabled": true,
    "formatWithErrors": false,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100,
    "lineEnding": "lf"
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single",
      "jsxQuoteStyle": "double",
      "semicolons": "always",
      "trailingCommas": "all",
      "arrowParentheses": "always"
    }
  }
}
📦 Package.json Scripts
json// Root package.json
{
  "scripts": {
    "dev": "pnpm --filter admin-panel dev",
    "build": "pnpm -r build",
    "lint": "biome check --write .",
    "format": "biome format --write .",
    "test": "pnpm -r test",
    "test:coverage": "pnpm -r test:coverage",
    "clean": "pnpm -r clean && rm -rf node_modules",
    "deploy:functions": "pnpm --filter functions deploy",
    "type-check": "pnpm -r type-check"
  }
}

// apps/admin-panel/package.json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:coverage": "vitest run --coverage",
    "type-check": "tsc --noEmit",
    "clean": "rm -rf dist node_modules .turbo"
  }
}
🚨 Common Issues & Solutions
1. TypeScript Path Resolution
typescript// ปัญหา: Cannot find module '@ecolife/types'
// วิธีแก้: ตรวจสอบ tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "paths": {
      "@ecolife/types": ["../../packages/types/src"],
      // ... other paths
    }
  }
}
2. Vite HMR Issues
typescript// vite.config.ts
export default defineConfig({
  server: {
    hmr: {
      overlay: true,
      protocol: 'ws',
      host: 'localhost',
    },
    watch: {
      // Fix for WSL2
      usePolling: process.env.WSL_DISTRO_NAME ? true : false,
    },
  },
});
3. Firebase Region Mismatch
javascript// ❌ WRONG - Will deploy to us-central1
exports.myFunction = onRequest(async (req, res) => {});

// ✅ CORRECT - Will deploy to asia-southeast1
exports.myFunction = onRequest(
  { region: 'asia-southeast1' },
  async (req, res) => {}
);
4. Monorepo Dependencies
bash# ปัญหา: Package ไม่ update
pnpm clean && pnpm install

# Force rebuild
pnpm -r build --force

# Check workspace dependencies
pnpm why @ecolife/types
🎯 Performance Optimization
1. React Query Optimization
typescript// Parallel queries
const results = useQueries({
  queries: [
    { queryKey: ['products'], queryFn: fetchProducts },
    { queryKey: ['categories'], queryFn: fetchCategories },
    { queryKey: ['users'], queryFn: fetchUsers },
  ],
});

// Prefetch on hover
const queryClient = useQueryClient();

const handleHover = (productId: string) => {
  queryClient.prefetchQuery({
    queryKey: productKeys.detail(productId),
    queryFn: () => fetchProduct(productId),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};
2. Bundle Size Optimization
typescript// Lazy load heavy components
const ChartComponent = lazy(() => 
  import('./components/ChartComponent')
);

// Tree-shakeable imports
import { Button } from 'antd'; // ❌ Imports entire antd
import Button from 'antd/es/button'; // ✅ Imports only Button

// Dynamic imports for routes
const routes = [
  {
    path: '/products',
    component: lazy(() => import('./domains/product')),
  },
];