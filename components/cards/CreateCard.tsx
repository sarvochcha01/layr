import { Plus } from "lucide-react";

interface CreateCardProps {
  title: string;
  onClick?: () => void;
}

export function CreateCard({ title, onClick }: CreateCardProps) {
  return (
    <div
      className="p-6 border-2 border-dashed border-muted rounded-lg flex items-center justify-center min-h-[120px] cursor-pointer hover:border-primary/50 hover:bg-accent/50 transition-colors"
      onClick={onClick}
    >
      <div className="text-center text-primary">
        <Plus className="h-8 w-8  mx-auto mb-2" />
        <p className="mb-2">{title}</p>
      </div>
    </div>
  );
}
