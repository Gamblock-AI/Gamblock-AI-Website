import type { Metadata } from 'next';
import { TechnologyContent } from './TechnologyContent';

export const metadata: Metadata = {
  title: 'Teknologi — Gamblock AI',
  description:
    'Hybrid Analysis + On-Device AI: deteksi situs judi berkamuflase lewat analisis DOM, rule-based dan logistic regression — 100% lokal di perangkat Anda.',
};

export default function TechnologyPage() {
  return <TechnologyContent />;
}
