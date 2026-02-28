"use client";

import { useState } from "react";
import { Page } from "@/types/editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, FileText, Trash2, Home, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

interface PagesPanelProps {
  pages: Page[];
  currentPageId: string;
  onPageSelect: (pageId: string) => void;
  onPageAdd: (name: string, slug: string) => void;
  onPageDelete: (pageId: string) => void;
  onPageRename: (pageId: string, name: string, slug: string) => void;
  onPageDuplicate?: (pageId: string) => void;
}

export function PagesPanel({
  pages,
  currentPageId,
  onPageSelect,
  onPageAdd,
  onPageDelete,
  onPageRename,
  onPageDuplicate,
}: PagesPanelProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newPageName, setNewPageName] = useState("");
  const [newPageSlug, setNewPageSlug] = useState("");

  const handleAddPage = () => {
    if (!newPageName.trim()) return;

    const slug =
      newPageSlug.trim() || newPageName.toLowerCase().replace(/\s+/g, "-");
    onPageAdd(newPageName.trim(), slug);
    setNewPageName("");
    setNewPageSlug("");
    setIsAddDialogOpen(false);
  };

  const handleNameChange = (name: string) => {
    setNewPageName(name);
    // Auto-generate slug from name
    if (!newPageSlug) {
      setNewPageSlug(name.toLowerCase().replace(/\s+/g, "-"));
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-border">
        <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">Pages</h3>
      </div>

      {/* Pages List */}
      <div className="flex-1 overflow-auto p-2">
        {pages.map((page) => (
          <div
            key={page.id}
            className={cn(
              "flex items-center justify-between p-2 rounded-md mb-1 cursor-pointer group",
              currentPageId === page.id
                ? "bg-primary/10 border border-primary text-primary"
                : "hover:bg-muted border border-transparent text-foreground",
            )}
            onClick={() => onPageSelect(page.id)}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {page.slug === "index" ? (
                <Home className="w-3.5 h-3.5 flex-shrink-0 opacity-70" />
              ) : (
                <FileText className="w-3.5 h-3.5 flex-shrink-0 opacity-70" />
              )}
              <span className="text-sm font-medium truncate">
                {page.name}
              </span>
              <span className="text-[10px] opacity-50 truncate">
                /{page.slug}.html
              </span>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
              {onPageDuplicate && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPageDuplicate(page.id);
                  }}
                  className="p-1 hover:bg-primary/20 rounded transition-colors"
                  title="Duplicate page"
                >
                  <Copy className="w-3.5 h-3.5 text-primary" />
                </button>
              )}
              {page.slug !== "index" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPageDelete(page.id);
                  }}
                  className="p-1 hover:bg-destructive/20 rounded transition-colors"
                  title="Delete page"
                >
                  <Trash2 className="w-3.5 h-3.5 text-destructive" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Page Button */}
      <div className="p-3 border-t border-border">
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => setIsAddDialogOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Page
        </Button>
      </div>

      {/* Add Page Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Page</DialogTitle>
            <DialogDescription>
              Create a new page for your website
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="pageName">Page Name</Label>
              <Input
                id="pageName"
                value={newPageName}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="About Us"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pageSlug">URL Slug</Label>
              <Input
                id="pageSlug"
                value={newPageSlug}
                onChange={(e) => setNewPageSlug(e.target.value)}
                placeholder="about-us"
              />
              <p className="text-xs text-muted-foreground">
                Will be accessible at: /{newPageSlug || "page-name"}.html
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddDialogOpen(false);
                setNewPageName("");
                setNewPageSlug("");
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAddPage} disabled={!newPageName.trim()}>
              Add Page
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
