'use client';

import { HelpCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Section } from '@/components/ui/section';
import { Pill } from '@/components/ui/pill';
import { Reveal } from '@/components/common/Reveal';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

/**
 * FaqSection — common questions answered with an accordion.
 */
export function FaqSection() {
  const t = useTranslations('LandingPage');
  const faqs = [
    { q: 'faqQ1', a: 'faqA1' },
    { q: 'faqQ2', a: 'faqA2' },
    { q: 'faqQ3', a: 'faqA3' },
    { q: 'faqQ4', a: 'faqA4' },
    { q: 'faqQ5', a: 'faqA5' },
  ] as const;

  return (
    <Section id="faq" tone="pastel" containerClassName="max-w-3xl">
      <Reveal className="mb-10 text-center">
        <Pill variant="navy" className="mb-4">
          <HelpCircle className="h-3.5 w-3.5" />
          {t('faqKicker')}
        </Pill>
        <h2 className="text-heading text-3xl text-navy md:text-4xl">{t('faqTitle')}</h2>
      </Reveal>

      <Reveal delay={0.05}>
        <Accordion className="rounded-3xl border border-border bg-card px-2 py-2 shadow-soft sm:px-4">
          {faqs.map(({ q, a }) => (
            <AccordionItem key={q} value={q} className="px-3 sm:px-4">
              <AccordionTrigger className="py-5 text-base font-bold text-navy transition-colors hover:no-underline hover:text-crimson aria-expanded:text-crimson">
                {t(q)}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                <p className="pb-2">{t(a)}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Reveal>
    </Section>
  );
}
