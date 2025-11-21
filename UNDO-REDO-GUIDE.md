# Undo/Redo Feature Guide

The editor now includes a full undo/redo system that tracks up to 50 actions, allowing you to easily revert or reapply changes.

## Features

### History Tracking

- Tracks up to 50 actions in history
- Automatically manages history stack (oldest actions are removed when limit is reached)
- Clears future history when new actions are performed after undo

### Supported Actions

All editor actions are tracked in history:

- Adding components
- Deleting components
- Updating component properties
- Duplicating components
- Adding/deleting pages
- Moving components (drag & drop)

### UI Controls

**Undo Button**

- Located in the top toolbar, left of Preview button
- Disabled when no actions to undo (grayed out)
- Shows tooltip: "Undo (Ctrl+Z)"

**Redo Button**

- Located next to Undo button
- Disabled when no actions to redo (grayed out)
- Shows tooltip: "Redo (Ctrl+Y)"

### Keyboard Shortcuts

**Undo**

- Windows/Linux: `Ctrl + Z`
- Mac: `Cmd + Z`

**Redo**

- Windows/Linux: `Ctrl + Y` or `Ctrl + Shift + Z`
- Mac: `Cmd + Y` or `Cmd + Shift + Z`

## How It Works

### History Stack

The system maintains three states:

1. **Past**: Array of previous states (up to 50)
2. **Present**: Current state
3. **Future**: Array of undone states (for redo)

### State Management

- When you perform an action, the current state is added to the past
- When you undo, the current state moves to future, and the last past state becomes present
- When you redo, the first future state becomes present, and current moves to past
- Performing a new action after undo clears the future stack

### Auto-Save Integration

- Undo/redo works seamlessly with auto-save
- History is preserved during auto-save operations
- Initial project load doesn't create history entries

## Technical Details

### Implementation

- Custom `useHistory` hook manages the history stack
- History is stored in memory (not persisted to database)
- Deep comparison prevents duplicate history entries for identical states
- Undo/redo actions don't create new history entries

### Performance

- History uses JSON serialization for state comparison
- Limited to 50 entries to prevent memory issues
- Efficient state updates using React's state management

## Tips

- Use undo/redo freely - it's designed to handle complex component trees
- History is cleared when you reload the page or switch projects
- Keyboard shortcuts work when focus is on the canvas or editor body
- Visual feedback (toast notifications) confirms undo/redo actions
- Button states (enabled/disabled) indicate available actions

## Limitations

- History is not persisted across page reloads
- Maximum of 50 actions in history
- History is per-session (not shared across browser tabs)
- Undo/redo doesn't work while typing in input fields (by design)
