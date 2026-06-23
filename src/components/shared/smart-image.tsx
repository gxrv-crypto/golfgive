"use client";
import * as React from "react";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Image wrapper: Next.js <Image> (optimised + lazy by default) with a loading
 * spinner shown until the image decodes, then a soft fade-in. `alt` is required.
 *
 * The container sets the size (give it an aspect-ratio or height class); the
 * image fills it with object-cover.
 */
export function SmartImage({
  src,
  alt,
  className,
  imageClassName,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  imageClassName?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const [loaded, setLoaded] = React.useState(false);

  return (
    <div className={cn("relative overflow-hidden bg-muted", className)}>
      {!loaded && (
        <span className="absolute inset-0 z-10 grid place-items-center">
          <Loader2 className="size-6 animate-spin text-muted-foreground/50" />
        </span>
      )}
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        // Next.js lazy-loads by default unless `priority` is set.
        onLoad={() => setLoaded(true)}
        className={cn(
          "object-cover transition-opacity duration-500",
          loaded ? "opacity-100" : "opacity-0",
          imageClassName,
        )}
      />
    </div>
  );
}
