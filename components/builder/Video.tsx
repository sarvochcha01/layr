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

  // YouTube embed
  if (youtubeId) {
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
          src={`https://www.youtube.com/embed/${youtubeId}?${youtubeParams}`}
          title="YouTube video"
          className="w-full h-full rounded-lg"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  // Vimeo embed
  if (vimeoId) {
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
          src={`https://player.vimeo.com/video/${vimeoId}?${vimeoParams}`}
          title="Vimeo video"
          className="w-full h-full rounded-lg"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  // Regular video
  if (src) {
    return (
      <video
        src={src}
        poster={poster}
        autoPlay={autoplay}
        muted={muted}
        loop={loop}
        controls={controls}
        className={cn(
          "w-full h-auto rounded-lg",
          !width && !height && aspectRatioClasses[aspectRatio],
          className
        )}
        style={baseStyle}
      />
    );
  }

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
