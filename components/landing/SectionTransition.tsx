import { cn } from '@/lib/utils';

type SectionTransitionTone =
  | 'light-to-dark'
  | 'dark-to-pale'
  | 'pale-to-light'
  | 'light-to-team'
  | 'team-to-light'
  | 'team-to-pale';

const TONE_CLASSES: Record<SectionTransitionTone, string> = {
  'light-to-dark': 'from-white via-white/70 to-[#0b1730]',
  'dark-to-pale': 'from-[#0b1730] via-[#132c52] to-[#f4faff]',
  'pale-to-light': 'from-[#f4faff] via-[#f4faff]/75 to-white',
  'light-to-team': 'from-white via-[#e8f5ff]/75 to-[#e8f5ff]',
  'team-to-light': 'from-[#e8f5ff] via-[#e8f5ff]/75 to-white',
  'team-to-pale': 'from-[#e8f5ff] via-[#e5f4ff]/80 to-[#f4faff]',
};

export function SectionTransition({ tone, className }: { tone: SectionTransitionTone; className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-x-0 top-0 z-0 h-20 bg-gradient-to-b', TONE_CLASSES[tone], className)}
    />
  );
}
