import { cn } from "@/lib/utils";
import { buildComponentStyle } from "@/lib/buildStyle";

interface VideoProps {
  src?: string;
  youtubeId?: string;
  vimeoId?: string;
  poster?: string;
  width?: string;
  height?: string;
  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
  className?: string;
  aspectRatio?: "16:9" | "4:3" | "1:1" | "21:9";
  backgroundColor?: string;
  textColor?: string;
  [key: string]: any;
}

export function Video({
  src,
  youtubeId,
  vimeoId,
  poster,
  width,
  height,
  autoplay = false,
  muted = false,
  loop = false,
  controls = true,
  className,
  aspectRatio = "16:9",
  backgroundColor,
  textColor,
  ...rest
}: VideoProps) {
  const aspectRatioClasses = {
    "16:9": "aspect-video",
    "4:3": "aspect-[4/3]",
    "1:1": "aspect-square",
    "21:9": "aspect-[21/9]",
  };

  const baseStyle = buildComponentStyle({ width, height, ...rest });

  // YouTube / Vimeo URL Parsers
  const extractYoutubeId = (urlOrId?: string) => {
    if (!urlOrId || urlOrId.trim() === "") return null;
    const trimmed = urlOrId.trim();
    // If it's just an alphanumeric string (11 chars typical for YT), assume it's already an ID
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
    
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = trimmed.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const extractVimeoId = (urlOrId?: string) => {
    if (!urlOrId || urlOrId.trim() === "") return null;
    const trimmed = urlOrId.trim();
    if (/^[0-9]+$/.test(trimmed)) return trimmed;
    
    const regExp = /(?:www\.|player\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)(?:[a-zA-Z0-9_\-]+)?/i;
    const match = trimmed.match(regExp);
    return match ? match[1] : null;
  };

  const activeYoutubeId = extractYoutubeId(youtubeId) || extractYoutubeId(src);
  const activeVimeoId = extractVimeoId(vimeoId) || extractVimeoId(src);

  // YouTube embed
  if (activeYoutubeId) {
    const youtubeParams = new URLSearchParams({
      autoplay: autoplay ? "1" : "0",
      mute: muted ? "1" : "0",
      loop: loop ? "1" : "0",
      controls: controls ? "1" : "0",
    });

    return (
      <div
        className={cn("w-full", aspectRatioClasses[aspectRatio], className)}
        style={baseStyle}
      >
        <iframe
          src={`https://www.youtube.com/embed/${activeYoutubeId}?${youtubeParams}`}
          title="YouTube video"
          className="w-full h-full rounded-lg"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  // Vimeo embed
  if (activeVimeoId) {
    const vimeoParams = new URLSearchParams({
      autoplay: autoplay ? "1" : "0",
      muted: muted ? "1" : "0",
      loop: loop ? "1" : "0",
    });

    return (
      <div
        className={cn("w-full", aspectRatioClasses[aspectRatio], className)}
        style={baseStyle}
      >
        <iframe
          src={`https://player.vimeo.com/video/${activeVimeoId}?${vimeoParams}`}
          title="Vimeo video"
          className="w-full h-full rounded-lg"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  // Regular video (direct video file URL)
  if (src && src.trim() !== "" && !activeYoutubeId && !activeVimeoId) {
    return (
      <div
        className={cn("w-full", aspectRatioClasses[aspectRatio], className)}
        style={baseStyle}
      >
        <video
          src={src}
          poster={poster}
          autoPlay={autoplay}
          muted={muted}
          loop={loop}
          controls={controls}
          className="w-full h-full rounded-lg object-cover"
        />
      </div>
    );
  }

  // Placeholder when no video source is provided
  const placeholderStyle = buildComponentStyle({ backgroundColor, textColor, width, height, ...rest });

  return (
    <div
      className={cn(
        "w-full rounded-lg flex items-center justify-center",
        !backgroundColor && "bg-gray-200",
        aspectRatioClasses[aspectRatio],
        className
      )}
      style={placeholderStyle}
    >
      <p className={cn(!textColor && "opacity-50")}>
        No video source provided
      </p>
    </div>
  );
}
