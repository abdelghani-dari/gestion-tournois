import { clsx } from "clsx";
import { useEffect, useState } from "react";
import { STORAGE_BASE } from "../../api";

type MediaImageProps = {
  src?: string | null;
  fallback: string;
  alt?: string;
  className?: string;
  title?: string;
};

export default function MediaImage({ src, fallback, alt = "", className, title }: MediaImageProps) {
  const resolveUrl = (path?: string | null) => {
    const trimmed = path?.trim();
    if (!trimmed) return fallback;

    return /^(https?:|blob:|data:)/i.test(trimmed)
      ? trimmed
      : `${STORAGE_BASE}/${trimmed.replace(/^\/+/, "")}`;
  };

  const [current, setCurrent] = useState(() => resolveUrl(src));

  useEffect(() => {
    setCurrent(resolveUrl(src));
  }, [src, fallback]);

  return (
    <img
      src={current}
      alt={alt}
      title={title}
      className={clsx(className)}
      onError={() => setCurrent(fallback)}
    />
  );
}
