import type {
  DailyCheckIn,
  SkillActivity,
  SkillId,
  SkillReasonCode,
  SkillRecommendation,
} from './types';

export const SKILL_CATALOG: readonly SkillActivity[] = [
  {
    id: 'grounding_reset',
    category: 'emotional_regulation',
    title: 'Jeda dan grounding singkat',
    description:
      'Gunakan napas perlahan dan teknik 5-4-3-2-1 untuk memberi ruang sebelum bertindak.',
    durationMinutes: 5,
  },
  {
    id: 'gentle_movement',
    category: 'physical_wellbeing',
    title: 'Gerak ringan tanpa target',
    description:
      'Berjalan atau melakukan peregangan ringan sebagai pengalihan yang mudah dimulai.',
    durationMinutes: 10,
  },
  {
    id: 'focus_sprint',
    category: 'study_career',
    title: 'Sesi fokus satu langkah',
    description:
      'Pilih satu tugas kecil lalu kerjakan dalam satu sesi fokus yang singkat.',
    durationMinutes: 15,
  },
  {
    id: 'budgeting_basics',
    category: 'financial_literacy',
    title: 'Cek anggaran sederhana',
    description:
      'Tinjau satu pengeluaran dan tentukan satu langkah aman untuk kebutuhan berikutnya.',
    durationMinutes: 10,
  },
  {
    id: 'creative_reset',
    category: 'creative_hobby',
    title: 'Reset lewat aktivitas kreatif',
    description:
      'Pilih aktivitas kreatif ringan seperti menggambar, menulis, atau memainkan musik.',
    durationMinutes: 15,
  },
  {
    id: 'social_connection',
    category: 'social_connection',
    title: 'Hubungi orang yang dipercaya',
    description:
      'Kirim kabar singkat kepada teman, keluarga, atau pendamping yang Anda pilih sendiri.',
    durationMinutes: 5,
  },
] as const;

const SKILLS_BY_ID = new Map<SkillId, SkillActivity>(
  SKILL_CATALOG.map((skill) => [skill.id, skill])
);

const RECOMMENDATION_ORDER: Record<SkillReasonCode, readonly SkillId[]> = {
  high_urge_pause: [
    'grounding_reset',
    'social_connection',
    'gentle_movement',
    'creative_reset',
    'focus_sprint',
    'budgeting_basics',
  ],
  moderate_urge_redirect: [
    'gentle_movement',
    'grounding_reset',
    'creative_reset',
    'social_connection',
    'focus_sprint',
    'budgeting_basics',
  ],
  low_mood_gentle_start: [
    'gentle_movement',
    'social_connection',
    'creative_reset',
    'grounding_reset',
    'focus_sprint',
    'budgeting_basics',
  ],
  steady_mood_build_routine: [
    'focus_sprint',
    'budgeting_basics',
    'gentle_movement',
    'creative_reset',
    'social_connection',
    'grounding_reset',
  ],
  balanced_check_in: [
    'creative_reset',
    'focus_sprint',
    'gentle_movement',
    'budgeting_basics',
    'social_connection',
    'grounding_reset',
  ],
};

function getReasonCode(checkIn: DailyCheckIn): SkillReasonCode {
  if (checkIn.urge !== null && checkIn.urge >= 4) {
    return 'high_urge_pause';
  }
  if (checkIn.mood <= 2) {
    return 'low_mood_gentle_start';
  }
  if (checkIn.urge !== null && checkIn.urge === 3) {
    return 'moderate_urge_redirect';
  }
  if (checkIn.mood >= 4 && (checkIn.urge === null || checkIn.urge <= 2)) {
    return 'steady_mood_build_routine';
  }
  return 'balanced_check_in';
}

/**
 * Returns a deterministic, non-diagnostic ranking based only on a voluntary
 * structured mood/urge check-in. With no check-in, nothing is personalized.
 */
export function recommendSkills(
  checkIn: DailyCheckIn | null
): SkillRecommendation[] {
  if (!checkIn) return [];

  const reasonCode = getReasonCode(checkIn);

  return RECOMMENDATION_ORDER[reasonCode].flatMap((id) => {
    const skill = SKILLS_BY_ID.get(id);
    if (!skill) return [];

    return [
      {
        ...skill,
        reasonCode,
        basedOn: {
          mood: checkIn.mood,
          urge: checkIn.urge,
        },
      },
    ];
  });
}
