"use client";

import { useState } from "react";
import { ApiEndpoint, HttpMethod, METHOD_COLORS } from "@/types/backend";
import {
  Plus,
  Search,
  Trash2,
  ToggleLeft,
  ToggleRight,
  MoreVertical,
} from "lucide-react";

interface EndpointListProps {
  endpoints: ApiEndpoint[];
  selectedEndpointId: string | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
  onToggleEnabled: (id: string) => void;
}

export function EndpointList({
  endpoints,
  selectedEndpointId,
  onSelect,
  onCreate,
  onDelete,
  onToggleEnabled,
}: EndpointListProps) {
  const [search, setSearch] = useState("");
  const [contextMenuId, setContextMenuId] = useState<string | null>(null);

  const filtered = endpoints.filter(
    (ep) =>
      ep.name.toLowerCase().includes(search.toLowerCase()) ||
      ep.path.toLowerCase().includes(search.toLowerCase())
  );

  // Group by method
  const grouped = filtered.reduce(
    (acc, ep) => {
      if (!acc[ep.method]) acc[ep.method] = [];
      acc[ep.method].push(ep);
      return acc;
    },
    {} as Record<string, ApiEndpoint[]>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 p-3 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
            Endpoints
          </h3>
          <button
            onClick={onCreate}
            className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-md transition-colors"
          >
            <Plus className="w-3 h-3" />
            New
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search endpoints..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-muted/50 border border-border rounded-md outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/50 text-foreground placeholder:text-muted-foreground/40"
          />
        </div>
      </div>

      {/* Endpoint list */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 && (
          <div className="p-6 text-center">
            <div className="text-muted-foreground/40 text-xs">
              {endpoints.length === 0 ? (
                <>
                  <p className="mb-2">No endpoints yet</p>
                  <button
                    onClick={onCreate}
                    className="text-primary hover:underline"
                  >
                    Create your first endpoint
                  </button>
                </>
              ) : (
                <p>No matches found</p>
              )}
            </div>
          </div>
        )}

        <div className="p-2 space-y-0.5">
          {filtered.map((endpoint) => {
            const colors = METHOD_COLORS[endpoint.method];
            const isSelected = endpoint.id === selectedEndpointId;

            return (
              <div
                key={endpoint.id}
                data-endpoint-item
                className={`group relative flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-150 ${
                  isSelected
                    ? "bg-primary/10 border border-primary/30"
                    : "hover:bg-muted/60 border border-transparent"
                }`}
                onClick={() => onSelect(endpoint.id)}
              >
                {/* Method badge */}
                <span
                  className={`flex-shrink-0 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${colors.bg} ${colors.text} border ${colors.border}`}
                >
                  {endpoint.method}
                </span>

                {/* Path & name */}
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-mono text-foreground truncate">
                    {endpoint.path || "/"}
                  </div>
                  {endpoint.name && (
                    <div className="text-[10px] text-muted-foreground/60 truncate mt-0.5">
                      {endpoint.name}
                    </div>
                  )}
                </div>

                {/* Status indicator */}
                {!endpoint.isEnabled && (
                  <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-muted-foreground/30" title="Disabled" />
                )}

                {/* Context menu trigger */}
                <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setContextMenuId(
                        contextMenuId === endpoint.id ? null : endpoint.id
                      );
                    }}
                    className="p-1 hover:bg-muted rounded transition-colors text-muted-foreground"
                  >
                    <MoreVertical className="w-3 h-3" />
                  </button>

                  {/* Context menu */}
                  {contextMenuId === endpoint.id && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={(e) => {
                          e.stopPropagation();
                          setContextMenuId(null);
                        }}
                      />
                      <div className="absolute right-0 top-full mt-1 w-40 bg-card rounded-lg shadow-xl border border-border overflow-hidden z-50">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleEnabled(endpoint.id);
                            setContextMenuId(null);
                          }}
                          className="w-full text-left px-3 py-2 text-xs hover:bg-muted transition-colors flex items-center gap-2"
                        >
                          {endpoint.isEnabled ? (
                            <ToggleRight className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <ToggleLeft className="w-3.5 h-3.5 text-muted-foreground" />
                          )}
                          {endpoint.isEnabled ? "Disable" : "Enable"}
                        </button>
                        <div className="h-px bg-border" />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(endpoint.id);
                            setContextMenuId(null);
                          }}
                          className="w-full text-left px-3 py-2 text-xs hover:bg-red-500/10 text-red-400 transition-colors flex items-center gap-2"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer stats */}
      <div className="flex-shrink-0 px-3 py-2 border-t border-border">
        <div className="flex items-center justify-between text-[10px] text-muted-foreground/50">
          <span>{endpoints.length} endpoint{endpoints.length !== 1 ? "s" : ""}</span>
          <span>{endpoints.filter((e) => e.isEnabled).length} active</span>
        </div>
      </div>
    </div>
  );
}
