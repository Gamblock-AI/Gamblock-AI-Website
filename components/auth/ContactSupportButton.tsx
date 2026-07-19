'use client';

import { LifeBuoy } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/routes';

export function ContactSupportButton({ label }: { label: string }) {
  return (
    <Button
      nativeButton={false}
      render={<Link href={ROUTES.CONTACT} />}
      size="lg"
      className="w-full"
    >
      <LifeBuoy className="size-4" aria-hidden="true" />
      {label}
    </Button>
  );
}
