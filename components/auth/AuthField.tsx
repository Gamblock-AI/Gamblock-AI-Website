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
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor={inputId} className="text-navy text-sm font-semibold">
            {label}
          </label>
          {labelAdornment}
        </div>
        <div className="group relative">
          <Icon
            className="text-muted-foreground group-focus-within:text-navy absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 transition-colors"
            aria-hidden="true"
          />
          <input
            ref={ref}
            id={inputId}
            type={inputType}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : undefined}
            className={cn(
              'bg-card text-foreground placeholder:text-muted-foreground/50 w-full rounded-xl border py-3.5 pl-10 text-sm transition-all focus:ring-4 focus:outline-none',
              isPassword ? 'pr-11' : 'pr-4',
              error
                ? 'border-crimson focus:border-crimson focus:ring-crimson/10'
                : 'border-input hover:border-navy/40 focus:border-navy focus:ring-navy/10',
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
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
        {error ? (
          <p
            id={errorId}
            role="alert"
            className="text-crimson text-xs font-medium"
          >
            {error}
          </p>
        ) : null}
      </div>
    );
  }
);

export function AuthDivider({ label }: { label: string }) {
  return (
    <div className="my-7 flex items-center gap-4">
      <div className="bg-border h-px flex-1" />
      <span className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
        {label}
      </span>
      <div className="bg-border h-px flex-1" />
    </div>
  );
}

export function GoogleButton({
  label,
  onClick,
}: {
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="border-input bg-card text-foreground hover:border-navy/30 hover:bg-muted/50 flex w-full items-center justify-center gap-2.5 rounded-xl border py-3.5 text-sm font-semibold shadow-sm transition-all active:scale-[0.99]"
    >
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          fill="#4285F4"
        />
        <path
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          fill="#34A853"
        />
        <path
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          fill="#FBBC05"
        />
        <path
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          fill="#EA4335"
        />
      </svg>
      {label}
    </button>
  );
}
