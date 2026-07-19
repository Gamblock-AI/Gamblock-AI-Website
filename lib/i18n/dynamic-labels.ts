const DYNAMIC_LABEL_VALUES = {
  approvalAction: [
    'pause_protection',
    'disable_protection',
    'remove_partner',
    'uninstall_detected',
    'reset_settings',
    'emergency_access',
  ],
  supportStatus: ['waiting_support', 'waiting_user', 'resolved', 'closed'],
  supportType: [
    'technical_support',
    'account_recovery',
    'partner_abuse',
    'stuck_approval',
    'device_recovery',
    'notification_failure',
    'organization_dispute',
    'accountability_guidance',
    'privacy_request',
  ],
  priority: ['low', 'normal', 'high', 'urgent'],
  role: ['user', 'partner', 'admin'],
  status: [
    'draft',
    'in_review',
    'published',
    'archived',
    'validated',
    'staged',
    'active',
    'paused',
    'rolled_back',
    'completed',
    'open',
    'waiting_user',
    'waiting_internal',
    'resolved',
    'closed',
    'pending',
    'reviewed',
    'approved',
    'used',
    'expired',
    'queued',
    'processing',
    'pending_confirmation',
    'rejected',
    'cancelled',
    'accepted',
    'revoked',
    'sent',
    'failed',
  ],
  platform: ['android', 'windows', 'linux', 'macos', 'web', 'all'],
  educationCategory: [
    'impulse-awareness',
    'digital-literacy',
    'coping-skill',
    'financial-literacy',
    'environment-change',
    'help-seeking',
  ],
} as const;

export type DynamicLabelGroup = keyof typeof DYNAMIC_LABEL_VALUES;

function normalizeDynamicCode(value: string) {
  return value.trim().toLowerCase().replaceAll(' ', '_');
}

export function dynamicLabelKey(group: DynamicLabelGroup, value: string) {
  const normalized = normalizeDynamicCode(value);
  const values = DYNAMIC_LABEL_VALUES[group] as readonly string[];
  return `${group}.${values.includes(normalized) ? normalized : 'unknown'}`;
}

export function dynamicLabelFallback(value: string) {
  return value.trim().replaceAll('_', ' ').replaceAll('-', ' ') || '—';
}

export function normalizeSupportStatus(value: string) {
  const normalized = normalizeDynamicCode(value);

  if (normalized === 'open' || normalized === 'waiting_internal') {
    return 'waiting_support';
  }

  return normalized;
}

export const educationCategoryCodes = DYNAMIC_LABEL_VALUES.educationCategory;
