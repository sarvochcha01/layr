"use client";

import { createContext, useContext, ReactNode } from "react";

interface BackendContextValue {
  projectId: string | null;
}

const BackendContext = createContext<BackendContextValue>({
  projectId: null,
});

export function BackendProvider({
  projectId,
  children,
}: {
  projectId: string | null;
  children: ReactNode;
}) {
  return (
    <BackendContext.Provider value={{ projectId }}>
      {children}
    </BackendContext.Provider>
  );
}

/**
 * Use this hook in any builder component (Form, Button, etc.)
 * to get the project ID for backend API calls.
 */
export function useBackendContext() {
  return useContext(BackendContext);
}
