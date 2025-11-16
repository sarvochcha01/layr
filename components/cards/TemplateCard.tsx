import { Button } from "@/components/ui/button";
import Image from "next/image";

interface TemplateCardProps {
  name: string;
  description: string;
  category: string;
  previewColor: string;
  thumbnail?: string;
  onUse?: () => void;
}

export function TemplateCard({
  name,
  description,
  category,
  previewColor,
  thumbnail,
  onUse,
}: TemplateCardProps) {
  return (
    <div className="border rounded-lg overflow-hidden bg-card hover:shadow-md transition-shadow">
      <div className={`h-40 relative ${previewColor}`}>
        {thumbnail ? (
          <Image src={thumbnail} alt={name} fill className="object-cover" />
        ) : null}
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="font-semibold">{name}</h3>
          <span className="px-2 py-1 text-xs bg-muted text-muted-foreground rounded">
            {category}
          </span>
        </div>
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
        <Button className="w-full" onClick={onUse}>
          Use Template
        </Button>
      </div>
    </div>
  );
}
