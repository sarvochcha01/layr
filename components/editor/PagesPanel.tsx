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
import { Plus, FileText, Trash2, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface PagesPanelProps {
  pages: Page[];
  currentPageId: string;
  onPageSelect: (pageId: string) => void;
  onPageAdd: (name: string, slug: string) => void;
  onPageDelete: (pageId: string) => void;
  onPageRename: (pageId: string, name: string, slug: string) => void;
}

export function PagesPanel({
  pages,
  currentPageId,
  onPageSelect,
  onPageAdd,
  onPageDelete,
  onPageRename,
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
    <div className="h-full flex flex-col bg-white border-r border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900">Pages</h3>
        <p className="text-xs text-gray-500 mt-1">Manage your website pages</p>
      </div>

      {/* Pages List */}
      <div className="flex-1 overflow-auto p-2">
        {pages.map((page) => (
          <div
            key={page.id}
            className={cn(
              "flex items-center justify-between p-3 rounded-lg mb-2 cursor-pointer group",
              currentPageId === page.id
                ? "bg-blue-50 border-2 border-blue-500"
                : "hover:bg-gray-50 border-2 border-transparent"
            )}
            onClick={() => onPageSelect(page.id)}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {page.slug === "index" ? (
                <Home className="w-4 h-4 text-gray-500 flex-shrink-0" />
              ) : (
                <FileText className="w-4 h-4 text-gray-500 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {page.name}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  /{page.slug}.html
                </div>
              </div>
            </div>
            {page.slug !== "index" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPageDelete(page.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-opacity"
                title="Delete page"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Add Page Button */}
      <div className="p-4 border-t border-gray-200">
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
              <p className="text-xs text-gray-500">
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
