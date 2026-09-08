'use client';

import { useTranslations } from 'next-intl';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const FAQS = [
  { q: 'faqQ1', a: 'faqA1' },
  { q: 'faqQ2', a: 'faqA2' },
  { q: 'faqQ3', a: 'faqA3' },
  { q: 'faqQ4', a: 'faqA4' },
  { q: 'faqQ5', a: 'faqA5' },
] as const;

export function FaqSection() {
  const t = useTranslations('LandingPage');
  return (
    <section id="faq" className="relative overflow-hidden bg-white px-4 py-24 sm:px-6 md:px-10 md:py-32">
      <div className="pointer-events-none absolute -left-28 bottom-0 size-[28rem] rounded-full bg-sky/20" aria-hidden="true" />
      <div className="relative mx-auto grid max-w-[72rem] gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
        <div>
          <p className="text-label text-[#c8102e]">09 / {t('faqKicker')}</p>
          <h2 className="marketing-display mt-4 text-4xl text-navy md:text-6xl">{t('faqTitle')}</h2>
          <p className="mt-6 text-base leading-7 text-navy/65">{t('trustLabel')}</p>
        </div>
        <Accordion className="rounded-[2rem] bg-[#f4faff] p-2 shadow-[0_18px_45px_rgba(20,52,100,0.12)] sm:p-4">
          {FAQS.map(({ q, a }, index) => (
            <AccordionItem key={q} value={q} className="border-navy/10 px-3 sm:px-4">
              <AccordionTrigger className="gap-4 py-5 text-left text-base font-extrabold text-navy hover:no-underline hover:text-[#c8102e] aria-expanded:text-[#c8102e]">
                <span className="mr-1 text-xs font-black text-[#c8102e]">0{index + 1}</span>{t(q)}
              </AccordionTrigger>
              <AccordionContent className="pb-5 pl-6 text-sm leading-6 text-navy/65 sm:pl-7">{t(a)}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
