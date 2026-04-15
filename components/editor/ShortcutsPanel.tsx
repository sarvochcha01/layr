"use client";

import { X } from "lucide-react";

interface ShortcutsPanelProps {
  onClose: () => void;
}

export function ShortcutsPanel({ onClose }: ShortcutsPanelProps) {
  const shortcuts = [
    {
      category: "General",
      items: [
        { keys: ["Ctrl", "Z"], description: "Undo" },
        { keys: ["Ctrl", "Y"], description: "Redo" },
        { keys: ["Ctrl", "Shift", "Z"], description: "Redo (alternative)" },
        { keys: ["Ctrl", "S"], description: "Save (auto-save enabled)" },
        { keys: ["Esc"], description: "Deselect all" },
      ],
    },
    {
      category: "Selection",
      items: [
        { keys: ["Ctrl", "A"], description: "Select all components" },
        { keys: ["Click"], description: "Select component" },
        { keys: ["Ctrl", "Click"], description: "Multi-select" },
      ],
    },
    {
      category: "Canvas",
      items: [
        { keys: ["Ctrl", "Scroll"], description: "Zoom in/out" },
        { keys: ["Ctrl", "Middle Click"], description: "Pan canvas" },
      ],
    },
    {
      category: "Components",
      items: [
        { keys: ["Delete"], description: "Delete selected" },
        { keys: ["Ctrl", "D"], description: "Duplicate selected" },
        { keys: ["Ctrl", "C"], description: "Copy component" },
        { keys: ["Ctrl", "V"], description: "Paste component" },
        { keys: ["Ctrl", "Drag"], description: "Insert or place inside container" },
        { keys: ["Ctrl", "Shift", "Drag"], description: "Swap component positions" },
      ],
    },
    {
      category: "Navigation",
      items: [
        { keys: ["Tab"], description: "Next field" },
        { keys: ["Shift", "Tab"], description: "Previous field" },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Keyboard Shortcuts
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-4rem)]">
          <div className="space-y-6">
            {shortcuts.map((section) => (
              <div key={section.category}>
                <h3 className="text-sm font-semibold text-gray-700 uppercase mb-3">
                  {section.category}
                </h3>
                <div className="space-y-2">
                  {section.items.map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 px-3 hover:bg-gray-50 rounded"
                    >
                      <span className="text-sm text-gray-700">
                        {shortcut.description}
                      </span>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, keyIndex) => (
                          <span key={keyIndex} className="flex items-center">
                            <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded shadow-sm">
                              {key}
                            </kbd>
                            {keyIndex < shortcut.keys.length - 1 && (
                              <span className="mx-1 text-gray-400">+</span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <p className="text-xs text-gray-600 text-center">
            Press{" "}
            <kbd className="px-1 py-0.5 text-xs bg-white border border-gray-300 rounded">
              ?
            </kbd>{" "}
            to toggle this panel
          </p>
        </div>
      </div>
    </div>
  );
}
