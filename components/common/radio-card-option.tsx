import type { ComponentType } from 'react';
import { Check } from 'lucide-react';

interface RadioCardOptionProps<T extends string> {
  name: string;
  value: T;
  selected: boolean;
  label: string;
  icon?: ComponentType<{ className?: string }>;
  onSelect: (value: T) => void;
}

export function RadioCardOption<T extends string>({
  name,
  value,
  selected,
  label,
  icon: Icon,
  onSelect,
}: RadioCardOptionProps<T>) {
  return (
    <label className="block">
      <input
        type="radio"
        name={name}
        value={value}
        checked={selected}
        onChange={() => onSelect(value)}
        className="peer sr-only"
      />
      <span className="border-border bg-card text-foreground peer-checked:border-navy peer-checked:bg-azure/75 peer-focus-visible:ring-ring/40 hover:border-navy/45 hover:bg-azure/35 flex min-h-12 items-center gap-3 rounded-xl border px-3.5 py-2.5 text-sm font-semibold transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2">
        {Icon ? (
          <Icon
            className={`size-4 shrink-0 ${
              selected ? 'text-navy' : 'text-muted-foreground'
            }`}
          />
        ) : null}
        <span className="min-w-0 flex-1 leading-5">{label}</span>
        <span
          aria-hidden="true"
          className={`flex size-5 shrink-0 items-center justify-center rounded-full border ${
            selected
              ? 'border-navy bg-navy text-white'
              : 'border-border bg-card text-transparent'
          }`}
        >
          <Check className="size-3" strokeWidth={3} />
        </span>
      </span>
    </label>
  );
}
