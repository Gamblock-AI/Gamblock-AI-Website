'use client';

import React from 'react';
import { Shield } from 'lucide-react';
import { useTranslations } from "next-intl";

interface SensitivitySelectorProps {
  sensitivity: string;
  setSensitivity: (val: string) => void;
}

export function SensitivitySelector({
  sensitivity,
  setSensitivity,
}: SensitivitySelectorProps) {
    const t = useTranslations('SensitivitySelector');
  return (
    <div className="space-y-3 rounded-lg border border-slate-100 bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.01)]">
      <div className="flex items-center gap-3.5 border-b border-slate-50 pb-3">
        <Shield className="text-navy size-5" />
        <h3 className="text-navy text-base font-black tracking-wider uppercase">
          {t('text_209')}</h3>
      </div>

      <div className="space-y-3">
        <div className="space-y-1">
          <label className="text-xs font-bold tracking-wider text-slate-500 uppercase">
            {t('text_210')}</label>
          <p className="text-[11px] text-slate-400">
            {t('text_211')}</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {['Rendah', 'Sedang', 'Tinggi'].map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setSensitivity(opt)}
              className={`cursor-pointer rounded-xl border py-2.5 text-xs font-bold transition-all ${
                sensitivity === opt
                  ? 'bg-navy/5 border-navy text-navy'
                  : 'border-transparent bg-slate-50/50 text-slate-500 hover:bg-slate-100/50'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
        <p className="text-[10px] leading-relaxed text-slate-400 italic">
          {t('text_212')}</p>
      </div>
    </div>
  );
}
