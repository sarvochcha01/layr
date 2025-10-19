import { cn } from "@/lib/utils";

interface VideoProps {
  src?: string;
  youtubeId?: string;
  vimeoId?: string;
  poster?: string;
  width?: number;
  height?: number;
  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
  className?: string;
  aspectRatio?: "16:9" | "4:3" | "1:1" | "21:9";
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
}: VideoProps) {
  const aspectRatioClasses = {
    "16:9": "aspect-video",
    "4:3": "aspect-[4/3]",
    "1:1": "aspect-square",
    "21:9": "aspect-[21/9]",
  };

  // YouTube embed
  if (youtubeId) {
    const youtubeParams = new URLSearchParams({
      autoplay: autoplay ? "1" : "0",
      mute: muted ? "1" : "0",
      loop: loop ? "1" : "0",
      controls: controls ? "1" : "0",
    });

    return (
      <div className={cn("w-full", aspectRatioClasses[aspectRatio], className)}>
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
      <div className={cn("w-full", aspectRatioClasses[aspectRatio], className)}>
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
        width={width}
        height={height}
        autoPlay={autoplay}
        muted={muted}
        loop={loop}
        controls={controls}
        className={cn(
          "w-full h-auto rounded-lg",
          !width && !height && aspectRatioClasses[aspectRatio],
          className
        )}
        style={{
          width: width ? `${width}px` : undefined,
          height: height ? `${height}px` : undefined,
        }}
      />
    );
  }

  return (
    <div
      className={cn(
        "w-full bg-gray-200 rounded-lg flex items-center justify-center",
        aspectRatioClasses[aspectRatio],
        className
      )}
    >
      <p className="text-gray-500">No video source provided</p>
    </div>
  );
}
