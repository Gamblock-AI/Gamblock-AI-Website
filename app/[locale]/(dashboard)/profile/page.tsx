'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { User, Lock, Mail, Save } from 'lucide-react';
import { useTranslations } from "next-intl";

export default function ProfilePage() {
    const t = useTranslations('profilePage');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('gamblock_user');
    if (saved) {
      try {
        const u = JSON.parse(saved);
        setTimeout(() => {
          setDisplayName(u.display_name || '');
          setEmail(u.email || '');
        }, 0);
      } catch (err) {
        console.error(err);
      }
    }
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const saved = localStorage.getItem('gamblock_user');
      if (saved) {
        const u = JSON.parse(saved);
        u.display_name = displayName;
        u.email = email;
        localStorage.setItem('gamblock_user', JSON.stringify(u));
        // Dispatch storage event so layout header/avatar updates instantly
        window.dispatchEvent(new Event('storage'));
      }
      toast.success('Profil berhasil diperbarui!');
    } catch (err) {
      toast.error('Gagal memperbarui profil.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Password baru dan konfirmasi password tidak cocok!');
      return;
    }
    setLoading(true);
    try {
      toast.success('Password berhasil diperbarui!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error('Gagal memperbarui password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-navy w-full space-y-4">
      {/* Header */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
        <div className="space-y-1">
          <span className="bg-navy/5 text-navy rounded-full px-3 py-1 text-xs font-semibold tracking-wider uppercase">
            {t('text_160')}</span>
          <h1 className="text-navy mt-2 text-xl font-bold tracking-tight">
            {t('text_161')}</h1>
          <p className="text-sm text-muted-foreground">
            {t('text_162')}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Update Data Diri */}
        <div className="space-y-4 rounded-2xl border border-border bg-card p-4 shadow-soft">
          <div className="flex items-center gap-3 border-b border-border pb-3">
            <User className="text-navy size-5" />
            <h3 className="text-navy text-base font-black tracking-wider uppercase">
              {t('text_163')}</h3>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                {t('text_164')}</label>
              <div className="relative">
                <User className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="focus:ring-navy w-full rounded-xl border border-border bg-card py-2.5 pr-4 pl-12 text-xs font-semibold text-navy placeholder:text-muted-foreground/50 shadow-sm focus:border-transparent focus:ring-2 focus:outline-none"
                  placeholder={t('text_172')}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                {t('text_165')}</label>
              <div className="relative">
                <Mail className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="focus:ring-navy w-full rounded-xl border border-border bg-card py-2.5 pr-4 pl-12 text-xs font-semibold text-navy placeholder:text-muted-foreground/50 shadow-sm focus:border-transparent focus:ring-2 focus:outline-none"
                  placeholder="Email"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-navy hover:bg-navy/90 flex cursor-pointer items-center justify-center gap-1.5 rounded-full px-6 py-2.5 text-xs font-bold text-white shadow-soft transition-all disabled:opacity-50"
              >
                {t('text_166')}<Save className="size-4" />
              </button>
            </div>
          </form>
        </div>

        {/* Update Password */}
        <div className="space-y-4 rounded-2xl border border-border bg-card p-4 shadow-soft">
          <div className="flex items-center gap-3 border-b border-border pb-3">
            <Lock className="text-navy size-5" />
            <h3 className="text-navy text-base font-black tracking-wider uppercase">
              {t('text_167')}</h3>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                {t('text_168')}</label>
              <div className="relative">
                <Lock className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="focus:ring-navy w-full rounded-xl border border-border bg-card py-2.5 pr-4 pl-12 text-xs font-semibold text-navy placeholder:text-muted-foreground/50 shadow-sm focus:border-transparent focus:ring-2 focus:outline-none"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                {t('text_169')}</label>
              <div className="relative">
                <Lock className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="focus:ring-navy w-full rounded-xl border border-border bg-card py-2.5 pr-4 pl-12 text-xs font-semibold text-navy placeholder:text-muted-foreground/50 shadow-sm focus:border-transparent focus:ring-2 focus:outline-none"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                {t('text_170')}</label>
              <div className="relative">
                <Lock className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="focus:ring-navy w-full rounded-xl border border-border bg-card py-2.5 pr-4 pl-12 text-xs font-semibold text-navy placeholder:text-muted-foreground/50 shadow-sm focus:border-transparent focus:ring-2 focus:outline-none"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-navy hover:bg-navy/90 flex cursor-pointer items-center justify-center gap-1.5 rounded-full px-6 py-2.5 text-xs font-bold text-white shadow-soft transition-all disabled:opacity-50"
              >
                {t('text_171')}<Save className="size-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
