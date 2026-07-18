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
  dev_login_failed: 'Gagal masuk sebagai pengguna demo.',
  google_token_required: 'Sesi Google belum tersedia. Silakan coba lagi.',
  google_verification_failed: 'Verifikasi Google gagal. Silakan coba lagi.',
  invalid_refresh_token: 'Sesi tidak valid. Silakan masuk kembali.',
  refresh_token_required: 'Sesi telah berakhir. Silakan masuk kembali.',
  logout_failed: 'Gagal keluar. Silakan coba lagi.',

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

  // reflections / psychoeducation
  fetch_reflections_failed: 'Gagal memuat jurnal refleksi.',
  reflection_create_failed: 'Gagal menyimpan jurnal refleksi.',
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
  fetch_data_requests_failed: 'Gagal memuat permintaan data.',
  data_request_failed: 'Gagal mengajukan permintaan data.',
  type_required: 'Jenis permintaan wajib dipilih.',

  // admin / releases / emergency
  fetch_admin_modules_failed: 'Gagal memuat modul admin.',
  fetch_admin_model_releases_failed: 'Gagal memuat rilis model.',
  fetch_admin_support_cases_failed: 'Gagal memuat tiket admin.',
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
  500: 'Layanan sedang mengalami kendala. Silakan coba beberapa saat lagi.',
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
