import type { SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

const chevronBackground =
  'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2316294c%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E")';

export function NativeSelect({
  className,
  style,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        'border-input bg-background text-foreground focus-visible:border-navy focus-visible:ring-navy/20 h-11 w-full appearance-none rounded-xl border pr-10 pl-3 text-sm outline-none focus-visible:ring-2',
        className
      )}
      style={{
        backgroundImage: chevronBackground,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 0.75rem center',
        backgroundSize: '1em 1em',
        ...style,
      }}
      {...props}
    />
  );
}
