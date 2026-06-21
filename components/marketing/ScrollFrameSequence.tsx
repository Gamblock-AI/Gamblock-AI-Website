'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useTranslations } from "next-intl";

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface ScrollFrameSequenceProps {
  /** Total number of image frames available. */
  frameCount: number;
  /** Build the public URL for a given 1-based frame index. */
  getFrameSrc: (index: number) => string;
  /** Horizontal anchor for the contained image: 0 = left, 1 = right. */
  alignX?: number;
  /** Extra className on the outer (height-defining) wrapper. */
  className?: string;
  /** Sticky container background. */
  backgroundClassName?: string;
}

/**
 * ScrollFrameSequence - pinned, scroll-bound image-sequence canvas.
 *
 * Preloads every frame once, then drives a `requestAnimationFrame` render loop
 * whose current frame is bound to a GSAP ScrollTrigger scrub timeline. No React
 * re-renders happen during scrub, so playback stays smooth even at 120 frames.
 *
 * Honours `prefers-reduced-motion` by rendering the first frame statically.
 */
export function ScrollFrameSequence({
  frameCount,
  getFrameSrc,
  alignX = 0.5,
  className = 'h-[300dvh]',
  backgroundClassName = 'bg-black',
}: ScrollFrameSequenceProps) {
    const t = useTranslations('ScrollFrameSequence');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const frameObj = useRef({ frame: 0, x: alignX });
  const rafId = useRef<number | null>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const [ready, setReady] = useState(false);

  // Preload all frames.
  useEffect(() => {
    let active = true;
    const loaded: HTMLImageElement[] = [];
    let count = 0;
    for (let i = 1; i <= frameCount; i++) {
      const img = new window.Image();
      img.src = getFrameSrc(i);
      const tick = () => {
        count++;
        if (count === frameCount && active) {
          imagesRef.current = loaded;
          setReady(true);
          drawFrame(0);
        }
      };
      img.onload = tick;
      img.onerror = tick;
      loaded.push(img);
    }
    return () => {
      active = false;
    };
  }, [frameCount, getFrameSrc]);

  const drawFrame = (index: number) => {
    const canvas = canvasRef.current;
    const img = imagesRef.current[index];
    if (!canvas || !img || !img.width) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;

    ctx.clearRect(0, 0, w, h);

    const baseRatio = Math.min(w / img.width, h / img.height);
    const ratio = baseRatio;
    const emptySpaceX = w - img.width * ratio;
    const offsetX = emptySpaceX * frameObj.current.x;
    const offsetY = (h - img.height * ratio) / 2;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, offsetX, offsetY, img.width * ratio, img.height * ratio);
  };

  // Size canvas to its sticky viewport.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      drawFrame(Math.round(frameObj.current.frame));
    };

    resize();
    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);
    return () => ro.disconnect();
  }, [ready]);

  // Scrub timeline bound to scroll.
  useEffect(() => {
    if (!ready) return;
    const container = containerRef.current;
    if (!container) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const tickRender = () => {
      rafId.current = requestAnimationFrame(tickRender);
      drawFrame(Math.round(frameObj.current.frame));
    };
    rafId.current = requestAnimationFrame(tickRender);

    if (reduce) {
      frameObj.current = { frame: 0, x: alignX };
      return () => {
        if (rafId.current) cancelAnimationFrame(rafId.current);
      };
    }

    const ctx = gsap.context(() => {
      gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.5,
        },
      }).to(frameObj.current, {
        frame: frameCount - 1,
        x: alignX,
        ease: 'none',
        duration: 1,
      });
    }, container);

    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      ctx.revert();
    };
  }, [ready, frameCount, alignX]);

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <div
        className={`sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden ${backgroundClassName}`}
      >
        {ready ? null : (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/80 text-white/50 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-crimson" />
              <div className="text-xs font-bold tracking-widest text-white/60 uppercase">
                {t('text_322')}</div>
            </div>
          </div>
        )}
        <canvas ref={canvasRef} className="h-full w-full object-contain" />
      </div>
    </div>
  );
}
