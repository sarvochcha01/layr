# Firebase Data Source Mapping - Complete Guide

## The Problem (FIXED!)

When using **Firebase/Pipeline endpoints** (not mock data), the field dropdown was empty because the system only looked at `mockResponse`, which doesn't exist for real Firebase queries.

## The Solution

The system now:
1. ✅ **Auto-fetches** data when you connect to a Firebase endpoint
2. ✅ **Discovers fields** from the actual response
3. ✅ **Populates the dropdown** with available fields
4. ✅ **Supports manual input** for custom paths

---

## Step-by-Step Guide

### 1. Create Your Firebase Endpoint

**Backend Editor:**
- Method: `GET`
- Path: `/user` (or whatever you want)
- **Enable Pipeline Mode**
- Add a **DB Query** step:
  - Collection: `users`
  - Filters: (your filters)
  - Result Variable: `result`
- Add a **Respond** step:
  - Status: `200`
  - Body Mode: `mapping`
  - Body Mapping: `result` → `result`

**Important:** Your query will return an array like:
```json
[
  {
    "name": "John Doe",
    "email": "john@example.com",
    "bio": "Software developer"
  }
]
```

### 2. Add Text Components to Your Page

Add 3 Text components (one for each field you want to display).

### 3. Connect First Text Component

1. **Select** the first Text component
2. **Open Properties Panel** → scroll to **Data Source**
3. **Click "Connect to Endpoint"** → select your endpoint (e.g., `GET /user`)
4. **Wait a moment** - the system will auto-fetch data to discover fields
5. You'll see a message: "No mock response defined. Click Fetch Preview..."
6. **Click "Fetch Preview"** button
7. **Wait for the response** - you should see your data in the preview box
8. **Now the dropdown will be populated!** You'll see:
   - `[0].name`
   - `[0].email`
   - `[0].bio`
9. **Select `[0].name`** from the dropdown next to "Content"

### 4. Connect Remaining Text Components

Repeat step 3 for the other Text components:
- Text #2: Map `content` → `[0].email`
- Text #3: Map `content` → `[0].bio`

### 5. Preview Your Page

Switch to **Preview Mode** and you should see the live data from Firebase!

---

## Manual Input Mode (Advanced)

If the dropdown doesn't show the field you need, you can type it manually:

1. Click the **✏️ (pencil icon)** next to the dropdown
2. Type your custom path, e.g.:
   - `[0].name`
   - `[0].profile.avatar`
   - `[0].addresses[0].city`
3. Click the **dropdown icon** to switch back to dropdown mode

---

## Visual Workflow

```
┌─────────────────────────────────────────────────┐
│ 1. Connect to Endpoint                          │
│    ↓                                            │
│ 2. System auto-fetches (or click Fetch Preview)│
│    ↓                                            │
│ 3. Fields appear in dropdown                    │
│    ↓                                            │
│ 4. Select field (e.g., [0].name)                │
│    ↓                                            │
│ 5. Switch to Preview Mode                       │
│    ↓                                            │
│ 6. See live Firebase data! 🎉                   │
└─────────────────────────────────────────────────┘
```

---

## Troubleshooting

### Issue: Dropdown is still empty after clicking "Fetch Preview"

**Possible causes:**
1. **Endpoint not enabled** - Check Backend Editor
2. **Firebase not configured** - Check project settings
3. **Query returns empty array** - Check your filters
4. **Network error** - Check browser console

**Solution:**
- Click "Fetch Preview" again
- Check the preview box for error messages
- Use manual input mode (✏️) to type the path manually

### Issue: Data shows in preview but not in Preview Mode

**Possible causes:**
1. Field mapping not saved
2. Component not in preview mode

**Solution:**
- Make sure you see the green checkmark after mapping
- Click "Apply Data" button
- Switch to Preview Mode (not Edit Mode)

### Issue: Shows "[object Object]" instead of text

**Cause:** You mapped to an object instead of a primitive value

**Solution:**
- Map to a leaf field like `[0].name`, not `[0]` or `[0].profile`

---

## Example: Complete Setup

### Backend Endpoint
```
GET /user
Pipeline:
  1. DB Query
     - Collection: users
     - Filter: email == "{{body.email}}"
     - Result: result
  2. Respond
     - Status: 200
     - Body: { "result": "{{result}}" }
```

### Response Structure
```json
[
  {
    "name": "John Doe",
    "email": "john@example.com",
    "bio": "Software developer",
    "avatar": "https://example.com/avatar.jpg",
    "createdAt": "2024-01-01"
  }
]
```

### Text Components

**Component 1 - Name:**
```
Data Source: GET /user
Mapping: content → [0].name
Result: "John Doe"
```

**Component 2 - Email:**
```
Data Source: GET /user
Mapping: content → [0].email
Result: "john@example.com"
```

**Component 3 - Bio:**
```
Data Source: GET /user
Mapping: content → [0].bio
Result: "Software developer"
```

---

## Key Features

✅ **Auto-discovery** - Fields are discovered from actual Firebase data
✅ **Manual input** - Type custom paths when needed
✅ **Array support** - Handles `[0].field` notation
✅ **Nested objects** - Supports `[0].profile.avatar` paths
✅ **Real-time preview** - See data before applying

---

## What Changed (Technical)

1. **`extractResponsePaths()`** now uses `previewData` if `mockResponse` is empty
2. **Auto-fetch** triggers when endpoint has no mockResponse
3. **Manual input mode** allows typing custom paths
4. **Better error messages** guide users to fetch preview data

---

## Next Steps

1. Test with your Firebase endpoint
2. Click "Fetch Preview" to discover fields
3. Map fields to Text components
4. Switch to Preview Mode to see live data

If you still have issues, check:
- Browser console for errors
- Backend Editor → your endpoint is enabled
- Firebase configuration is correct
- Your query returns data (test in Firebase console)
