'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, House, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ErrorStatusPageProps {
  code: string;
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  homeHref: string;
  homeLabel: string;
  backLabel?: string;
  retryLabel?: string;
  onRetry?: () => void;
}

export function ErrorStatusPage({
  code,
  title,
  description,
  imageSrc,
  imageAlt,
  homeHref,
  homeLabel,
  backLabel,
  retryLabel,
  onRetry,
}: ErrorStatusPageProps) {
  const router = useRouter();

  const goBack = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }
    router.push(homeHref);
  };

  return (
    <main className="text-navy relative isolate min-h-[100dvh] overflow-hidden bg-[#f5f9fd] dark:bg-[#101b30] dark:text-slate-50">
      <div
        className="bg-sky-light/45 dark:bg-sky/10 pointer-events-none absolute -top-48 -right-48 size-[38rem] rounded-full blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-7xl flex-col px-5 py-6 sm:px-8 sm:py-8 lg:px-12">
        <Link
          href={homeHref}
          className="focus-visible:ring-navy/35 dark:focus-visible:ring-sky/40 flex w-fit items-center gap-3 rounded-xl outline-none focus-visible:ring-4"
          aria-label="Gamblock-AI"
        >
          <span className="shadow-soft flex size-10 items-center justify-center overflow-hidden rounded-xl bg-white">
            <Image
              src="/images/logo-mark.png"
              alt=""
              width={34}
              height={30}
              className="h-7 w-8 object-contain"
            />
          </span>
          <span className="text-base font-extrabold tracking-[-0.02em]">
            Gamblock-AI
          </span>
        </Link>

        <div className="grid flex-1 items-center gap-8 py-8 md:grid-cols-[minmax(0,0.9fr)_minmax(22rem,1.1fr)] md:gap-12 lg:gap-20 lg:py-10">
          <section className="order-2 max-w-2xl md:order-1">
            <p
              className="text-navy dark:text-sky-light font-mono text-[clamp(5rem,11vw,9rem)] leading-[0.82] font-bold tracking-[-0.08em]"
              aria-label={`Error ${code}`}
            >
              {code}
            </p>
            <h1 className="mt-8 max-w-xl text-3xl leading-tight font-extrabold tracking-[-0.035em] text-balance sm:text-4xl lg:text-5xl">
              {title}
            </h1>
            <p className="text-muted-foreground mt-4 max-w-xl text-base leading-7 sm:text-lg dark:text-slate-300">
              {description}
            </p>

            <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
              {onRetry && retryLabel ? (
                <button
                  type="button"
                  onClick={onRetry}
                  className="focus-visible:ring-sky bg-navy shadow-soft dark:bg-sky-light dark:text-navy inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-full px-6 text-sm font-bold whitespace-nowrap text-white transition-transform hover:-translate-y-0.5 focus-visible:ring-4 focus-visible:ring-offset-2 focus-visible:outline-none active:translate-y-0"
                >
                  <RefreshCw className="size-4" aria-hidden="true" />
                  {retryLabel}
                </button>
              ) : (
                <Link
                  href={homeHref}
                  className="focus-visible:ring-sky bg-navy shadow-soft dark:bg-sky-light dark:text-navy inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-bold whitespace-nowrap text-white transition-transform hover:-translate-y-0.5 focus-visible:ring-4 focus-visible:ring-offset-2 focus-visible:outline-none active:translate-y-0"
                >
                  <House className="size-4" aria-hidden="true" />
                  {homeLabel}
                </Link>
              )}

              {onRetry ? (
                <Link
                  href={homeHref}
                  className="focus-visible:ring-navy/30 text-navy inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-5 text-sm font-bold whitespace-nowrap transition-colors hover:bg-white/80 focus-visible:ring-4 focus-visible:outline-none dark:text-slate-100 dark:hover:bg-white/10"
                >
                  <House className="size-4" aria-hidden="true" />
                  {homeLabel}
                </Link>
              ) : backLabel ? (
                <button
                  type="button"
                  onClick={goBack}
                  className="focus-visible:ring-navy/30 text-navy inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-full px-5 text-sm font-bold whitespace-nowrap transition-colors hover:bg-white/80 focus-visible:ring-4 focus-visible:outline-none dark:text-slate-100 dark:hover:bg-white/10"
                >
                  <ArrowLeft className="size-4" aria-hidden="true" />
                  {backLabel}
                </button>
              ) : null}
            </div>
          </section>

          <div className="order-1 mx-auto w-full max-w-[24rem] md:order-2 md:max-w-[34rem]">
            <div className="relative aspect-square">
              <Image
                src={imageSrc}
                alt={imageAlt}
                fill
                priority
                sizes="(max-width: 767px) 384px, 544px"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
