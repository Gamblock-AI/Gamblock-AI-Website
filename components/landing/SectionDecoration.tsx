import { cn } from '@/lib/utils';

type SectionDecorationProps = {
  className?: string;
  size?: 'sm' | 'md';
  tone?: 'pink' | 'sky' | 'navy' | 'white';
};

const SIZE_CLASSES = {
  sm: 'size-24 rounded-[1.8rem] border-[0.65rem]',
  md: 'size-32 rounded-[2.25rem] border-[0.8rem]',
} as const;

const TONE_CLASSES = {
  pink: 'border-[#c8102e]/15',
  sky: 'border-sky/20',
  navy: 'border-navy/10',
  white: 'border-white/20',
} as const;

export function SectionDecoration({ className, size = 'sm', tone = 'pink' }: SectionDecorationProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute z-0 rotate-12 opacity-80',
        SIZE_CLASSES[size],
        TONE_CLASSES[tone],
        className,
      )}
    />
  );
}
