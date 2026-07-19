// End-user-facing message catalog (mirrors backend internal/i18n/messages.go).
//
// Maps the stable backend error `code` (and HTTP status fallbacks) to friendly
// Indonesian text. Use `friendlyMessage()` to resolve any thrown ApiError into
// a safe, localized string. Technical details are never rendered to users.
//
// Keep codes in sync with the backend catalog and the Flutter catalog
// (gamblock_ai_apps/lib/core/messaging/app_messages.dart).

export const MESSAGES: Record<string, string> = {
  // shared request / authorization
  auth_required: 'Sesi diperlukan. Silakan masuk terlebih dahulu.',
  forbidden: 'Anda tidak memiliki izin untuk tindakan ini.',
  invalid_body:
    'Data yang dikirim tidak dapat dibaca. Periksa isian lalu coba lagi.',
  privacy_payload_rejected:
    'Permintaan ditolak karena memuat data yang tidak boleh dikirim.',
  err_validation: 'Periksa kembali isian yang belum sesuai.',
  err_internal:
    'Terjadi kendala pada layanan. Silakan coba beberapa saat lagi.',
  create_admin_module_failed: 'Modul admin belum dapat dibuat.',

  // auth
  email_required: 'Email wajib diisi.',
  validation_failed: 'Email dan nama wajib diisi.',
  invalid_credentials: 'Email atau kata sandi salah. Silakan periksa kembali.',
  registration_failed: 'Pendaftaran gagal. Email mungkin sudah terdaftar.',
  dev_login_failed: 'Gagal masuk sebagai pengguna demo.',
  google_token_required: 'Sesi Google belum tersedia. Silakan coba lagi.',
  google_verification_failed: 'Verifikasi Google gagal. Silakan coba lagi.',
  invalid_refresh_token: 'Sesi tidak valid. Silakan masuk kembali.',
  refresh_token_required: 'Sesi telah berakhir. Silakan masuk kembali.',
  logout_failed: 'Gagal keluar. Silakan coba lagi.',
  email_verification_failed:
    'Tautan verifikasi email tidak valid atau telah kedaluwarsa.',
  email_verification_delivery_failed:
    'Email verifikasi belum dapat dikirim. Silakan coba lagi.',
  phone_verification_failed: 'Nomor atau kode verifikasi WhatsApp tidak valid.',
  recent_auth_required:
    'Silakan masuk kembali sebelum menyelesaikan keputusan sensitif ini.',

  // devices
  device_create_failed: 'Gagal mendaftarkan perangkat.',
  device_id_required: 'Perangkat wajib dipilih.',
  client_instance_required: 'Identitas instalasi aplikasi tidak tersedia.',
  device_update_failed: 'Gagal memperbarui perangkat.',
  heartbeat_failed: 'Gagal mengirim sinyal aktif perangkat.',
  dashboard_summary_failed: 'Gagal memuat ringkasan dashboard.',
  protection_status_failed: 'Gagal memuat status perlindungan.',
  progress_snapshot_failed: 'Gagal memuat ringkasan progres.',
  aggregate_event_rejected: 'Data perangkat belum dapat disinkronkan.',
  profile_not_found: 'Profil tidak ditemukan.',
  profile_update_failed: 'Gagal memperbarui profil.',
  password_validation_failed:
    'Kata sandi saat ini dan kata sandi baru minimal 8 karakter wajib diisi.',
  current_password_invalid: 'Kata sandi saat ini tidak sesuai.',
  password_reuse_not_allowed:
    'Kata sandi baru harus berbeda dari kata sandi saat ini.',
  password_update_failed: 'Gagal memperbarui kata sandi.',
  analytics_period_invalid: 'Periode analitik harus 7 atau 30 hari.',
  protection_analytics_failed: 'Gagal memuat analitik perlindungan.',

  // partners / accountability
  partner_email_required: 'Email pendamping wajib diisi.',
  fetch_partners_failed: 'Gagal memuat data pendamping.',
  partner_invite_failed: 'Gagal mengirim undangan pendamping.',
  partner_accept_failed: 'Gagal menerima undangan pendamping.',
  partner_revoke_failed: 'Gagal memutuskan hubungan pendamping.',
  fetch_approval_requests_failed: 'Gagal memuat daftar permohonan.',
  action_required: 'Jenis tindakan wajib dipilih.',
  approval_request_failed: 'Gagal mengajukan permohonan.',
  approval_cancel_failed: 'Gagal membatalkan permohonan.',
  approval_approve_failed: 'Gagal menyetujui permohonan.',
  approval_deny_failed: 'Gagal menolak permohonan.',
  approval_apply_failed:
    'Persetujuan tidak dapat diterapkan atau masa penerapannya telah berakhir.',
  accountability_workspace_failed:
    'Ruang akuntabilitas tidak dapat dimuat untuk akun ini.',
  accountability_group_create_failed:
    'Grup belum dapat dibuat. Pastikan email dan WhatsApp pendamping telah terverifikasi.',
  accountability_code_invalid: 'Kode grup tidak valid atau sudah diganti.',
  accountability_join_failed:
    'Belum dapat bergabung ke grup. Periksa konfirmasi dan keanggotaan aktif Anda.',
  accountability_code_rotate_failed: 'Kode grup belum dapat diganti.',
  accountability_group_archive_failed:
    'Grup hanya dapat diarsipkan setelah tidak memiliki anggota aktif.',
  accountability_sharing_update_failed:
    'Preferensi berbagi belum dapat diperbarui.',
  accountability_leave_failed: 'Permintaan keluar belum dapat diproses.',
  accountability_leave_cancel_failed:
    'Permintaan keluar tidak dapat dibatalkan. Muat ulang status lalu coba lagi.',
  accountability_leave_resolve_failed: 'Keputusan keluar belum dapat disimpan.',
  accountability_member_remove_failed:
    'Anggota belum dapat dikeluarkan dari grup.',
  partner_contact_create_failed:
    'Permintaan menghubungi pendamping belum dapat dikirim.',
  partner_contact_transition_failed:
    'Status permintaan kontak belum dapat diperbarui.',

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
  invalid_mission: 'Nomor misi harus 1-5.',
  mission_update_failed: 'Gagal memperbarui misi harian.',
  mission_adjust_failed: 'Misi utama belum dapat disesuaikan. Coba pilihan lain.',

  // reflections / psychoeducation
  fetch_reflections_failed: 'Gagal memuat jurnal refleksi.',
  reflection_create_failed: 'Gagal menyimpan jurnal refleksi.',
  reflection_update_failed: 'Jurnal refleksi belum dapat diperbarui.',
  fetch_modules_failed: 'Gagal memuat modul psikoedukasi.',
  module_not_found: 'Modul tidak ditemukan.',
  education_conflict:
    'Draf berubah di sesi lain. Muat ulang sebelum melanjutkan.',
  education_validation_failed:
    'Modul belum lengkap. Periksa kembali konten dan metadata.',
  education_media_invalid: 'Format, ukuran, atau sumber media tidak didukung.',
  education_media_not_found: 'Media pembelajaran tidak ditemukan.',
  text_required: 'Teks refleksi wajib diisi.',

  // quick approval
  token_required: 'Tautan persetujuan tidak lengkap.',
  invalid_token: 'Tautan persetujuan tidak valid atau sudah kedaluwarsa.',
  invalid_input: 'Pilihan persetujuan belum lengkap.',
  resolve_failed: 'Gagal memproses permohonan.',

  // support / data requests
  fetch_support_cases_failed: 'Gagal memuat tiket bantuan.',
  support_case_failed: 'Gagal mengirim tiket bantuan.',
  summary_required: 'Ringkasan tiket wajib diisi.',
  support_case_not_found:
    'Tiket bantuan tidak ditemukan atau bukan milik Anda.',
  support_reply_failed: 'Balasan belum dapat dikirim.',
  support_transition_failed: 'Status tiket belum dapat diperbarui.',
  support_claim_failed:
    'Tiket belum dapat diambil. Muat ulang antrean dan coba lagi.',
  support_release_failed: 'Tiket belum dapat dilepas dari antrean Anda.',
  recovery_records_failed: 'Data pemulihan belum dapat dimuat.',
  recovery_record_save_failed: 'Data pemulihan belum dapat disimpan.',
  recovery_practice_fetch_failed: 'Latihan pemulihan belum dapat dimuat.',
  recovery_practice_invalid:
    'Latihan belum dapat disimpan. Periksa jenis, durasi, atau umpan baliknya.',
  recovery_space_fetch_failed: 'Ruang pulih belum dapat dimuat.',
  recovery_space_update_failed: 'Tata ruang pulih belum dapat disimpan.',
  weekly_review_fetch_failed: 'Tinjauan mingguan belum dapat dimuat.',
  weekly_review_save_failed: 'Tinjauan mingguan belum dapat disimpan.',
  fetch_data_requests_failed: 'Gagal memuat permintaan data.',
  data_request_failed: 'Gagal mengajukan permintaan data.',
  data_request_retry_failed: 'Permintaan data belum dapat diproses ulang.',
  data_request_reject_failed: 'Permintaan data belum dapat ditolak.',
  data_export_unavailable:
    'Arsip data tidak tersedia atau masa unduhnya telah berakhir.',
  account_deletion_failed: 'Penghapusan akun belum dapat dikonfirmasi.',
  type_required: 'Jenis permintaan wajib dipilih.',

  // admin / releases / emergency
  fetch_admin_modules_failed: 'Gagal memuat modul admin.',
  fetch_admin_model_releases_failed: 'Gagal memuat rilis model.',
  fetch_admin_support_cases_failed: 'Gagal memuat tiket admin.',
  fetch_admin_releases_failed: 'Gagal memuat rilis operasional.',
  admin_overview_failed: 'Gagal memuat ringkasan operasional.',
  site_social_links_failed: 'Pengaturan sosial media belum dapat diproses.',
  audit_events_failed: 'Gagal memuat jejak audit.',
  operators_fetch_failed: 'Gagal memuat akun operator.',
  operator_invite_failed: 'Undangan operator belum dapat dikirim.',
  operator_update_failed: 'Akun operator belum dapat diperbarui.',
  operator_invitation_revoke_failed: 'Undangan operator belum dapat dicabut.',
  operator_invitation_invalid:
    'Undangan operator tidak valid atau telah kedaluwarsa.',
  operator_invitation_accept_failed: 'Akun operator belum dapat diaktifkan.',
  release_rollout_create_failed: 'Rollout belum dapat disiapkan.',
  release_rollout_transition_failed: 'Status rollout belum dapat diperbarui.',
  create_model_release_failed: 'Gagal merilis model.',
  create_ruleset_release_failed: 'Gagal merilis ruleset.',
  create_network_release_failed: 'Gagal merilis ruleset jaringan.',
  release_not_found: 'Rilis tidak ditemukan.',
  release_validation_failed:
    'Artefak rilis belum lengkap atau checksum tidak cocok.',
  artifact_unavailable: 'Artefak rilis belum tersedia atau gagal diverifikasi.',
  portal_overview_failed: 'Gagal memuat ringkasan operasional.',
  generate_key_failed: 'Gagal membuat kunci darurat.',
  emergency_request_failed: 'Gagal meminta pemulihan darurat.',
  emergency_request_not_found: 'Permintaan pemulihan darurat tidak ditemukan.',
  emergency_review_failed: 'Peninjauan pemulihan darurat gagal.',
  emergency_key_required: 'Kunci darurat wajib diisi.',
  invalid_key: 'Kunci darurat tidak valid.',
};

type SupportedLocale = 'id' | 'en';

const MESSAGES_EN: Record<string, string> = {
  auth_required: 'Please sign in to continue.',
  forbidden: 'You do not have permission to perform this action.',
  invalid_body:
    'The submitted data could not be read. Review it and try again.',
  privacy_payload_rejected:
    'The request was rejected because it included data that must not be sent.',
  err_validation: 'Review the fields that still need attention.',
  err_internal: 'The service encountered a problem. Please try again shortly.',
  create_admin_module_failed: 'The admin module could not be created.',
  email_required: 'Email is required.',
  validation_failed: 'Email and name are required.',
  invalid_credentials: 'The email or password is incorrect. Please try again.',
  registration_failed:
    'Registration failed. This email may already be registered.',
  google_token_required: 'The Google session is unavailable. Please try again.',
  google_verification_failed: 'Google verification failed. Please try again.',
  invalid_refresh_token: 'Your session is invalid. Please sign in again.',
  refresh_token_required: 'Your session has ended. Please sign in again.',
  logout_failed: 'Could not sign out. Please try again.',
  email_verification_failed:
    'The email verification link is invalid or has expired.',
  email_verification_delivery_failed:
    'The verification email could not be sent. Please try again.',
  phone_verification_failed:
    'The WhatsApp number or verification code is invalid.',
  recent_auth_required:
    'Please sign in again before completing this sensitive action.',
  profile_not_found: 'Your profile could not be found.',
  profile_update_failed: 'Your profile could not be updated.',
  password_validation_failed:
    'Enter your current password and a new password of at least 8 characters.',
  current_password_invalid: 'Your current password is incorrect.',
  password_reuse_not_allowed:
    'Your new password must be different from your current password.',
  password_update_failed: 'Your password could not be updated.',
  partner_email_required: 'Accountability partner email is required.',
  name_required: 'Group name is required.',
  group_code_required: 'Group code is required.',
  text_required: 'Reflection text is required.',
  token_required: 'The approval link is incomplete.',
  invalid_token: 'The link or token is invalid or has expired.',
  invalid_input: 'The submitted choice is incomplete.',
  summary_required: 'A support request summary is required.',
  support_case_failed: 'The support request could not be sent.',
  support_reply_failed: 'The reply could not be sent.',
  fetch_data_requests_failed: 'Data requests could not be loaded.',
  data_request_failed: 'The data request could not be submitted.',
  data_request_retry_failed: 'The data request could not be retried.',
  data_request_reject_failed: 'The data request could not be rejected.',
  data_export_unavailable:
    'The data archive is unavailable or its download period has ended.',
  account_deletion_failed: 'Account deletion could not be confirmed.',
  type_required: 'Select a request type.',
  release_validation_failed:
    'The release artifact is incomplete or its checksum does not match.',
  emergency_key_required: 'Emergency key is required.',
  invalid_key: 'The emergency key is invalid.',
};

const GENERIC: Record<SupportedLocale, string> = {
  id: 'Terjadi kendala, silakan coba beberapa saat lagi.',
  en: 'Something went wrong. Please try again shortly.',
};

const NETWORK_FAILURE_MESSAGES: Record<SupportedLocale, string> = {
  id: 'Tidak dapat terhubung ke layanan. Periksa koneksi dan coba lagi.',
  en: 'Could not connect to the service. Check your connection and try again.',
};

// Status-based fallbacks when no code is available.
const STATUS_MESSAGES: Record<SupportedLocale, Record<number, string>> = {
  id: {
    400: 'Permintaan tidak valid. Periksa kembali isian Anda.',
    401: 'Sesi telah berakhir. Silakan masuk kembali.',
    403: 'Anda tidak memiliki izin untuk aksi ini.',
    404: 'Data yang diminta tidak ditemukan.',
    409: 'Konflik data. Silakan muat ulang dan coba lagi.',
    422: 'Beberapa isian perlu diperbaiki.',
    429: 'Terlalu banyak permintaan. Coba lagi sebentar lagi.',
    500: 'Layanan sedang mengalami kendala. Silakan coba beberapa saat lagi.',
    502: 'Layanan sedang tidak tersedia. Coba lagi nanti.',
    503: 'Layanan sedang dalam pemeliharaan.',
  },
  en: {
    400: 'The request is invalid. Review your entries and try again.',
    401: 'Your session has ended. Please sign in again.',
    403: 'You do not have permission to perform this action.',
    404: 'The requested data could not be found.',
    409: 'The data changed. Reload the page and try again.',
    422: 'Some fields need your attention.',
    429: 'Too many requests. Please wait a moment and try again.',
    500: 'The service encountered a problem. Please try again shortly.',
    502: 'The service is currently unavailable. Please try again later.',
    503: 'The service is currently under maintenance.',
  },
};

function currentLocale(locale?: string): SupportedLocale {
  if (locale === 'en' || locale === 'id') return locale;
  if (
    typeof document !== 'undefined' &&
    document.documentElement.lang === 'en'
  ) {
    return 'en';
  }
  return 'id';
}

export function errorCode(error: unknown): string | undefined {
  if (!error || typeof error !== 'object' || !('code' in error)) return;
  const code = (error as { code?: unknown }).code;
  return typeof code === 'string' && code ? code : undefined;
}

export function errorStatus(error: unknown): number | undefined {
  if (!error || typeof error !== 'object' || !('status' in error)) return;
  const status = (error as { status?: unknown }).status;
  return typeof status === 'number' && Number.isInteger(status)
    ? status
    : undefined;
}

/**
 * Browser fetch failures have no HTTP status or API envelope. They are an
 * expected user-facing state when the local API is stopped, unavailable, or
 * blocked by the network, so the UI should offer recovery rather than expose
 * the browser's technical "Failed to fetch" text.
 */
export function isNetworkFailure(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const failure = error as { name?: unknown; message?: unknown };
  const name = typeof failure.name === 'string' ? failure.name : '';
  const message =
    typeof failure.message === 'string' ? failure.message.toLowerCase() : '';
  return (
    name === 'AbortError' ||
    (name === 'TypeError' &&
      (message.includes('failed to fetch') ||
        message.includes('networkerror') ||
        message.includes('load failed')))
  );
}

export function messageForCode(
  code: string | undefined | null,
  locale?: string
): string | null {
  if (!code) return null;
  const resolvedLocale = currentLocale(locale);
  if (resolvedLocale === 'en') return MESSAGES_EN[code] ?? null;
  return MESSAGES[code] ?? null;
}

export function messageForStatus(status: number, locale?: string): string {
  const resolvedLocale = currentLocale(locale);
  return STATUS_MESSAGES[resolvedLocale][status] ?? GENERIC[resolvedLocale];
}

// Resolve any thrown value structurally so errors remain reliable across
// module, realm, and serialization boundaries.
export function friendlyMessage(
  error: unknown,
  fallback?: string,
  locale?: string
): string {
  const fromCode = messageForCode(errorCode(error), locale);
  if (fromCode) return fromCode;
  if (isNetworkFailure(error)) {
    return NETWORK_FAILURE_MESSAGES[currentLocale(locale)];
  }
  if (fallback) return fallback;
  const status = errorStatus(error);
  if (status !== undefined) return messageForStatus(status, locale);
  return GENERIC[currentLocale(locale)];
}
