"use client";

import { useState, useEffect } from "react";
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
import {
  Plus,
  FileText,
  Trash2,
  Home,
  Copy,
  Pencil,
  Check,
  X,
} from "lucide-react";
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

  // Editing state for selected page properties
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [isDirty, setIsDirty] = useState(false);

  const selectedPage = pages.find((p) => p.id === currentPageId);

  // Sync edit fields when selected page changes
  useEffect(() => {
    if (selectedPage) {
      setEditName(selectedPage.name);
      setEditSlug(selectedPage.slug || "");
      setIsDirty(false);
    }
  }, [currentPageId, selectedPage?.name, selectedPage?.slug]);

  const handleAddPage = () => {
    if (!newPageName.trim()) return;

    const slug =
      newPageSlug.trim() || newPageName.toLowerCase().replace(/\s+/g, "-");
    onPageAdd(newPageName.trim(), slug);
    setNewPageName("");
    setNewPageSlug("");
    setIsAddDialogOpen(false);
  };

  const handleNewNameChange = (name: string) => {
    setNewPageName(name);
    // Auto-generate slug from name
    if (!newPageSlug) {
      setNewPageSlug(name.toLowerCase().replace(/\s+/g, "-"));
    }
  };

  const handleEditNameChange = (name: string) => {
    setEditName(name);
    setIsDirty(true);
  };

  const handleEditSlugChange = (slug: string) => {
    // Sanitize slug: lowercase, replace spaces with dashes, remove special chars
    const sanitized = slug
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9\-]/g, "");
    setEditSlug(sanitized);
    setIsDirty(true);
  };

  const handleSavePageProps = () => {
    if (!selectedPage || !editName.trim()) return;
    const finalSlug =
      editSlug.trim() || editName.toLowerCase().replace(/\s+/g, "-");
    onPageRename(selectedPage.id, editName.trim(), finalSlug);
    setIsDirty(false);
  };

  const handleCancelEdit = () => {
    if (selectedPage) {
      setEditName(selectedPage.name);
      setEditSlug(selectedPage.slug || "");
      setIsDirty(false);
    }
  };

  const handleDeletePage = () => {
    if (!selectedPage) return;
    onPageDelete(selectedPage.id);
  };

  const handleDuplicatePage = () => {
    if (!selectedPage || !onPageDuplicate) return;
    onPageDuplicate(selectedPage.id);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-border flex items-center justify-between">
        <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
          Pages
        </h3>
        <span className="text-[10px] text-muted-foreground">
          {pages.length} page{pages.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Pages List */}
      <div className="overflow-auto p-2">
        {pages.map((page) => (
          <div
            key={page.id}
            className={cn(
              "flex items-center justify-between p-2 rounded-md mb-1 cursor-pointer group transition-colors",
              currentPageId === page.id
                ? "bg-primary/10 border border-primary/30 text-primary"
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
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium truncate leading-tight">
                  {page.name}
                </span>
                <span className="text-[10px] opacity-40 truncate leading-tight">
                  /{page.slug === "index" ? "index" : page.slug || "—"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Page Properties */}
      {selectedPage && (
        <div className="border-t border-border p-3 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Page Properties
            </h4>
            {isDirty && (
              <div className="flex items-center gap-1">
                <button
                  onClick={handleSavePageProps}
                  className="p-1 rounded hover:bg-primary/20 text-primary transition-colors"
                  title="Save changes"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="p-1 rounded hover:bg-muted text-muted-foreground transition-colors"
                  title="Discard changes"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Page Name */}
          <div className="space-y-1">
            <Label
              htmlFor="edit-page-name"
              className="text-[11px] text-muted-foreground"
            >
              Name
            </Label>
            <Input
              id="edit-page-name"
              value={editName}
              onChange={(e) => handleEditNameChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && isDirty) handleSavePageProps();
                if (e.key === "Escape") handleCancelEdit();
              }}
              className="h-8 text-sm"
              placeholder="Page name"
            />
          </div>

          {/* Page Slug/Route */}
          <div className="space-y-1">
            <Label
              htmlFor="edit-page-slug"
              className="text-[11px] text-muted-foreground"
            >
              Route / Slug
            </Label>
            <Input
              id="edit-page-slug"
              value={editSlug}
              onChange={(e) => handleEditSlugChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && isDirty) handleSavePageProps();
                if (e.key === "Escape") handleCancelEdit();
              }}
              className="h-8 text-sm font-mono"
              placeholder="page-slug"
            />
            <div className="text-[10px] text-muted-foreground space-y-0.5 pt-0.5">
              <p>
                <span className="opacity-60">HTML:</span>{" "}
                <span className="font-mono">
                  /{editSlug || "page-slug"}.html
                </span>
              </p>
              <p>
                <span className="opacity-60">Next.js:</span>{" "}
                <span className="font-mono">
                  {editSlug === "index"
                    ? "/app/page.tsx"
                    : `/app/${editSlug || "page-slug"}/page.tsx`}
                </span>
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            {onPageDuplicate && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1 h-7 text-xs"
                onClick={handleDuplicatePage}
              >
                <Copy className="w-3 h-3 mr-1.5" />
                Duplicate
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 hover:border-destructive/30 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleDeletePage}
              disabled={pages.length <= 1}
              title={
                pages.length <= 1
                  ? "Cannot delete the last page"
                  : "Delete this page"
              }
            >
              <Trash2 className="w-3 h-3 mr-1.5" />
              Delete
            </Button>
          </div>
          {pages.length <= 1 && (
            <p className="text-[10px] text-muted-foreground text-center">
              Cannot delete the last page
            </p>
          )}
        </div>
      )}

      {/* Add Page Button */}
      <div className="mt-auto p-3 border-t border-border">
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
                onChange={(e) => handleNewNameChange(e.target.value)}
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
