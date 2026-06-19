import { clsx } from "clsx";
import { useEffect, useState } from "react";

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
  const [failed, setFailed] = useState(false);
  const canShowImage = Boolean(src) && !failed;

  useEffect(() => {
    setFailed(false);
  }, [src]);

  return (
    <div className={clsx("relative overflow-hidden border border-white/10 bg-brand-500/15 text-brand-200", className)}>
      <div className="flex h-full w-full items-center justify-center text-sm font-semibold uppercase" aria-hidden={canShowImage}>
        {initials(name)}
      </div>
      {canShowImage && (
        <img
          src={src ?? undefined}
          alt={alt ?? name}
          className={clsx("absolute inset-0 h-full w-full object-cover", imageClassName)}
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
