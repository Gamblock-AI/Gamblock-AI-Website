'use client';

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
      shape: 'rectangular';
      width: number;
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
  const [scriptFailed, setScriptFailed] = useState(false);

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
      window.google.accounts.id.initialize({
        client_id: clientID,
        callback: (response) => {
          if (response.credential) {
            void callbackRef.current(response.credential);
          }
        },
      });
      window.google.accounts.id.renderButton(containerRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        shape: 'rectangular',
        width: Math.min(containerRef.current.clientWidth || 360, 400),
      });
    };

    if (window.google) {
      render();
      return;
    }

    const existing = document.getElementById(
      SCRIPT_ID
    ) as HTMLScriptElement | null;
    const script = existing ?? document.createElement('script');
    script.id = SCRIPT_ID;
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    const handleScriptError = () => {
      setScriptFailed(true);
      reportDevelopmentError(
        'Google Identity Services failed to load',
        new Error('The Google Identity Services script could not be loaded.')
      );
    };
    script.addEventListener('load', render);
    script.addEventListener('error', handleScriptError);
    if (!existing) document.head.appendChild(script);

    return () => {
      script.removeEventListener('load', render);
      script.removeEventListener('error', handleScriptError);
    };
  }, []);

  if (!config.googleClientId || scriptFailed) {
    return (
      <div className="border-border bg-muted/25 text-muted-foreground rounded-xl border border-dashed px-4 py-3 text-center text-xs leading-5 font-medium">
        {unavailableLabel}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex min-h-11 w-full justify-center" />
  );
}
