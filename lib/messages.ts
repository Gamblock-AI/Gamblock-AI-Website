// End-user-facing message catalog (mirrors backend internal/i18n/messages.go).
//
// Maps the stable backend error `code` (and HTTP status fallbacks) to friendly
// Indonesian text. Use `friendlyMessage()` to resolve any thrown ApiError into a
// production-safe string. In development the ApiError already carries technical
// detail; in production this catalog is the fallback when the backend did not
// include a friendly message.
//
// Keep codes in sync with the backend catalog and the Flutter catalog
// (gamblock_ai_apps/lib/core/messaging/app_messages.dart).

export const MESSAGES: Record<string, string> = {
  // auth
  email_required: 'Email wajib diisi.',
  validation_failed: 'Email dan nama wajib diisi.',
  invalid_credentials: 'Email atau kata sandi salah. Silakan periksa kembali.',
  registration_failed: 'Pendaftaran gagal. Email mungkin sudah terdaftar.',
  google_verification_failed: 'Verifikasi Google gagal. Silakan coba lagi.',
  invalid_refresh_token: 'Sesi tidak valid. Silakan masuk kembali.',
  refresh_token_required: 'Sesi telah berakhir. Silakan masuk kembali.',
  logout_failed: 'Gagal keluar. Silakan coba lagi.',

  // partners / accountability
  partner_email_required: 'Email pendamping wajib diisi.',
  fetch_partners_failed: 'Gagal memuat data pendamping.',
  partner_invite_failed: 'Gagal mengirim undangan pendamping.',
  partner_accept_failed: 'Gagal menerima undangan pendamping.',
  partner_revoke_failed: 'Gagal memutuskan hubungan pendamping.',
  fetch_approval_requests_failed: 'Gagal memuat daftar permohonan.',
  approval_request_failed: 'Gagal mengajukan permohonan.',
  approval_cancel_failed: 'Gagal membatalkan permohonan.',
  approval_approve_failed: 'Gagal menyetujui permohonan.',
  approval_deny_failed: 'Gagal menolak permohonan.',

  // organizations
  name_required: 'Nama grup wajib diisi.',
  create_org_failed: 'Gagal membuat grup.',
  org_not_found: 'Grup tidak ditemukan.',
  group_code_required: 'Kode grup wajib diisi.',
  join_failed: 'Kode grup tidak valid. Coba lagi.',
  no_org: 'Anda belum bergabung dengan grup mana pun.',
  list_members_failed: 'Gagal memuat daftar anggota.',
  analytics_failed: 'Gagal memuat analitik grup.',
  remove_member_failed: 'Gagal mengeluarkan anggota.',

  // missions
  mission_fetch_failed: 'Gagal memuat misi harian.',
  mission_update_failed: 'Gagal memperbarui misi harian.',

  // reflections / psychoeducation
  fetch_reflections_failed: 'Gagal memuat jurnal refleksi.',
  reflection_create_failed: 'Gagal menyimpan jurnal refleksi.',
  fetch_modules_failed: 'Gagal memuat modul psikoedukasi.',
  module_not_found: 'Modul tidak ditemukan.',

  // quick approval
  invalid_token: 'Token tidak valid atau sudah kadaluarsa.',
  resolve_failed: 'Gagal memproses permohonan.',

  // support / data requests
  fetch_support_cases_failed: 'Gagal memuat tiket bantuan.',
  support_case_failed: 'Gagal mengirim tiket bantuan.',
  fetch_data_requests_failed: 'Gagal memuat permintaan data.',
  data_request_failed: 'Gagal mengajukan permintaan data.',

  // releases / emergency
  release_not_found: 'Rilis tidak ditemukan.',
  generate_key_failed: 'Gagal membuat kunci darurat.',
  invalid_key: 'Kunci darurat tidak valid.',
};

const GENERIC = 'Terjadi kendala, silakan coba beberapa saat lagi.';

// Status-based fallbacks when no code is available.
const STATUS_MESSAGES: Record<number, string> = {
  400: 'Permintaan tidak valid. Periksa kembali isian Anda.',
  401: 'Sesi telah berakhir. Silakan masuk kembali.',
  403: 'Anda tidak memiliki izin untuk aksi ini.',
  404: 'Data yang diminta tidak ditemukan.',
  409: 'Konflik data. Silakan muat ulang dan coba lagi.',
  422: 'Beberapa isian perlu diperbaiki.',
  429: 'Terlalu banyak permintaan. Coba lagi sebentar lagi.',
  500: 'Server sedang sibuk. Silakan coba beberapa saat lagi.',
  502: 'Layanan sedang tidak tersedia. Coba lagi nanti.',
  503: 'Layanan sedang dalam pemeliharaan.',
};

export function messageForCode(code: string | undefined | null): string | null {
  if (!code) return null;
  return MESSAGES[code] ?? null;
}

export function messageForStatus(status: number): string {
  return STATUS_MESSAGES[status] ?? GENERIC;
}

// Resolve any thrown error into a production-safe friendly message.
export function friendlyMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'code' in error) {
    const code = (error as { code?: string }).code;
    const fromCode = messageForCode(code);
    if (fromCode) return fromCode;
  }
  if (error && typeof error === 'object' && 'status' in error) {
    const status = (error as { status?: number }).status;
    if (typeof status === 'number') return messageForStatus(status);
  }
  return GENERIC;
}
