"use client";
import * as React from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface HeroSliderProps {
  images: string[];
  interval?: number;
}

export function HeroSlider({ images, interval = 6000 }: HeroSliderProps) {
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, interval);
    return () => clearInterval(timer);
  }, [images, interval]);

  return (
    <div className="absolute inset-0 -z-20 overflow-hidden bg-background">
      <AnimatePresence mode="popLayout">
        <motion.div
          key={index}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 0.35, scale: 1.02 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.8, ease: [0.25, 1, 0.5, 1] }}
        >
          <Image
            src={images[index]}
            alt=""
            aria-hidden
            fill
            priority={index === 0}
            sizes="100vw"
            className="object-cover"
          />
        </motion.div>
      </AnimatePresence>

      {/* Theme-Aware Cinematic Overlays */}
      {/* 1. Overall theme mask */}
      <div className="absolute inset-0 bg-background/50 dark:bg-black/45" />
      
      {/* 2. Left-to-right fade for text readability (uses page background color for light mode, dark for dark mode) */}
      <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/60 to-transparent dark:from-black/85 dark:via-black/45 dark:to-transparent" />
      
      {/* 3. Bottom fade to transition back to the main layout background */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />

      {/* Ambient glowing blobs - adjusted colors for themes */}
      <div className="absolute top-1/4 left-1/4 -z-10 size-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 dark:bg-primary/15 blur-[130px] animate-pulse duration-[8000ms]" />
      <div className="absolute bottom-1/3 right-1/4 -z-10 size-[500px] translate-x-1/3 translate-y-1/3 rounded-full bg-accent/10 dark:bg-accent/15 blur-[120px]" />
    </div>
  );
}


