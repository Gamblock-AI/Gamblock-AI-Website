import { ShieldCheck } from 'lucide-react';
import { AuthShell } from '@/components/auth/AuthShell';
import { Link } from '@/i18n/routing';
import { ROUTES } from '@/routes';

export default function RetiredOperatorInvitationPage() {
  return (
    <AuthShell
      heading="Undangan operator telah dihentikan"
      subheading="Role operasional kini disatukan sebagai admin."
      backFallbackHref={ROUTES.HOME}
    >
      <div className="border-border bg-muted/40 rounded-2xl border p-6 text-center">
        <ShieldCheck className="text-navy mx-auto size-8" />
        <p className="text-muted-foreground mt-4 text-sm leading-6">
          Tautan lama tidak dapat dipakai. Minta admin platform membuat akun
          langsung dan mengirimkan kata sandi sementara melalui kanal resmi.
        </p>
        <Link
          href={ROUTES.LOGIN}
          className="bg-navy mt-5 inline-flex min-h-11 items-center justify-center rounded-xl px-5 text-sm font-bold text-white"
        >
          Kembali ke halaman masuk
        </Link>
      </div>
    </AuthShell>
  );
}
