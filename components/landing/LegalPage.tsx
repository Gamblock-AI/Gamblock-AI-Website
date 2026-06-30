import { MarketingNav } from '@/components/landing/MarketingNav';
import { FixedBackground } from '@/components/landing/FixedBackground';
import { SiteFooter } from '@/components/landing/SiteFooter';

interface LegalSection {
  heading: string;
  body: string[];
}

interface LegalPageProps {
  title: string;
  updatedLabel: string;
  intro: string;
  sections: LegalSection[];
}

/**
 * LegalPage — landing-style chrome (minimal nav + footer) wrapping a readable
 * long-form legal document (Terms, Privacy, etc.).
 */
export function LegalPage({ title, updatedLabel, intro, sections }: LegalPageProps) {
  return (
    <div className="relative text-foreground">
      <FixedBackground />
      <MarketingNav minimal />

      <main className="px-6 pt-32 pb-20 md:px-10 md:pt-40">
        <article className="mx-auto max-w-3xl">
          <header className="mb-10 border-b border-border pb-8">
            <h1 className="text-display text-3xl text-navy md:text-5xl">{title}</h1>
            <p className="text-label mt-4 text-navy/40">{updatedLabel}</p>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">{intro}</p>
          </header>

          <div className="space-y-10">
            {sections.map((s, i) => (
              <section key={s.heading}>
                <h2 className="text-heading text-xl text-navy md:text-2xl">
                  <span className="mr-2 text-crimson">{i + 1}.</span>
                  {s.heading}
                </h2>
                <div className="mt-3 space-y-3">
                  {s.body.map((p, j) => (
                    <p key={j} className="text-base leading-relaxed text-muted-foreground">
                      {p}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </article>
      </main>

      <SiteFooter />
    </div>
  );
}
