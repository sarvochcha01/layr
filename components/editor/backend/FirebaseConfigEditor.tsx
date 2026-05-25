"use client";

import { useState } from "react";
import type { UserFirebaseConfig } from "@/types/editor";
import { Flame, ClipboardPaste, CheckCircle2, AlertCircle, Trash2 } from "lucide-react";

interface FirebaseConfigEditorProps {
  config?: UserFirebaseConfig;
  onChange?: (config: UserFirebaseConfig | undefined) => void;
}

const EMPTY_CONFIG: UserFirebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
};

export function FirebaseConfigEditor({ config, onChange }: FirebaseConfigEditorProps) {
  const [localConfig, setLocalConfig] = useState<UserFirebaseConfig>(config || EMPTY_CONFIG);
  const [jsonInput, setJsonInput] = useState("");
  const [parseError, setParseError] = useState<string | null>(null);
  const [showPasteMode, setShowPasteMode] = useState(!config);

  const isConfigured = !!(config?.apiKey && config?.projectId && config?.appId);

  const handleFieldChange = (field: keyof UserFirebaseConfig, value: string) => {
    const updated = { ...localConfig, [field]: value };
    setLocalConfig(updated);
    // Auto-save if all required fields are filled
    if (updated.apiKey && updated.authDomain && updated.projectId && updated.appId) {
      onChange?.(updated);
    }
  };

  const handlePasteConfig = () => {
    setParseError(null);
    try {
      // Try to parse as JSON object
      let parsed: any;

      // Handle JavaScript object format (with const/var/let)
      let cleanInput = jsonInput.trim();
      // Strip "const/var/let firebaseConfig = " prefix
      cleanInput = cleanInput.replace(/^(?:const|var|let)\s+\w+\s*=\s*/, "");
      // Strip trailing semicolon
      cleanInput = cleanInput.replace(/;\s*$/, "");
      // Convert JS property keys to JSON (unquoted → quoted)
      cleanInput = cleanInput.replace(/(\w+)\s*:/g, '"$1":');
      // Remove trailing commas
      cleanInput = cleanInput.replace(/,\s*([\]}])/g, "$1");

      parsed = JSON.parse(cleanInput);

      if (!parsed.apiKey || !parsed.projectId || !parsed.appId) {
        setParseError("Missing required fields: apiKey, projectId, or appId");
        return;
      }

      const newConfig: UserFirebaseConfig = {
        apiKey: parsed.apiKey || "",
        authDomain: parsed.authDomain || "",
        projectId: parsed.projectId || "",
        storageBucket: parsed.storageBucket || "",
        messagingSenderId: parsed.messagingSenderId || "",
        appId: parsed.appId || "",
      };

      setLocalConfig(newConfig);
      onChange?.(newConfig);
      setShowPasteMode(false);
      setJsonInput("");
    } catch (e: any) {
      setParseError("Invalid config format. Paste the full Firebase config object.");
    }
  };

  const handleRemoveConfig = () => {
    setLocalConfig(EMPTY_CONFIG);
    onChange?.(undefined);
    setShowPasteMode(true);
  };

  const handleSaveFields = () => {
    if (localConfig.apiKey && localConfig.projectId && localConfig.appId) {
      onChange?.(localConfig);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="max-w-2xl mx-auto py-10 px-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
            <Flame className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Firebase Configuration</h2>
            <p className="text-xs text-muted-foreground">
              Connect your own Firebase project for authentication & database
            </p>
          </div>
          {isConfigured && (
            <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 text-green-500 text-[10px] font-semibold">
              <CheckCircle2 className="w-3 h-3" />
              Connected
            </div>
          )}
        </div>

        {/* Status card */}
        <div className={`p-4 rounded-xl border mb-6 ${
          isConfigured
            ? "border-green-500/20 bg-green-500/5"
            : "border-amber-500/20 bg-amber-500/5"
        }`}>
          <div className="flex items-start gap-3">
            {isConfigured ? (
              <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
            )}
            <div>
              <p className="text-xs font-semibold text-foreground">
                {isConfigured
                  ? `Connected to Firebase project: ${config?.projectId}`
                  : "No Firebase project connected"}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {isConfigured
                  ? "Your backend pipelines will use this Firebase project for auth & database operations."
                  : "Paste your Firebase config to enable auth & database features in your endpoints."}
              </p>
            </div>
          </div>
        </div>

        {/* Paste mode */}
        {showPasteMode && (
          <div className="mb-6 p-5 rounded-xl border border-border bg-card">
            <div className="flex items-center gap-2 mb-3">
              <ClipboardPaste className="w-4 h-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-foreground">Paste Firebase Config</h3>
            </div>
            <p className="text-[10px] text-muted-foreground mb-3">
              Go to your Firebase Console → Project Settings → General → Your apps → Firebase SDK snippet → Config.
              Paste the entire <code className="px-1 py-0.5 bg-muted rounded text-[9px]">firebaseConfig</code> object below.
            </p>
            <textarea
              value={jsonInput}
              onChange={(e) => { setJsonInput(e.target.value); setParseError(null); }}
              placeholder={`const firebaseConfig = {\n  apiKey: "AIzaSy...",\n  authDomain: "myapp.firebaseapp.com",\n  projectId: "myapp",\n  storageBucket: "myapp.appspot.com",\n  messagingSenderId: "123456789",\n  appId: "1:123456789:web:abc123"\n};`}
              className="w-full h-44 bg-muted/50 border border-border rounded-lg p-3 text-xs font-mono resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
            {parseError && (
              <p className="text-[10px] text-red-500 mt-2 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {parseError}
              </p>
            )}
            <div className="flex gap-2 mt-3">
              <button
                onClick={handlePasteConfig}
                disabled={!jsonInput.trim()}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-semibold hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Apply Config
              </button>
              {isConfigured && (
                <button
                  onClick={() => setShowPasteMode(false)}
                  className="px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        )}

        {/* Field-by-field editor (always visible when configured) */}
        {!showPasteMode && (
          <div className="space-y-4 p-5 rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-foreground">Configuration Fields</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowPasteMode(true)}
                  className="px-3 py-1.5 text-[10px] font-medium text-muted-foreground hover:text-foreground border border-border rounded-md hover:bg-muted/50 transition-colors"
                >
                  <ClipboardPaste className="w-3 h-3 inline mr-1" />
                  Re-paste
                </button>
                <button
                  onClick={handleRemoveConfig}
                  className="px-3 py-1.5 text-[10px] font-medium text-red-500 hover:text-red-400 border border-red-500/20 rounded-md hover:bg-red-500/5 transition-colors"
                >
                  <Trash2 className="w-3 h-3 inline mr-1" />
                  Remove
                </button>
              </div>
            </div>

            {(
              [
                { key: "apiKey", label: "API Key", required: true },
                { key: "authDomain", label: "Auth Domain", required: true },
                { key: "projectId", label: "Project ID", required: true },
                { key: "storageBucket", label: "Storage Bucket", required: false },
                { key: "messagingSenderId", label: "Messaging Sender ID", required: false },
                { key: "appId", label: "App ID", required: true },
              ] as const
            ).map((field) => (
              <div key={field.key} className="space-y-1">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  {field.label}
                  {field.required && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="text"
                  value={localConfig[field.key] || ""}
                  onChange={(e) => handleFieldChange(field.key, e.target.value)}
                  onBlur={handleSaveFields}
                  className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                />
              </div>
            ))}
          </div>
        )}

        {/* Info box */}
        <div className="mt-6 p-4 rounded-xl bg-muted/30 border border-border">
          <h4 className="text-xs font-semibold text-foreground mb-2">How it works</h4>
          <ul className="space-y-1.5 text-[10px] text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">1.</span>
              Your Firebase config is stored in this project's settings.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">2.</span>
              When your backend endpoints execute, they use YOUR Firebase for authentication and database.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">3.</span>
              Use the "Firebase Signup" and "Firebase Login" pipeline nodes for user authentication.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">4.</span>
              Database operations (DB Query, Insert, Update, Delete) store data directly in YOUR Firestore.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
