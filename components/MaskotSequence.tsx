'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const FRAME_COUNT = 120;
const currentFrame = (index: number) => 
  `/maskot-sequence/frame_${index.toString().padStart(4, '0')}.webp`;

export default function MaskotSequence() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const currentFrameRef = useRef(0);

  // Preload images
  useEffect(() => {
    const loadedImages: HTMLImageElement[] = [];
    let loadedCount = 0;
    
    for (let i = 1; i <= FRAME_COUNT; i++) {
      const img = new window.Image();
      img.src = currentFrame(i);
      img.onload = () => {
        loadedCount++;
        if (loadedCount === FRAME_COUNT) {
          setImages(loadedImages);
          if (canvasRef.current) {
            renderFrame(0, canvasRef.current, loadedImages[0]);
          }
        }
      };
      // Make sure we also handle errors to avoid getting stuck
      img.onerror = () => {
        loadedCount++;
        if (loadedCount === FRAME_COUNT) {
          setImages(loadedImages);
        }
      }
      loadedImages.push(img);
    }
  }, []);

  // Setup GSAP ScrollTrigger
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current || images.length === 0) return;

    // Start Pose 1 on the right (x: 0.8), zoomed in slightly
    const frameObj = { frame: 0, x: 0.8, scale: 1.15 };
    
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.5,
      },
      onUpdate: () => {
        const index = Math.round(frameObj.frame);
        currentFrameRef.current = index;
        if (images[index]) {
          // Pass the current animated x and scale to renderFrame
          renderFrame(index, canvasRef.current!, images[index], undefined, undefined, frameObj.x, frameObj.scale);
        }
      }
    });

    // 0 -> 33% (Transition 1 to 2) Move to Left
    tl.to(frameObj, {
      frame: 30,
      x: 0.2, // Left
      ease: "none",
      duration: 1
    })
    // 33% -> 66% (Transition 2 to 3) Move to Right
    .to(frameObj, {
      frame: 60,
      x: 0.8, // Right
      ease: "none",
      duration: 1
    })
    // 66% -> 100% (Transition 3 to 4) Move to Left
    .to(frameObj, {
      frame: 90, // Stop at 90 (Pose 4)
      x: 0.2, // Left
      ease: "none",
      duration: 1
    });

    return () => {
      tl.kill();
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, [images]);

  // Handle Resize
  useEffect(() => {
    const resizeCanvas = () => {
      if (canvasRef.current && canvasRef.current.parentElement) {
        const canvas = canvasRef.current;
        const rect = canvas.parentElement.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;

        // Set physical size multiplied by DPR
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;

        // Force CSS size to logical size
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Scale all drawing operations by the DPR
          ctx.scale(dpr, dpr);
        }
        
        if (images.length > 0 && images[currentFrameRef.current]) {
          renderFrame(currentFrameRef.current, canvas, images[currentFrameRef.current], rect.width, rect.height);
        }
      }
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas(); // init size

    return () => window.removeEventListener('resize', resizeCanvas);
  }, [images]);

  const renderFrame = (index: number, canvas: HTMLCanvasElement, img: HTMLImageElement, logicalWidth?: number, logicalHeight?: number, xPos: number = 0.5, scaleFactor: number = 1.0) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Ensure high quality image scaling
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // If logical sizes are not passed (e.g. from initial load), calculate them
    const dpr = window.devicePixelRatio || 1;
    const w = logicalWidth || (canvas.width / dpr);
    const h = logicalHeight || (canvas.height / dpr);
    
    ctx.clearRect(0, 0, w, h);
    
    // Contain logic so the mascot is always fully visible
    const hRatio = w / img.width;
    const vRatio = h / img.height;
    const baseRatio = Math.min(hRatio, vRatio);
    const ratio = baseRatio * scaleFactor;
    
    // xPos = 0.5 means center. 0 = left edge, 1 = right edge.
    const emptySpaceX = w - (img.width * ratio);
    const centerShift_x = emptySpaceX * xPos;
    const centerShift_y = (h - img.height * ratio) / 2;
    
    ctx.drawImage(img, 0, 0, img.width, img.height,
                  centerShift_x, centerShift_y, img.width * ratio, img.height * ratio);
  };

  return (
    <div ref={containerRef} className="absolute inset-0 z-0 h-full w-full pointer-events-none">
       <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
         {images.length < FRAME_COUNT && (
           <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-white/50 z-10 backdrop-blur-sm">
             <div className="animate-pulse">Memuat Aset Animasi...</div>
           </div>
         )}
         <canvas ref={canvasRef} className="w-full h-full object-contain" />
       </div>
    </div>
  );
}
