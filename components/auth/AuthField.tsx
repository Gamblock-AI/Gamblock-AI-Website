'use client';

import {
  forwardRef,
  useId,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
import { Eye, EyeOff, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

interface AuthFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon: LucideIcon;
  error?: string;
  /** Optional element rendered to the right of the label (e.g. forgot link). */
  labelAdornment?: ReactNode;
}

/**
 * AuthField — labelled input with a leading icon and inline error, styled to
 * match the auth screens. Forwards the ref so react-hook-form `register` works.
 * When `type="password"`, a show/hide toggle is rendered automatically.
 */
export const AuthField = forwardRef<HTMLInputElement, AuthFieldProps>(
  function AuthField(
    { label, icon: Icon, error, labelAdornment, className, type, ...props },
    ref
  ) {
    const isPassword = type === 'password';
    const [show, setShow] = useState(false);
    const generatedId = useId();
    const inputId = props.id ?? generatedId;
    const errorId = `${inputId}-error`;
    const t = useTranslations('authShell');
    const inputType = isPassword ? (show ? 'text' : 'password') : type;

    return (
      <div className="grid grid-cols-2 gap-y-2">
        <label htmlFor={inputId} className="text-navy text-sm font-semibold">
          {label}
        </label>
        <div className="group relative col-span-2">
          <Icon
            className="text-muted-foreground group-focus-within:text-navy absolute top-1/2 left-3.5 size-4 -translate-y-1/2 transition-colors"
            aria-hidden="true"
          />
          <input
            ref={ref}
            id={inputId}
            type={inputType}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : undefined}
            className={cn(
              'bg-card text-foreground placeholder:text-muted-foreground/50 w-full rounded-xl border py-3.5 pl-10 text-sm transition-all focus-visible:ring-4 focus-visible:outline-none',
              isPassword ? 'pr-11' : 'pr-4',
              error
                ? 'border-crimson focus-visible:border-crimson focus-visible:ring-crimson/10'
                : 'border-input hover:border-navy/40 focus-visible:border-navy focus-visible:ring-navy/10',
              className
            )}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              aria-label={show ? t('hidePassword') : t('showPassword')}
              aria-pressed={show}
              className="text-muted-foreground hover:bg-muted hover:text-navy absolute top-1/2 right-0.5 flex size-11 -translate-y-1/2 items-center justify-center rounded-lg transition-colors"
            >
              {show ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          )}
        </div>
        {labelAdornment ? (
          <div className="row-start-1 col-start-2 justify-self-end self-center">
            {labelAdornment}
          </div>
        ) : null}
        {error ? (
          <p
            id={errorId}
            role="alert"
            className="text-crimson col-span-2 text-xs font-medium"
          >
            {error}
          </p>
        ) : null}
      </div>
    );
  }
);

