# Data Source with Array Responses - Quick Guide

## Problem
Your backend endpoint returns an array with one object:
```json
[
  {
    "name": "John Doe",
    "email": "john@example.com",
    "bio": "Software developer"
  }
]
```

And you want to map these fields to Text components.

## Solution

### Step 1: Set Up Your Backend Endpoint

1. **Go to Backend Editor**
2. **Create or edit your endpoint** (e.g., `GET /user`)
3. **Configure the Mock Response** to match your actual response structure:

```json
[
  {
    "name": "John Doe",
    "email": "john@example.com",
    "bio": "Software developer"
  }
]
```

**Important:** The mock response structure must match your actual backend response for the field mapping to work correctly.

### Step 2: Add Text Components

1. Add Text components to your page where you want to display the data
2. For example:
   - Text component for name
   - Text component for email
   - Text component for bio

### Step 3: Bind Each Text Component

For **each Text component**:

1. **Select the component** in the canvas
2. **Open the Properties Panel** on the right
3. **Scroll to "Data Source" section**
4. **Click "Connect to Endpoint"** and select your endpoint (e.g., `GET /user`)
5. **Map the fields:**
   - In the dropdown next to "Content", select `[0].name` (for the name field)
   - Or select `[0].email` (for the email field)
   - Or select `[0].bio` (for the bio field)

### Step 4: Test the Connection

1. **Click "Fetch Preview"** to test the connection
2. You should see the response data in the preview box
3. **Click "Apply Data"** to populate the text component
4. **Switch to Preview Mode** to see the live data

## How Array Notation Works

When your response is an array, the system automatically detects it and shows paths like:
- `[0].name` - Gets the `name` field from the first item
- `[0].email` - Gets the `email` field from the first item
- `[0].bio` - Gets the `bio` field from the first item

The `[0]` means "first item in the array".

## Example: Complete Setup

### Backend Endpoint Configuration
```
Method: GET
Path: /user
Mock Response:
[
  {
    "name": "John Doe",
    "email": "john@example.com",
    "bio": "Software developer",
    "avatar": "https://example.com/avatar.jpg"
  }
]
```

### Text Components Setup

**Text Component 1 (Name):**
- Data Source: Connected to `GET /user`
- Field Mapping: `content` → `[0].name`

**Text Component 2 (Email):**
- Data Source: Connected to `GET /user`
- Field Mapping: `content` → `[0].email`

**Text Component 3 (Bio):**
- Data Source: Connected to `GET /user`
- Field Mapping: `content` → `[0].bio`

## Troubleshooting

### Issue: Dropdown shows no fields
**Solution:** Make sure your endpoint has a `mockResponse` configured that matches your actual backend response structure.

### Issue: Data not showing in preview mode
**Solution:** 
1. Check that your endpoint is enabled
2. Verify the endpoint path matches exactly
3. Make sure you're in Preview Mode (not Edit Mode)
4. Check the browser console for errors

### Issue: Wrong data showing
**Solution:** Make sure the mock response structure matches your actual backend response. If your backend returns an array, the mock response should also be an array.

## Advanced: Nested Arrays

If your response has nested arrays:
```json
[
  {
    "name": "John",
    "addresses": [
      { "city": "New York", "zip": "10001" }
    ]
  }
]
```

You can access nested data:
- `[0].name` → "John"
- `[0].addresses[0].city` → "New York"
- `[0].addresses[0].zip` → "10001"

## Next Steps

Once you have basic field mapping working, you can:
1. Use **Backend Actions** to trigger data updates
2. Create **dynamic lists** by mapping arrays to Grid/Container components
3. Combine multiple endpoints for complex data flows
