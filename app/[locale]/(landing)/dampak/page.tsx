import type { Metadata } from 'next';
import { DampakContent } from './DampakContent';

export const metadata: Metadata = {
  title: 'Dampak · Gamblock AI',
  description:
    'Indonesia menghadapi darurat judi online: Rp286 triliun perputaran dana, 12,3 juta depositor. Gamblock AI memutus siklus kecanduan dengan intervensi yang terukur.',
};

export default function DampakPage() {
  return <DampakContent />;
}
