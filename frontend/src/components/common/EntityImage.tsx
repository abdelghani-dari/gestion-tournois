import { clsx } from "clsx";
import { useState } from "react";
import { STORAGE_BASE } from "../../api";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "?";
}

type EntityImageProps = {
  src?: string | null;
  name: string;
  alt?: string;
  className?: string;
  imageClassName?: string;
};

export default function EntityImage({ src, name, alt, className, imageClassName }: EntityImageProps) {
  const imageSrc = src
    ? /^(https?:|blob:|data:)/i.test(src)
      ? src
      : `${STORAGE_BASE}/${src.replace(/^\/+/, "")}`
    : undefined;
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const canShowImage = Boolean(imageSrc) && failedSrc !== imageSrc;

  return (
    <div className={clsx("relative overflow-hidden border border-white/10 bg-brand-500/15 text-brand-200", className)}>
      <div className="flex h-full w-full items-center justify-center text-sm font-semibold uppercase" aria-hidden={canShowImage}>
        {initials(name)}
      </div>
      {canShowImage && (
        <img
          key={imageSrc}
          src={imageSrc}
          alt={alt ?? name}
          className={clsx("absolute inset-0 h-full w-full object-cover", imageClassName)}
          onError={() => setFailedSrc(imageSrc ?? null)}
        />
      )}
    </div>
  );
}
