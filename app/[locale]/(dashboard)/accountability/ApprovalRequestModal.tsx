'use client';

import { X, Lock } from 'lucide-react';
import React from 'react';
import { useTranslations } from "next-intl";

interface ApprovalRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  reason: string;
  setReason: (val: string) => void;
  loading: boolean;
}

export function ApprovalRequestModal({
  isOpen,
  onClose,
  onSubmit,
  reason,
  setReason,
  loading,
}: ApprovalRequestModalProps) {
    const t = useTranslations('ApprovalRequestModal');
  if (!isOpen) return null;

  return (
    <div className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="text-navy relative w-full max-w-md space-y-3 rounded-2xl bg-card p-4 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-muted-foreground"
        >
          <X className="size-4" />
        </button>

        <div className="space-y-3 text-center md:text-left">
          <div className="mx-auto flex size-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 md:mx-0">
            <Lock className="size-6" />
          </div>
          <h3 className="text-navy pt-2 text-sm font-semibold tracking-tight">
            {t('text_54')}</h3>
          <p className="text-xs leading-relaxed font-semibold text-muted-foreground">
            {t('text_55')}</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
              {t('text_56')}</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t('text_57')}
              rows={3}
              className="focus:ring-navy w-full rounded-xl border border-border bg-card p-4 text-xs leading-relaxed font-semibold text-navy placeholder:text-muted-foreground/50 shadow-sm transition-all focus:border-transparent focus:ring-2 focus:outline-none"
              required
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 cursor-pointer rounded-xl border border-border py-2.5 text-center text-xs font-bold text-muted-foreground transition-all hover:bg-muted/50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-navy hover:bg-navy/90 flex-1 cursor-pointer rounded-xl py-2.5 text-center text-xs font-bold text-white shadow-soft transition-all disabled:opacity-50"
            >
              {loading ? t('sending') : t('submitRequest')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
