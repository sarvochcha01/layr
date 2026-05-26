# Backend Export Guide

## Overview

When you export a project from Layr with backend API endpoints, the exported Next.js project includes a fully functional backend API system powered by Firebase and a custom pipeline executor.

## What Gets Exported

### 1. **API Routes** (`app/api/backend/[...path]/route.ts`)
- A catch-all route that handles all your API endpoints
- Supports GET, POST, PUT, PATCH, DELETE methods
- Routes requests to the correct endpoint based on path and method
- Executes pipeline logic or returns mock data

### 2. **Backend Infrastructure** (`lib/`)
- `pipeline-executor.ts` - Executes your visual pipeline logic
- `pipeline-delegates.ts` - Firebase/Firestore integration layer
- `firebase.ts` - Firebase configuration (if Firebase is enabled)

### 3. **Type Definitions** (`types/`)
- `backend.ts` - Complete TypeScript types for all backend features

### 4. **Context Providers** (`contexts/`)
- `BackendContext.tsx` - Provides project ID to components
- `ThemeStyleContext.tsx` - Theme management

## How Components Connect to APIs

### Button Component Example

```tsx
<Button
  text="Login"
  backendAction={{
    id: "login-action",
    endpointId: "login-endpoint-id",
    endpointPath: "/auth/login",
    endpointMethod: "POST",
    trigger: "click",
    payloadSource: "static",
    staticPayload: { email: "user@example.com", password: "pass123" },
    onSuccess: "redirect",
    redirectUrl: "/dashboard",
    successMessage: "Login successful!"
  }}
/>
```

### Form Component Example

```tsx
<Form
  fields={[
    { id: "email", type: "email", label: "Email", required: true },
    { id: "password", type: "password", label: "Password", required: true }
  ]}
  backendAction={{
    id: "signup-action",
    endpointId: "signup-endpoint-id",
    endpointPath: "/auth/signup",
    endpointMethod: "POST",
    trigger: "submit",
    payloadSource: "form",
    payloadMapping: { email: "email", password: "password" },
    onSuccess: "toast",
    successMessage: "Account created!"
  }}
/>
```

## API Request Flow

1. **User Action** → Button click or form submit
2. **Component** → Builds request payload
3. **Fetch Call** → `POST /api/backend/auth/login`
4. **Catch-All Route** → Matches endpoint by path + method
5. **Pipeline Execution** → Runs validation, DB queries, auth, etc.
6. **Response** → Returns JSON data
7. **Success Handler** → Toast, redirect, or reset form

## Setting Up Firebase (Required for Backend)

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Firestore Database
4. Enable Authentication (Email/Password)

### 2. Get Firebase Config
1. Project Settings → General
2. Scroll to "Your apps" → Web app
3. Copy the config values

### 3. Update `.env.local`
The exported project includes a `.env.local` file with placeholders:

```env
FIREBASE_API_KEY=your-api-key
FIREBASE_AUTH_DOMAIN=your-auth-domain
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-storage-bucket
FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
FIREBASE_APP_ID=your-app-id
```

Replace these with your actual Firebase config values.

## Database Collections

If your endpoints use Firestore, you need to create collections:

### Example: Users Collection
```javascript
// Firestore structure
users/
  └── {userId}/
      ├── email: string
      ├── password: string (hashed)
      ├── name: string
      ├── _createdAt: timestamp
```

### Creating Collections
Collections are created automatically when you insert the first document. Your pipeline steps handle this.

## Pipeline Logic

Your visual pipeline from Layr is exported as JSON and executed server-side:

### Example Login Pipeline
```json
[
  {
    "type": "validate",
    "validateConfig": {
      "rules": [
        { "field": "body.email", "rule": "required" },
        { "field": "body.password", "rule": "required" }
      ]
    }
  },
  {
    "type": "firebase-login",
    "firebaseLoginConfig": {
      "resultVariable": "user"
    }
  },
  {
    "type": "respond",
    "respondConfig": {
      "status": 200,
      "bodyMode": "mapping",
      "bodyMapping": {
        "uid": "variables.user.uid",
        "email": "variables.user.email",
        "token": "variables.user.token"
      }
    }
  }
]
```

## Testing Your Backend

### 1. Start Development Server
```bash
npm run dev
```

### 2. Test Endpoints Manually
```bash
# Test login endpoint
curl -X POST http://localhost:3000/api/backend/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### 3. Check Browser Console
Open DevTools → Network tab to see API requests and responses

## Common Issues

### Issue: "Endpoint not found"
**Cause:** Path mismatch between component and endpoint definition
**Fix:** Ensure `endpointPath` in component matches `path` in endpoint config

### Issue: "Firebase not initialized"
**Cause:** Missing or incorrect Firebase config in `.env.local`
**Fix:** Double-check all Firebase environment variables

### Issue: "Collection not found"
**Cause:** Firestore collection doesn't exist
**Fix:** Collections are auto-created on first insert. Check Firestore rules.

### Issue: "Validation failed"
**Cause:** Request payload doesn't match validation rules
**Fix:** Check pipeline validation rules and request body structure

## Mock Mode vs Pipeline Mode

### Mock Mode (usePipeline: false)
- Returns `mockResponse` directly
- No database queries
- Fast for prototyping
- No Firebase required

### Pipeline Mode (usePipeline: true)
- Executes full pipeline logic
- Real database operations
- Firebase required
- Production-ready

## Security Considerations

### 1. Environment Variables
Never commit `.env.local` to version control. Add to `.gitignore`:
```
.env*.local
```

### 2. Firestore Security Rules
Set up proper security rules in Firebase Console:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 3. API Rate Limiting
Consider adding rate limiting for production:
```typescript
// Add to route.ts
import rateLimit from 'express-rate-limit';
```

## Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Import to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Environment Variables in Vercel
Add all Firebase config variables in:
Settings → Environment Variables

## Support

If your backend isn't working:
1. Check browser console for errors
2. Check server logs (`npm run dev` output)
3. Verify Firebase config
4. Test endpoints with curl/Postman
5. Check Firestore security rules

## Next Steps

1. ✅ Export your project
2. ✅ Install dependencies: `npm install`
3. ✅ Configure Firebase in `.env.local`
4. ✅ Start dev server: `npm run dev`
5. ✅ Test your endpoints
6. ✅ Deploy to Vercel

Your backend is now fully functional! 🚀
