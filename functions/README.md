# Cloud Functions - HumanResources

Firebase Cloud Functions v2 for the HumanResources system.

## 📋 Requirements

- Node.js >= 20
- Firebase CLI
- TypeScript 5.x

## 🚀 Development

### Install Dependencies
```bash
npm install
```

### Build
```bash
npm run build
```

### Watch Mode
```bash
npm run build:watch
```

### Local Testing (Emulators)
```bash
npm run serve
```

### Deploy
```bash
npm run deploy
```

## 📁 Structure

```
functions/
├─ src/
│  ├─ config/           # Firebase Admin, constants
│  ├─ middleware/       # Auth, RBAC middleware
│  ├─ utils/            # Logger, error handlers
│  └─ api/              # Business logic functions
│     ├─ employees/
│     ├─ payroll/
│     └─ attendance/
├─ package.json
├─ tsconfig.json
└─ README.md
```

## 🔐 Authentication

All callable functions require Firebase Auth token.

## 🌍 Region

**MANDATORY**: All functions must use region `asia-southeast1`

```typescript
export const myFunction = onCall(
  { region: 'asia-southeast1' },
  async (request) => { /* ... */ }
);
```

## 📝 Logging

Use structured logging utilities:

```typescript
import { logInfo, logError } from '../utils/logger';

logInfo('Operation started', { userId });
logError('Operation failed', error, { userId });
```

## ⚠️ Error Handling

Use HttpsError for proper error responses:

```typescript
import { HttpsError } from 'firebase-functions/v2/https';

throw new HttpsError('invalid-argument', 'ข้อมูลไม่ถูกต้อง');
```

## 🔒 RBAC

Check user roles before performing operations:

```typescript
import { requireRole } from '../middleware/auth';

await requireRole(uid, ['admin', 'hr']);
```
