'use client';

import React from 'react';
import {
  ChevronDown,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface FilterSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  ariaLabel: string;
  className?: string;
  selectClassName?: string;
}

export function FilterSelect({
  value,
  onChange,
  ariaLabel,
  className,
  selectClassName,
  children,
  ...rest
}: FilterSelectProps) {
  return (
    <div className={cn('relative inline-block', className)}>
      <select
        value={value}
        onChange={onChange}
        aria-label={ariaLabel}
        className={cn(
          'h-8.5 appearance-none rounded-xl border border-input bg-card pl-3 pr-8 text-xs font-semibold text-navy outline-none transition-all duration-150 hover:bg-muted/30 focus:border-navy/40 focus:ring-2 focus:ring-navy/20 cursor-pointer shadow-2xs',
          selectClassName
        )}
        {...rest}
      >
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground"
        aria-hidden="true"
      />
    </div>
  );
}

export interface FilterToggleButtonProps {
  isExpanded: boolean;
  onToggle: () => void;
  hasActiveFilters?: boolean;
  activeCount?: number;
  label?: string;
  className?: string;
}

export function FilterToggleButton({
  isExpanded,
  onToggle,
  hasActiveFilters = false,
  activeCount = 0,
  label = 'Filter',
  className,
}: FilterToggleButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onToggle}
      className={cn(
        'h-8.5 px-3 text-xs font-bold transition-all rounded-xl shadow-2xs border-border/80',
        hasActiveFilters
          ? 'border-navy/40 bg-navy/5 text-navy hover:bg-navy/10'
          : isExpanded
            ? 'bg-muted/60 text-navy border-navy/30'
            : 'bg-card text-muted-foreground hover:text-navy hover:bg-muted/30 hover:border-border',
        className
      )}
    >
      <SlidersHorizontal className="size-3.5 mr-1.5" />
      {label}
      {activeCount > 0 ? (
        <span className="ml-1.5 flex size-4.5 items-center justify-center rounded-full bg-navy text-[0.625rem] font-bold text-white shadow-2xs">
          {activeCount}
        </span>
      ) : null}
    </Button>
  );
}

export interface FilterSearchInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string;
  onChangeValue: (value: string) => void;
  placeholder?: string;
  ariaLabel?: string;
  className?: string;
}

export function FilterSearchInput({
  value,
  onChangeValue,
  placeholder = 'Cari...',
  ariaLabel,
  className,
  ...rest
}: FilterSearchInputProps) {
  return (
    <div className={cn('relative w-full sm:w-64', className)}>
      <Search className="text-muted-foreground/70 pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChangeValue(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel ?? rest['aria-label']}
        className="border-border/80 bg-muted/30 text-foreground placeholder:text-muted-foreground focus-visible:border-navy focus-visible:ring-navy/20 h-8.5 w-full rounded-xl border pl-8 pr-7 text-xs outline-none focus-visible:ring-2 transition-all shadow-2xs"
        {...rest}
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChangeValue('')}
          className="text-muted-foreground hover:text-navy absolute top-1/2 right-2 -translate-y-1/2 p-0.5"
          aria-label="Clear search"
        >
          <X className="size-3.5" />
        </button>
      ) : null}
    </div>
  );
}

export function FilterResetButton({
  onClick,
  label = 'Reset Filter',
  className,
}: {
  onClick: () => void;
  label?: string;
  className?: string;
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => onClick()}
      className={cn(
        'h-8 px-2.5 text-xs font-semibold text-muted-foreground hover:text-navy',
        className
      )}
    >
      <RotateCcw className="size-3 mr-1" />
      {label}
    </Button>
  );
}

export function FilterPanel({
  isExpanded,
  children,
  className,
}: {
  isExpanded: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  if (!isExpanded) return null;
  return (
    <div
      className={cn(
        'border-border/60 bg-muted/20 border-b px-4 py-3 sm:px-5 flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-top-1 duration-150',
        className
      )}
    >
      {children}
    </div>
  );
}

export interface FilterToolbarProps {
  isExpanded: boolean;
  onToggle: () => void;
  hasActiveFilters?: boolean;
  activeCount?: number;
  label?: string;
  onReset?: () => void;
  resetLabel?: string;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function FilterToolbar({
  isExpanded,
  onToggle,
  hasActiveFilters = false,
  activeCount = 0,
  label = 'Filter',
  onReset,
  resetLabel = 'Reset Filter',
  headerRight,
  children,
  className,
}: FilterToolbarProps) {
  return (
    <div
      className={cn(
        'border-border/80 bg-background/60 rounded-2xl border shadow-2xs overflow-hidden transition-all',
        className
      )}
    >
      <div className="flex items-center justify-between px-3.5 py-2.5 sm:px-4 sm:py-3 bg-muted/10 border-b border-border/40">
        <div className="flex items-center gap-2">
          <FilterToggleButton
            isExpanded={isExpanded}
            onToggle={onToggle}
            hasActiveFilters={hasActiveFilters}
            activeCount={activeCount}
            label={label}
          />
          {hasActiveFilters && onReset ? (
            <FilterResetButton onClick={() => onReset()} label={resetLabel} />
          ) : null}
        </div>
        {headerRight ? <div>{headerRight}</div> : null}
      </div>

      <FilterPanel isExpanded={isExpanded} className="border-b-0">
        {children}
      </FilterPanel>
    </div>
  );
}
