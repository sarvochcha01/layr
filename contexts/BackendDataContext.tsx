"use client";

import { createContext, useContext, ReactNode } from "react";
import { ApiEndpoint } from "@/types/backend";

interface BackendDataContextValue {
  /** Project ID for API requests */
  projectId: string | null;
  /** All endpoint definitions from the project */
  endpoints: ApiEndpoint[];
  /** Find an endpoint by path and method */
  findEndpoint: (path: string, method?: string) => ApiEndpoint | undefined;
  /** Get all enabled endpoints */
  enabledEndpoints: ApiEndpoint[];
}

const BackendDataContext = createContext<BackendDataContextValue>({
  projectId: null,
  endpoints: [],
  findEndpoint: () => undefined,
  enabledEndpoints: [],
});

export function BackendDataProvider({
  children,
  projectId,
  endpoints,
}: {
  children: ReactNode;
  projectId: string | null;
  endpoints: ApiEndpoint[];
}) {
  const findEndpoint = (path: string, method: string = "GET") => {
    return endpoints.find(
      (ep) => ep.path === path && ep.method === method && ep.isEnabled
    );
  };

  const enabledEndpoints = endpoints.filter((ep) => ep.isEnabled);

  return (
    <BackendDataContext.Provider
      value={{ projectId, endpoints, findEndpoint, enabledEndpoints }}
    >
      {children}
    </BackendDataContext.Provider>
  );
}

export function useBackendContext() {
  return useContext(BackendDataContext);
}
