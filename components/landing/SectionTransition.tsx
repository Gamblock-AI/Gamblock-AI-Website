import { cn } from '@/lib/utils';

type SectionTransitionTone =
  | 'pale-to-team'
  | 'team-to-pale'
  | 'light-to-dark'
  | 'dark-to-pale'
  | 'pale-to-light'
  | 'light-to-team'
  | 'team-to-light';

const TONE_CLASSES: Record<SectionTransitionTone, string> = {
  'pale-to-team': 'from-[#f4faff] to-transparent',
  'team-to-pale': 'from-[#d8edff] to-transparent',
  'light-to-team': 'from-[#f4faff] to-transparent',
  'team-to-light': 'from-[#d8edff] to-transparent',
  'pale-to-light': 'from-[#f4faff] to-transparent',
  'light-to-dark': 'from-[#f4faff] via-[#f4faff]/70 to-[#0b1730]',
  'dark-to-pale': 'from-[#081a39] via-[#081a39]/80 to-transparent',
};

export function SectionTransition({ tone, className }: { tone: SectionTransitionTone; className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-x-0 top-0 z-0 h-28 bg-gradient-to-b', TONE_CLASSES[tone], className)}
    />
  );
}
