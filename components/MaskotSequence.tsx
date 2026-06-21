'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useTranslations } from "next-intl";

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const FRAME_COUNT = 120;
const currentFrame = (index: number) =>
  `/maskot-sequence/frame_${index.toString().padStart(4, '0')}.webp`;

/**
 * MaskotSequence — pinned scroll-bound frame animation.
 * Preloads every frame once, then renders via requestAnimationFrame on scroll updates
 * (no React re-renders during scrub).
 */
export default function MaskotSequence() {
    const t = useTranslations('MaskotSequence');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const frameObj = useRef({ frame: 0, x: 0.8, scale: 1.0 });
  const rafId = useRef<number | null>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const [progress, setProgress] = useState(0);

  // Preload
  useEffect(() => {
    const loaded: HTMLImageElement[] = [];
    let count = 0;
    for (let i = 1; i <= FRAME_COUNT; i++) {
      const img = new window.Image();
      img.src = currentFrame(i);
      const tick = () => {
        count++;
        if (count === FRAME_COUNT) {
          imagesRef.current = loaded;
          setProgress(1);
          drawFrame(0);
        }
      };
      img.onload = tick;
      img.onerror = tick;
      loaded.push(img);
    }
  }, []);

  const drawFrame = (index: number) => {
    const canvas = canvasRef.current;
    const img = imagesRef.current[index];
    if (!canvas || !img) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;

    ctx.clearRect(0, 0, w, h);

    // Contain with custom x-offset and scale
    const baseRatio = Math.min(w / img.width, h / img.height);
    const ratio = baseRatio * frameObj.current.scale;
    const emptySpaceX = w - img.width * ratio;
    const offsetX = emptySpaceX * frameObj.current.x;
    const offsetY = (h - img.height * ratio) / 2;

    // Honour device pixel ratio crisply
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, offsetX, offsetY, img.width * ratio, img.height * ratio);
  };

  // Resize observer
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
  }, [progress]);

  // ScrollTrigger scrub timeline
  useEffect(() => {
    if (progress < 1) return;
    const container = containerRef.current;
    if (!container) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const tickRender = () => {
      rafId.current = requestAnimationFrame(tickRender);
      drawFrame(Math.round(frameObj.current.frame));
    };
    rafId.current = requestAnimationFrame(tickRender);

    if (reduce) {
      // Static: pose 1 only
      frameObj.current = { frame: 0, x: 0.8, scale: 1.0 };
      return () => {
        if (rafId.current) cancelAnimationFrame(rafId.current);
      };
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.5,
        },
        onUpdate: () => {
          // requestAnimationFrame already drives drawFrame
        },
      });

      tl.to(frameObj.current, { frame: 30, x: 0.8, ease: 'none', duration: 1 })
        .to(frameObj.current, { frame: 60, x: 0.8, ease: 'none', duration: 1 })
        .to(frameObj.current, { frame: 90, x: 0.8, ease: 'none', duration: 1 });
    }, container);

    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      ctx.revert();
    };
  }, [progress]);

  return (
    <div ref={containerRef} className="absolute inset-0 z-0 h-full w-full pointer-events-none">
      <div className="sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden">
        {progress < 1 && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/80 text-white/50 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-crimson" />
              <div className="text-xs font-bold tracking-widest text-white/60 uppercase">
                {t('text_311')}</div>
            </div>
          </div>
        )}
        <canvas ref={canvasRef} className="h-full w-full object-contain" />
      </div>
    </div>
  );
}
