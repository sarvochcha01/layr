import { Button } from "@/components/ui/button";
import { Trash2, Eye, Clock } from "lucide-react";

interface ProjectCardProps {
  name: string;
  description: string;
  status: "Published" | "Draft" | "In Review";
  lastModified?: string;
  views?: string;
  onClick?: () => void;
  onDelete?: () => void;
}

export function ProjectCard({
  name,
  description,
  status,
  lastModified,
  views,
  onClick,
  onDelete,
}: ProjectCardProps) {
  const getStatusStyles = (status: string) => {
    switch (status) {
      case "Published":
        return "bg-green-100 text-green-800";
      case "Draft":
        return "bg-gray-100 text-gray-800";
      case "In Review":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div
      className="p-6 border rounded-lg bg-card hover:shadow-md transition-shadow cursor-pointer relative group"
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="font-semibold mb-2">{name}</h3>
          <p className="text-sm text-muted-foreground mb-4">{description}</p>
        </div>
      </div>

      {(lastModified || views) && (
        <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
          {lastModified && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {lastModified}
            </span>
          )}
          {views && (
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {views} views
            </span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between">
        <span
          className={`px-2 py-1 text-xs rounded-full ${getStatusStyles(
            status
          )}`}
        >
          {status}
        </span>

        {onDelete && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
}
