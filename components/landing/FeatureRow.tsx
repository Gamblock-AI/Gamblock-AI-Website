'use client';

import Image from 'next/image';
import type { LucideIcon } from 'lucide-react';
import { Reveal } from '@/components/common/Reveal';
import { Pill } from '@/components/ui/pill';
import { cn } from '@/lib/utils';

interface FeatureRowProps {
  icon: LucideIcon;
  kicker: string;
  title: string;
  body: string;
  bullets?: string[];
  image: string;
  imageAlt: string;
  /** When true, image sits on the left (desktop). */
  reversed?: boolean;
}

/**
 * FeatureRow — a single alternating feature block: copy on one side, a framed
 * illustration on the other. Layout flips per `reversed` on desktop.
 */
export function FeatureRow({
  icon: Icon,
  kicker,
  title,
  body,
  bullets,
  image,
  imageAlt,
  reversed = false,
}: FeatureRowProps) {
  return (
    <div className="grid items-center gap-10 md:grid-cols-2 md:gap-16">
      {/* Copy */}
      <Reveal className={cn('order-2', reversed ? 'md:order-2' : 'md:order-1')}>
        <Pill variant="navy" className="mb-4">
          <Icon className="h-3.5 w-3.5" />
          {kicker}
        </Pill>
        <h3 className="text-heading text-2xl text-navy md:text-3xl">{title}</h3>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">{body}</p>
        {bullets && bullets.length > 0 && (
          <ul className="mt-6 space-y-3">
            {bullets.map((b) => (
              <li key={b} className="flex items-start gap-3 text-sm text-navy/80">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-navy" />
                {b}
              </li>
            ))}
          </ul>
        )}
      </Reveal>

      {/* Illustration */}
      <Reveal
        delay={0.1}
        className={cn('order-1', reversed ? 'md:order-1' : 'md:order-2')}
      >
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-card">
          <div className="bg-pastel absolute inset-0" aria-hidden />
          <Image
            src={image}
            alt={imageAlt}
            width={720}
            height={520}
            className="relative h-full w-full object-cover"
          />
        </div>
      </Reveal>
    </div>
  );
}
