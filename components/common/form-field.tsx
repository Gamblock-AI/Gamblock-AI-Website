'use client';

import { forwardRef, type HTMLAttributes, type LabelHTMLAttributes, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

export function RequiredMark({ className }: { className?: string }) {
  return (
    <span
      className={cn('text-destructive ml-1 font-bold', className)}
      aria-hidden="true"
    >
      *
    </span>
  );
}

export function OptionalMark({
  text,
  className,
}: {
  text?: string;
  className?: string;
}) {
  const t = useTranslations('shared');
  return (
    <span
      className={cn(
        'text-muted-foreground ml-1.5 text-xs font-normal',
        className
      )}
    >
      ({text || t('optional')})
    </span>
  );
}

export interface FieldLabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  children: ReactNode;
  required?: boolean;
  optional?: boolean;
  optionalText?: string;
  help?: string;
  helpId?: string;
  adornment?: ReactNode;
  className?: string;
}

export function FieldLabel({
  children,
  required,
  optional,
  optionalText,
  help,
  helpId,
  adornment,
  className,
  ...props
}: FieldLabelProps) {
  return (
    <div className={cn('flex flex-col gap-0.5', className)}>
      <div className="flex items-center justify-between gap-2">
        <label
          className="text-navy flex items-center text-xs font-bold sm:text-sm"
          {...props}
        >
          <span>{children}</span>
          {required ? <RequiredMark /> : null}
          {optional ? <OptionalMark text={optionalText} /> : null}
        </label>
        {adornment ? <div>{adornment}</div> : null}
      </div>
      {help ? (
        <p
          id={helpId}
          className="text-muted-foreground text-xs leading-normal"
        >
          {help}
        </p>
      ) : null}
    </div>
  );
}

export interface FieldErrorProps extends HTMLAttributes<HTMLParagraphElement> {
  message?: string;
  className?: string;
}

export function FieldError({ message, className, id, ...props }: FieldErrorProps) {
  if (!message) return null;
  return (
    <p
      id={id}
      role="alert"
      className={cn(
        'text-destructive flex items-center gap-1 text-xs font-medium leading-normal',
        className
      )}
      {...props}
    >
      <span aria-hidden="true">•</span> {message}
    </p>
  );
}

export interface FormFieldProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export const FormField = forwardRef<HTMLDivElement, FormFieldProps>(
  function FormField({ children, className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn('flex flex-col gap-1.5', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
