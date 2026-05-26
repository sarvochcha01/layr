# Backend API Export - Complete Fix

## What Was Fixed

### 1. **Project ID Issue** ✅
**Problem:** Exported projects had `projectId={null}`, causing components to skip API calls.

**Solution:** Changed to `projectId="standalone"` in exported layout.

```typescript
// Before (broken):
<BackendProvider projectId={null}>

// After (working):
<BackendProvider projectId="standalone">
```

### 2. **API Route Implementation** ✅
**Problem:** No API route handlers in exported project.

**Solution:** Created catch-all route at `app/api/backend/[...path]/route.ts` that:
- Handles all HTTP methods (GET, POST, PUT, PATCH, DELETE)
- Matches requests to configured endpoints
- Executes pipeline logic or returns mock data
- Includes detailed logging for debugging

### 3. **Endpoint Configuration** ✅
**Problem:** Endpoints weren't being embedded in the exported project.

**Solution:** All enabled endpoints are now embedded as JSON in the catch-all route:
```typescript
const ENDPOINTS = [
  {
    id: "...",
    name: "Login",
    path: "/auth/login",
    method: "POST",
    pipeline: [...],
    usePipeline: true
  },
  // ... all your endpoints
];
```

### 4. **Testing & Debugging** ✅
**Problem:** No way to verify if backend is working.

**Solution:** Added API test page at `/api-test` that:
- Lists all endpoints
- Allows one-click testing
- Shows request/response details
- Provides troubleshooting tips

### 5. **Documentation** ✅
**Problem:** Users didn't know how to set up Firebase or test APIs.

**Solution:** Enhanced README with:
- Firebase setup instructions
- API testing guide
- Troubleshooting section
- Mock vs Pipeline mode explanation

## How It Works Now

### Component → API Flow

```
1. User clicks Button with backendAction
   ↓
2. Button checks: backendAction && projectId
   ✅ projectId = "standalone" (always true)
   ↓
3. Button calls: fetch('/api/backend/auth/login', {...})
   ↓
4. Catch-all route receives request
   ↓
5. Route finds matching endpoint by path + method
   ↓
6. If usePipeline=false: Return mockResponse
   If usePipeline=true: Execute pipeline
   ↓
7. Return JSON response
   ↓
8. Button handles success/error
```

### Example: Login Button

```tsx
<Button
  text="Login"
  backendAction={{
    endpointId: "login-123",
    endpointPath: "/auth/login",
    endpointMethod: "POST",
    trigger: "click",
    payloadSource: "static",
    staticPayload: {
      email: "user@example.com",
      password: "password123"
    },
    onSuccess: "redirect",
    redirectUrl: "/dashboard",
    successMessage: "Welcome back!"
  }}
/>
```

**What happens:**
1. User clicks button
2. Fetch POST `/api/backend/auth/login` with payload
3. Catch-all route finds "Login" endpoint
4. Executes pipeline: Validate → Firebase Login → Respond
5. Returns `{ uid, email, token }`
6. Button redirects to `/dashboard`

## Testing Your Export

### Step 1: Export Project
Export from Layr with backend endpoints configured.

### Step 2: Install Dependencies
```bash
cd your-exported-project
npm install
```

### Step 3: Configure Firebase (if using pipeline mode)
Edit `.env.local`:
```env
FIREBASE_API_KEY=your-key
FIREBASE_AUTH_DOMAIN=your-domain
FIREBASE_PROJECT_ID=your-project
FIREBASE_STORAGE_BUCKET=your-bucket
FIREBASE_MESSAGING_SENDER_ID=your-sender-id
FIREBASE_APP_ID=your-app-id
```

### Step 4: Start Dev Server
```bash
npm run dev
```

### Step 5: Test Endpoints
Visit: http://localhost:3000/api-test

Click "Test Endpoint" for each API to verify it works.

### Step 6: Test in Your App
Navigate to your pages and test buttons/forms with backend actions.

## Debugging

### Check Browser Console
```javascript
// You should see:
[API] POST /auth/login
[API] Found endpoint: Login
[API] Request body: { email: "...", password: "..." }
[API] Executing pipeline with 3 steps
[API] Pipeline result: { status: 200, body: {...} }
```

### Check Server Terminal
```bash
# You should see:
[API] POST /auth/login
[API] Found endpoint: Login
[API] Executing pipeline with 3 steps
[API] Pipeline result: { status: 200, body: {...} }
```

### Common Issues

#### "Endpoint not found"
**Cause:** Path mismatch
**Check:**
- Component: `endpointPath="/auth/login"`
- Endpoint config: `path="/auth/login"`
- Must match exactly (including leading slash)

#### "Firebase not initialized"
**Cause:** Missing or wrong Firebase config
**Fix:**
1. Check `.env.local` exists
2. Verify all 6 Firebase variables are set
3. Restart dev server after changing `.env.local`

#### "Network error" or no request
**Cause:** Component not making API call
**Check:**
1. `backendAction` prop is set on component
2. `projectId` is available (should be "standalone")
3. Browser console for errors

#### "Internal server error"
**Cause:** Pipeline execution failed
**Check:**
1. Server terminal for detailed error
2. Firebase is configured correctly
3. Firestore collections exist
4. Pipeline steps are valid

## Mock Mode vs Pipeline Mode

### Mock Mode (Quick Testing)
```json
{
  "usePipeline": false,
  "mockResponse": {
    "success": true,
    "message": "Login successful"
  }
}
```
- ✅ No Firebase needed
- ✅ Instant response
- ✅ Great for prototyping
- ❌ No real data
- ❌ No validation

### Pipeline Mode (Production)
```json
{
  "usePipeline": true,
  "pipeline": [
    { "type": "validate", ... },
    { "type": "firebase-login", ... },
    { "type": "respond", ... }
  ]
}
```
- ✅ Real database operations
- ✅ Full validation
- ✅ Authentication
- ✅ Production-ready
- ❌ Requires Firebase setup

## What's Included in Export

### Files Added:
```
app/
  api/
    backend/
      [...path]/
        route.ts          ← Catch-all API handler
  api-test/
    page.tsx              ← API testing page
  
lib/
  pipeline-executor.ts    ← Pipeline logic
  pipeline-delegates.ts   ← Firebase integration
  firebase.ts             ← Firebase config
  themeStyles.ts          ← Theme system
  fonts.ts                ← Font loading
  
contexts/
  BackendContext.tsx      ← Backend provider
  ThemeStyleContext.tsx   ← Theme provider
  
types/
  backend.ts              ← Type definitions

.env.local                ← Firebase config (template)
README.md                 ← Setup instructions
```

## Deployment

### Vercel (Recommended)

1. **Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin your-repo-url
git push -u origin main
```

2. **Import to Vercel**
- Go to vercel.com
- Click "Import Project"
- Select your repository

3. **Add Environment Variables**
In Vercel dashboard → Settings → Environment Variables:
```
FIREBASE_API_KEY=...
FIREBASE_AUTH_DOMAIN=...
FIREBASE_PROJECT_ID=...
FIREBASE_STORAGE_BUCKET=...
FIREBASE_MESSAGING_SENDER_ID=...
FIREBASE_APP_ID=...
```

4. **Deploy**
Vercel will automatically deploy your project.

### Other Platforms

The exported project is a standard Next.js app and can be deployed to:
- Netlify
- AWS Amplify
- Railway
- Render
- Self-hosted

Just make sure to set environment variables on your platform.

## Security Considerations

### 1. Environment Variables
Never commit `.env.local` to git:
```bash
# Already in .gitignore
.env*.local
```

### 2. Firestore Security Rules
Set up proper rules in Firebase Console:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Only authenticated users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null 
                         && request.auth.uid == userId;
    }
    
    // Public read, authenticated write
    match /posts/{postId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### 3. API Rate Limiting
For production, consider adding rate limiting to prevent abuse.

## Success Checklist

- ✅ Project exported from Layr
- ✅ Dependencies installed (`npm install`)
- ✅ Firebase configured in `.env.local` (if using pipeline mode)
- ✅ Dev server running (`npm run dev`)
- ✅ API test page shows all endpoints (`/api-test`)
- ✅ Test endpoints return expected responses
- ✅ Components with backend actions work correctly
- ✅ Browser console shows API logs
- ✅ Server terminal shows API logs
- ✅ Ready to deploy!

## Support

If you're still having issues:

1. **Check the logs**
   - Browser console (F12)
   - Server terminal

2. **Test endpoints manually**
   - Visit `/api-test`
   - Use curl or Postman

3. **Verify configuration**
   - Firebase config in `.env.local`
   - Endpoint paths match exactly
   - `projectId="standalone"` in layout

4. **Common fixes**
   - Restart dev server after changing `.env.local`
   - Clear browser cache
   - Check Firestore security rules
   - Verify Firebase project is active

Your backend should now be fully functional! 🚀
