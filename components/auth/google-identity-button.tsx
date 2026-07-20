'use client';

import { useLocale } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { config } from '@/lib/config';
import { reportDevelopmentError } from '@/lib/diagnostics';

interface GoogleCredentialResponse {
  credential: string;
}

interface GoogleIdentityAPI {
  initialize(options: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
  }): void;
  renderButton(
    parent: HTMLElement,
    options: {
      type: 'standard';
      theme: 'outline';
      size: 'large';
      text: 'continue_with';
      shape: 'pill' | 'rectangular';
      width: number;
      locale: string;
    }
  ): void;
}

declare global {
  interface Window {
    google?: { accounts: { id: GoogleIdentityAPI } };
  }
}

const SCRIPT_ID = 'google-identity-services';

export function GoogleIdentityButton({
  onCredential,
  unavailableLabel,
}: {
  onCredential: (credential: string) => Promise<void> | void;
  unavailableLabel: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const callbackRef = useRef(onCredential);
  const initializedClientIdRef = useRef<string | null>(null);
  const [scriptFailed, setScriptFailed] = useState(false);
  const locale = useLocale();

  useEffect(() => {
    callbackRef.current = onCredential;
  }, [onCredential]);

  useEffect(() => {
    const clientID = config.googleClientId;
    // Google sign-in is optional. An absent client ID is a normal disabled
    // state represented by the user-facing placeholder below, not an error.
    if (!clientID) return;

    const render = () => {
      if (!window.google || !containerRef.current) return;
      containerRef.current.replaceChildren();
      if (initializedClientIdRef.current !== clientID) {
        window.google.accounts.id.initialize({
          client_id: clientID,
          callback: (response) => {
            if (response.credential) {
              void callbackRef.current(response.credential);
            }
          },
        });
        initializedClientIdRef.current = clientID;
      }
      const measuredWidth = Math.floor(
        containerRef.current.getBoundingClientRect().width
      );
      const targetWidth = Math.max(
        200,
        Math.min(measuredWidth > 0 ? measuredWidth : 320, 400)
      );

      window.google.accounts.id.renderButton(containerRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        shape: 'pill',
        width: targetWidth,
        locale,
      });
    };

    const scriptElement = document.getElementById(
      SCRIPT_ID
    ) as HTMLScriptElement | null;
    const handleScriptError = () => {
      setScriptFailed(true);
      reportDevelopmentError(
        'Google Identity Services failed to load',
        new Error('The Google Identity Services script could not be loaded.')
      );
    };

    if (window.google) {
      render();
    } else {
      const script = scriptElement ?? document.createElement('script');
      script.id = SCRIPT_ID;
      script.src = `https://accounts.google.com/gsi/client?hl=${locale}`;
      script.async = true;
      script.defer = true;
      script.addEventListener('load', render);
      script.addEventListener('error', handleScriptError);
      if (!scriptElement) document.head.appendChild(script);
    }

    let resizeObserver: ResizeObserver | null = null;
    if (containerRef.current && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        if (window.google && containerRef.current) {
          render();
        }
      });
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      const activeScript = document.getElementById(
        SCRIPT_ID
      ) as HTMLScriptElement | null;
      if (activeScript) {
        activeScript.removeEventListener('load', render);
        activeScript.removeEventListener('error', handleScriptError);
      }
    };
  }, [locale]);

  if (!config.googleClientId || scriptFailed) {
    return (
      <div className="border-border bg-muted/25 text-muted-foreground mx-auto w-full max-w-[400px] rounded-full border border-dashed px-4 py-3 text-center text-xs leading-5 font-medium">
        {unavailableLabel}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="mx-auto flex min-h-11 w-full max-w-[400px] justify-center [&_*]:!max-w-full [&_iframe]:!max-w-full [&_iframe]:!w-full"
    />
  );
}
