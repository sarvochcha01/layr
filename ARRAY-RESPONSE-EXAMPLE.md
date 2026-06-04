# Visual Example: Mapping Array Response to Text Components

## Your Backend Response
```json
[
  {
    "name": "John Doe",
    "email": "john@example.com",
    "bio": "Software developer"
  }
]
```

## What You'll See in the Data Source Panel

### 1. After Connecting to Endpoint

```
┌─────────────────────────────────────────┐
│ 📊 Data Source                    Bound │
├─────────────────────────────────────────┤
│                                         │
│ ✓ Connected to: GET /user               │
│                                         │
│ 💡 Array response detected. Mapping    │
│    to [0] will use the first item.     │
│                                         │
│ Field Mappings                 3 mapped │
│                                         │
│ Content  →  [0].name ▼                  │
│                                         │
│ [Fetch Preview] [Apply Data]            │
│                                         │
└─────────────────────────────────────────┘
```

### 2. Dropdown Options You'll See

When you click the dropdown next to "Content", you'll see:

```
┌─────────────────────┐
│ — none —            │
│ [0].name            │ ← Select this for name
│ [0].email           │ ← Select this for email
│ [0].bio             │ ← Select this for bio
└─────────────────────┘
```

## Step-by-Step Visual Guide

### Step 1: Create 3 Text Components

```
┌──────────────────────────────────┐
│  Canvas                          │
│                                  │
│  ┌────────────────────────────┐  │
│  │ Text Component 1           │  │
│  │ (will show name)           │  │
│  └────────────────────────────┘  │
│                                  │
│  ┌────────────────────────────┐  │
│  │ Text Component 2           │  │
│  │ (will show email)          │  │
│  └────────────────────────────┘  │
│                                  │
│  ┌────────────────────────────┐  │
│  │ Text Component 3           │  │
│  │ (will show bio)            │  │
│  └────────────────────────────┘  │
│                                  │
└──────────────────────────────────┘
```

### Step 2: Configure Each Component

**Text Component 1:**
```
Properties Panel
├─ Content Section
│  └─ Content: "John Doe" (will be replaced)
│
└─ Data Source Section
   ├─ Connect to Endpoint: GET /user
   └─ Field Mappings:
      └─ Content → [0].name
```

**Text Component 2:**
```
Properties Panel
├─ Content Section
│  └─ Content: "john@example.com" (will be replaced)
│
└─ Data Source Section
   ├─ Connect to Endpoint: GET /user
   └─ Field Mappings:
      └─ Content → [0].email
```

**Text Component 3:**
```
Properties Panel
├─ Content Section
│  └─ Content: "Software developer" (will be replaced)
│
└─ Data Source Section
   ├─ Connect to Endpoint: GET /user
   └─ Field Mappings:
      └─ Content → [0].bio
```

### Step 3: Preview Mode Result

```
┌──────────────────────────────────┐
│  Preview Mode                    │
│                                  │
│  John Doe                        │ ← From [0].name
│                                  │
│  john@example.com                │ ← From [0].email
│                                  │
│  Software developer              │ ← From [0].bio
│                                  │
└──────────────────────────────────┘
```

## Key Points

✅ **Each Text component** needs its own Data Source binding
✅ **All three** can connect to the **same endpoint** (GET /user)
✅ **Each one** maps to a **different field** ([0].name, [0].email, [0].bio)
✅ The `[0]` means "first item in the array"
✅ Data updates automatically when you switch to Preview Mode

## Common Mistake to Avoid

❌ **Don't do this:**
```
Trying to map all fields to ONE Text component
Content → [0].name, [0].email, [0].bio  ← Won't work!
```

✅ **Do this instead:**
```
Text Component 1: Content → [0].name
Text Component 2: Content → [0].email
Text Component 3: Content → [0].bio
```

## Testing Your Setup

1. **Click "Fetch Preview"** in the Data Source panel
2. You should see:
   ```json
   ✓ Data fetched successfully
   [
     {
       "name": "John Doe",
       "email": "john@example.com",
       "bio": "Software developer"
     }
   ]
   ```
3. **Click "Apply Data"** to populate the component
4. **Switch to Preview Mode** to see live data

## What If My Array Has Multiple Items?

If your response is:
```json
[
  { "name": "John Doe", "email": "john@example.com" },
  { "name": "Jane Smith", "email": "jane@example.com" }
]
```

- `[0].name` will get "John Doe" (first item)
- `[1].name` would get "Jane Smith" (second item)

For displaying **all items**, you'll need a different approach (like a Grid with dynamic children), but for a **single item**, this works perfectly!
