import { apiClient } from '@/lib/api-client';
import {
  RECOVERY_STORAGE_VERSION,
  type CreateIntentionInput,
  type DailyCheckIn,
  type DailyCheckInInput,
  type IntentionFocusPeriod,
  type IntentionHistoryEvent,
  type IntentionHistoryEventType,
  type IntentionStatus,
  type MissionNumber,
  type MoodLevel,
  type RecoveryIntention,
  type RecoveryPersistence,
  type RecoveryState,
  type SaveWeeklyReviewInput,
  type SelectedMissionAlternative,
  type SkillId,
  type UpdateIntentionInput,
  type UrgeLevel,
  type WeeklyAdjustment,
  type WeeklyHelpfulAction,
  type WeeklyOutcome,
  type WeeklyReview,
} from './types';

export const RECOVERY_STORAGE_KEY = 'gamblock:recovery:v1';

const LEGACY_STORAGE_KEYS = [
  'gamblock_intention',
  'gamblock_motivation',
  'gamblock_target_days',
] as const;
const MAX_INTENTIONS = 20;
const MAX_INTENTION_EVENTS = 120;
const MAX_CHECK_INS = 90;
const MAX_SELECTED_MISSIONS = 90;
const MAX_WEEKLY_REVIEWS = 52;
const MAX_INTENTION_LENGTH = 240;
const MAX_NEXT_ACTION_LENGTH = 160;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const INTENTION_STATUSES = new Set<IntentionStatus>([
  'active',
  'paused',
  'archived',
]);
const INTENTION_EVENT_TYPES = new Set<IntentionHistoryEventType>([
  'created',
  'updated',
  'paused',
  'resumed',
  'archived',
]);
const FOCUS_PERIODS = new Set<IntentionFocusPeriod>([
  'today',
  'this_week',
  'two_weeks',
  'one_month',
]);
const WEEKLY_OUTCOMES = new Set<WeeklyOutcome>([
  'helped',
  'mixed',
  'difficult',
]);
const WEEKLY_ADJUSTMENTS = new Set<WeeklyAdjustment>([
  'continue',
  'simplify',
  'change_focus',
  'pause',
]);
const WEEKLY_HELPFUL_ACTIONS = new Set<WeeklyHelpfulAction>([
  'pause',
  'trusted_person',
  'walk',
  'unsure',
]);
const SKILL_IDS = new Set<SkillId>([
  'grounding_reset',
  'gentle_movement',
  'focus_sprint',
  'budgeting_basics',
  'creative_reset',
  'social_connection',
]);

const SERVER_SNAPSHOT: RecoveryState = createEmptyRecoveryState();
const listeners = new Set<() => void>();

let persistence: RecoveryPersistence = 'memory';
let currentState =
  typeof window === 'undefined' ? SERVER_SNAPSHOT : loadInitialClientState();
let listeningForStorage = false;

export function createEmptyRecoveryState(): RecoveryState {
  return {
    version: RECOVERY_STORAGE_VERSION,
    intentions: [],
    intentionHistory: [],
    checkIns: [],
    selectedMissions: [],
    weeklyReviews: [],
  };
}

export function getLocalDateString(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getLocalWeekStartString(date = new Date()): string {
  const weekStart = new Date(date);
  const day = weekStart.getDay();
  const daysSinceMonday = day === 0 ? 6 : day - 1;
  weekStart.setDate(weekStart.getDate() - daysSinceMonday);
  return getLocalDateString(weekStart);
}

export function getRecoverySnapshot(): RecoveryState {
  return currentState;
}

export function getRecoveryServerSnapshot(): RecoveryState {
  return SERVER_SNAPSHOT;
}

export function getRecoveryPersistence(): RecoveryPersistence {
  return persistence;
}

export function getRecoveryPersistenceServerSnapshot(): RecoveryPersistence {
  return 'memory';
}

export function subscribeRecoveryStore(listener: () => void): () => void {
  listeners.add(listener);

  if (
    typeof window !== 'undefined' &&
    !listeningForStorage &&
    listeners.size === 1
  ) {
    window.addEventListener('storage', handleStorageEvent);
    listeningForStorage = true;
  }

  return () => {
    listeners.delete(listener);
    if (
      typeof window !== 'undefined' &&
      listeningForStorage &&
      listeners.size === 0
    ) {
      window.removeEventListener('storage', handleStorageEvent);
      listeningForStorage = false;
    }
  };
}

export function createIntention(
  input: CreateIntentionInput
): RecoveryIntention | null {
  const title = normalizeText(input.title, MAX_INTENTION_LENGTH);
  if (!title) return null;

  const now = new Date().toISOString();
  const intention: RecoveryIntention = {
    id: createId('int'),
    title,
    nextAction: normalizeText(input.nextAction, MAX_NEXT_ACTION_LENGTH),
    focusPeriod: isFocusPeriod(input.focusPeriod)
      ? input.focusPeriod
      : 'this_week',
    status: 'active',
    createdAt: now,
    updatedAt: now,
  };

  updateState((state) => {
    const pausedIntentions: IntentionHistoryEvent[] = [];
    const intentions = state.intentions.map((existing) => {
      if (existing.status !== 'active') return existing;
      pausedIntentions.push(createHistoryEvent(existing.id, 'paused', now));
      return { ...existing, status: 'paused' as const, updatedAt: now };
    });

    return {
      ...state,
      intentions: [intention, ...intentions].slice(0, MAX_INTENTIONS),
      intentionHistory: [
        createHistoryEvent(intention.id, 'created', now),
        ...pausedIntentions,
        ...state.intentionHistory,
      ].slice(0, MAX_INTENTION_EVENTS),
    };
  });

  // Background sync
  apiClient('/intentions', {
    method: 'POST',
    body: JSON.stringify({ intention_text: title, status: 'active' })
  }).catch(() => {});

  return intention;
}

export function updateIntention(
  intentionId: string,
  input: UpdateIntentionInput
): RecoveryIntention | null {
  let updatedIntention: RecoveryIntention | null = null;

  updateState((state) => {
    const existing = state.intentions.find(
      (intention) => intention.id === intentionId
    );
    if (!existing) return state;

    const title =
      input.title === undefined
        ? existing.title
        : normalizeText(input.title, MAX_INTENTION_LENGTH);
    if (!title) return state;

    const nextAction =
      input.nextAction === undefined
        ? existing.nextAction
        : normalizeText(input.nextAction, MAX_NEXT_ACTION_LENGTH);
    const focusPeriod = isFocusPeriod(input.focusPeriod)
      ? input.focusPeriod
      : existing.focusPeriod;

    if (
      title === existing.title &&
      nextAction === existing.nextAction &&
      focusPeriod === existing.focusPeriod
    ) {
      updatedIntention = existing;
      return state;
    }

    const now = new Date().toISOString();
    const nextIntention: RecoveryIntention = {
      ...existing,
      title,
      nextAction,
      focusPeriod,
      updatedAt: now,
    };
    updatedIntention = nextIntention;

    return {
      ...state,
      intentions: state.intentions.map((intention) =>
        intention.id === intentionId ? nextIntention : intention
      ),
      intentionHistory: [
        createHistoryEvent(intentionId, 'updated', now),
        ...state.intentionHistory,
      ].slice(0, MAX_INTENTION_EVENTS),
    };
  });

  if (updatedIntention) {
    const intn = updatedIntention as RecoveryIntention;
    apiClient('/intentions', {
      method: 'POST',
      body: JSON.stringify({ intention_text: intn.title, status: intn.status })
    }).catch(() => {});
  }

  return updatedIntention;
}

export function setIntentionStatus(
  intentionId: string,
  status: IntentionStatus
): RecoveryIntention | null {
  if (!INTENTION_STATUSES.has(status)) return null;

  let updatedIntention: RecoveryIntention | null = null;

  updateState((state) => {
    const existing = state.intentions.find(
      (intention) => intention.id === intentionId
    );
    if (!existing) return state;
    if (existing.status === status) {
      updatedIntention = existing;
      return state;
    }

    const now = new Date().toISOString();
    const additionalEvents: IntentionHistoryEvent[] = [];
    const intentions = state.intentions.map((intention) => {
      if (intention.id === intentionId) {
        updatedIntention = { ...intention, status, updatedAt: now };
        return updatedIntention;
      }
      if (status === 'active' && intention.status === 'active') {
        additionalEvents.push(createHistoryEvent(intention.id, 'paused', now));
        return { ...intention, status: 'paused' as const, updatedAt: now };
      }
      return intention;
    });

    const eventType: IntentionHistoryEventType =
      status === 'active' ? 'resumed' : status;

    return {
      ...state,
      intentions,
      intentionHistory: [
        createHistoryEvent(intentionId, eventType, now),
        ...additionalEvents,
        ...state.intentionHistory,
      ].slice(0, MAX_INTENTION_EVENTS),
    };
  });

  if (updatedIntention) {
    const intn = updatedIntention as RecoveryIntention;
    apiClient('/intentions', {
      method: 'POST',
      body: JSON.stringify({ intention_text: intn.title, status: intn.status })
    }).catch(() => {});
  }

  return updatedIntention;
}

export function recordDailyCheckIn(
  input: DailyCheckInInput
): DailyCheckIn | null {
  if (!isMoodLevel(input.mood)) return null;
  if (
    input.urge !== undefined &&
    input.urge !== null &&
    !isUrgeLevel(input.urge)
  ) {
    return null;
  }

  const date = isDateString(input.date) ? input.date : getLocalDateString();
  const now = new Date().toISOString();
  let savedCheckIn: DailyCheckIn | null = null;

  updateState((state) => {
    const existing = state.checkIns.find((checkIn) => checkIn.date === date);
    const nextCheckIn: DailyCheckIn = {
      id: existing?.id ?? createId('checkin'),
      date,
      mood: input.mood,
      urge: input.urge ?? null,
      recordedAt: now,
    };
    savedCheckIn = nextCheckIn;

    return {
      ...state,
      checkIns: [
        nextCheckIn,
        ...state.checkIns.filter((checkIn) => checkIn.date !== date),
      ].slice(0, MAX_CHECK_INS),
    };
  });

  if (savedCheckIn) {
    const chk = savedCheckIn as DailyCheckIn;
    apiClient('/check-ins', {
      method: 'POST',
      body: JSON.stringify({
        mood_score: chk.mood,
        urge_score: chk.urge ?? 0,
        context_text: ''
      })
    }).catch(() => {});
  }

  return savedCheckIn;
}

export function selectMissionAlternative(
  missionNumber: MissionNumber,
  date = getLocalDateString()
): SelectedMissionAlternative | null {
  if (!isMissionNumber(missionNumber) || !isDateString(date)) return null;

  const selectedMission: SelectedMissionAlternative = {
    date,
    missionNumber,
    selectedAt: new Date().toISOString(),
  };

  updateState((state) => ({
    ...state,
    selectedMissions: [
      selectedMission,
      ...state.selectedMissions.filter((mission) => mission.date !== date),
    ].slice(0, MAX_SELECTED_MISSIONS),
  }));

  return selectedMission;
}

export function saveWeeklyReview(
  input: SaveWeeklyReviewInput
): WeeklyReview | null {
  if (
    (input.outcome !== undefined &&
      input.outcome !== null &&
      !WEEKLY_OUTCOMES.has(input.outcome)) ||
    !WEEKLY_HELPFUL_ACTIONS.has(input.helpfulAction) ||
    !WEEKLY_ADJUSTMENTS.has(input.adjustment)
  ) {
    return null;
  }
  if (
    input.nextMissionNumber !== undefined &&
    input.nextMissionNumber !== null &&
    !isMissionNumber(input.nextMissionNumber)
  ) {
    return null;
  }
  if (
    input.selectedSkillId !== undefined &&
    input.selectedSkillId !== null &&
    !SKILL_IDS.has(input.selectedSkillId)
  ) {
    return null;
  }

  const weekStart = isDateString(input.weekStart)
    ? input.weekStart
    : getLocalWeekStartString();
  const now = new Date().toISOString();
  let savedReview: WeeklyReview | null = null;

  updateState((state) => {
    const existing = state.weeklyReviews.find(
      (review) => review.weekStart === weekStart
    );
    const activeIntention = state.intentions.find(
      (intention) => intention.status === 'active'
    );
    const requestedIntentionId = input.intentionId;
    let intentionId = activeIntention?.id ?? null;
    if (requestedIntentionId === null) {
      intentionId = null;
    } else if (
      requestedIntentionId !== undefined &&
      state.intentions.some(
        (intention) => intention.id === requestedIntentionId
      )
    ) {
      intentionId = requestedIntentionId;
    }

    const nextReview: WeeklyReview = {
      id: existing?.id ?? createId('review'),
      weekStart,
      intentionId,
      outcome: input.outcome ?? null,
      helpfulAction: input.helpfulAction,
      adjustment: input.adjustment,
      nextMissionNumber: input.nextMissionNumber ?? null,
      selectedSkillId: input.selectedSkillId ?? null,
      reviewedAt: now,
    };
    savedReview = nextReview;

    return {
      ...state,
      weeklyReviews: [
        nextReview,
        ...state.weeklyReviews.filter(
          (review) => review.weekStart !== weekStart
        ),
      ].slice(0, MAX_WEEKLY_REVIEWS),
    };
  });

  return savedReview;
}

export function clearRecoveryData(): void {
  currentState = createEmptyRecoveryState();

  if (typeof window !== 'undefined') {
    try {
      window.localStorage.removeItem(RECOVERY_STORAGE_KEY);
      for (const key of LEGACY_STORAGE_KEYS) {
        window.localStorage.removeItem(key);
      }
      persistence = 'local';
    } catch {
      persistence = 'memory';
    }
  }

  emitChange();
}

export function hydrateFromServer(intentions: RecoveryIntention[], checkIns: DailyCheckIn[]): void {
  updateState((state) => {
    // Only hydrate if local state is empty to prevent overwriting un-synced local changes
    // A robust conflict resolution is needed for true multi-device sync, but for prototype,
    // this covers the "cross-device persistence on fresh login" gap.
    
    let nextIntentions = state.intentions;
    let nextHistory = state.intentionHistory;
    if (state.intentions.length === 0 && intentions.length > 0) {
      nextIntentions = intentions;
      nextHistory = intentions.map((i) => createHistoryEvent(i.id, 'created', i.createdAt));
    }
    
    let nextCheckIns = state.checkIns;
    if (state.checkIns.length === 0 && checkIns.length > 0) {
      nextCheckIns = checkIns;
    }
    
    return {
      ...state,
      intentions: nextIntentions,
      intentionHistory: nextHistory,
      checkIns: nextCheckIns,
    };
  });
}

function updateState(updater: (state: RecoveryState) => RecoveryState): void {
  const nextState = updater(currentState);
  if (nextState === currentState) return;

  currentState = nextState;
  persistCurrentState();
  emitChange();
}

function persistCurrentState(): void {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(
      RECOVERY_STORAGE_KEY,
      JSON.stringify(currentState)
    );
    persistence = 'local';
  } catch {
    persistence = 'memory';
  }
}

function loadInitialClientState(): RecoveryState {
  try {
    persistence = 'local';
    const stored = window.localStorage.getItem(RECOVERY_STORAGE_KEY);
    if (stored) {
      return parseRecoveryState(stored) ?? createEmptyRecoveryState();
    }

    const legacyIntention = normalizeText(
      window.localStorage.getItem('gamblock_intention'),
      MAX_INTENTION_LENGTH
    );
    if (!legacyIntention) return createEmptyRecoveryState();

    const now = new Date().toISOString();
    const targetDays = Number(
      window.localStorage.getItem('gamblock_target_days')
    );
    const intention: RecoveryIntention = {
      id: createId('int'),
      title: legacyIntention,
      nextAction: '',
      focusPeriod: focusPeriodFromDays(targetDays),
      status: 'active',
      createdAt: now,
      updatedAt: now,
    };
    const migrated: RecoveryState = {
      ...createEmptyRecoveryState(),
      intentions: [intention],
      intentionHistory: [createHistoryEvent(intention.id, 'created', now)],
    };

    window.localStorage.setItem(RECOVERY_STORAGE_KEY, JSON.stringify(migrated));
    for (const key of LEGACY_STORAGE_KEYS) {
      window.localStorage.removeItem(key);
    }
    return migrated;
  } catch {
    persistence = 'memory';
    return createEmptyRecoveryState();
  }
}

function handleStorageEvent(event: StorageEvent): void {
  if (event.key !== RECOVERY_STORAGE_KEY) return;

  if (event.newValue === null) {
    currentState = createEmptyRecoveryState();
  } else {
    const nextState = parseRecoveryState(event.newValue);
    if (!nextState) return;
    currentState = nextState;
  }

  persistence = 'local';
  emitChange();
}

function emitChange(): void {
  for (const listener of listeners) listener();
}

function parseRecoveryState(raw: string): RecoveryState | null {
  try {
    const value: unknown = JSON.parse(raw);
    if (!isRecord(value) || value.version !== RECOVERY_STORAGE_VERSION) {
      return null;
    }

    return {
      version: RECOVERY_STORAGE_VERSION,
      intentions: ensureSingleActiveIntention(
        readIntentions(value.intentions)
      ).slice(0, MAX_INTENTIONS),
      intentionHistory: readIntentionHistory(value.intentionHistory).slice(
        0,
        MAX_INTENTION_EVENTS
      ),
      checkIns: readCheckIns(value.checkIns).slice(0, MAX_CHECK_INS),
      selectedMissions: readSelectedMissions(value.selectedMissions).slice(
        0,
        MAX_SELECTED_MISSIONS
      ),
      weeklyReviews: readWeeklyReviews(value.weeklyReviews).slice(
        0,
        MAX_WEEKLY_REVIEWS
      ),
    };
  } catch {
    return null;
  }
}

function readIntentions(value: unknown): RecoveryIntention[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((entry): RecoveryIntention[] => {
    if (!isRecord(entry)) return [];
    const id = readId(entry.id);
    const title = normalizeText(entry.title, MAX_INTENTION_LENGTH);
    const nextAction = normalizeText(entry.nextAction, MAX_NEXT_ACTION_LENGTH);
    if (
      !id ||
      !title ||
      !isFocusPeriod(entry.focusPeriod) ||
      !isIntentionStatus(entry.status) ||
      !isTimestamp(entry.createdAt) ||
      !isTimestamp(entry.updatedAt)
    ) {
      return [];
    }

    return [
      {
        id,
        title,
        nextAction,
        focusPeriod: entry.focusPeriod,
        status: entry.status,
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt,
      },
    ];
  });
}

function readIntentionHistory(value: unknown): IntentionHistoryEvent[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((entry): IntentionHistoryEvent[] => {
    if (!isRecord(entry)) return [];
    const id = readId(entry.id);
    const intentionId = readId(entry.intentionId);
    if (
      !id ||
      !intentionId ||
      !isIntentionEventType(entry.type) ||
      !isTimestamp(entry.occurredAt)
    ) {
      return [];
    }

    return [
      {
        id,
        intentionId,
        type: entry.type,
        occurredAt: entry.occurredAt,
      },
    ];
  });
}

function ensureSingleActiveIntention(
  intentions: RecoveryIntention[]
): RecoveryIntention[] {
  let activeFound = false;

  return intentions.map((intention) => {
    if (intention.status !== 'active') return intention;
    if (!activeFound) {
      activeFound = true;
      return intention;
    }
    return { ...intention, status: 'paused' };
  });
}

function readCheckIns(value: unknown): DailyCheckIn[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((entry): DailyCheckIn[] => {
    if (!isRecord(entry)) return [];
    const id = readId(entry.id);
    if (
      !id ||
      !isDateString(entry.date) ||
      !isMoodLevel(entry.mood) ||
      (entry.urge !== null && !isUrgeLevel(entry.urge)) ||
      !isTimestamp(entry.recordedAt)
    ) {
      return [];
    }

    return [
      {
        id,
        date: entry.date,
        mood: entry.mood,
        urge: entry.urge,
        recordedAt: entry.recordedAt,
      },
    ];
  });
}

function readSelectedMissions(value: unknown): SelectedMissionAlternative[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((entry): SelectedMissionAlternative[] => {
    if (
      !isRecord(entry) ||
      !isDateString(entry.date) ||
      !isMissionNumber(entry.missionNumber) ||
      !isTimestamp(entry.selectedAt)
    ) {
      return [];
    }

    return [
      {
        date: entry.date,
        missionNumber: entry.missionNumber,
        selectedAt: entry.selectedAt,
      },
    ];
  });
}

function readWeeklyReviews(value: unknown): WeeklyReview[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((entry): WeeklyReview[] => {
    if (!isRecord(entry)) return [];
    const id = readId(entry.id);
    const intentionId =
      entry.intentionId === null ? null : readId(entry.intentionId);
    const nextMissionNumber =
      entry.nextMissionNumber === null ? null : entry.nextMissionNumber;
    const selectedSkillId =
      entry.selectedSkillId === null ? null : entry.selectedSkillId;

    if (
      !id ||
      !isDateString(entry.weekStart) ||
      (entry.intentionId !== null && !intentionId) ||
      (entry.outcome !== null && !isWeeklyOutcome(entry.outcome)) ||
      !isWeeklyHelpfulAction(entry.helpfulAction) ||
      !isWeeklyAdjustment(entry.adjustment) ||
      (nextMissionNumber !== null && !isMissionNumber(nextMissionNumber)) ||
      (selectedSkillId !== null && !isSkillId(selectedSkillId)) ||
      !isTimestamp(entry.reviewedAt)
    ) {
      return [];
    }

    return [
      {
        id,
        weekStart: entry.weekStart,
        intentionId,
        outcome: entry.outcome,
        helpfulAction: entry.helpfulAction,
        adjustment: entry.adjustment,
        nextMissionNumber,
        selectedSkillId,
        reviewedAt: entry.reviewedAt,
      },
    ];
  });
}

function createHistoryEvent(
  intentionId: string,
  type: IntentionHistoryEventType,
  occurredAt: string
): IntentionHistoryEvent {
  return {
    id: createId('int_event'),
    intentionId,
    type,
    occurredAt,
  };
}

function createId(prefix: string): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return `${prefix}_${globalThis.crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

function focusPeriodFromDays(days: number): IntentionFocusPeriod {
  if (!Number.isFinite(days) || days > 14) return 'one_month';
  if (days <= 1) return 'today';
  if (days <= 7) return 'this_week';
  return 'two_weeks';
}

function normalizeText(value: unknown, maxLength: number): string {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function readId(value: unknown): string {
  return typeof value === 'string' ? value.slice(0, 120) : '';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isDateString(value: unknown): value is string {
  if (typeof value !== 'string' || !DATE_PATTERN.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00`);
  return !Number.isNaN(parsed.getTime()) && getLocalDateString(parsed) === value;
}

function isTimestamp(value: unknown): value is string {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value));
}

function isMoodLevel(value: unknown): value is MoodLevel {
  return (
    typeof value === 'number' &&
    Number.isInteger(value) &&
    value >= 1 &&
    value <= 5
  );
}

function isUrgeLevel(value: unknown): value is UrgeLevel {
  return isMoodLevel(value);
}

function isMissionNumber(value: unknown): value is MissionNumber {
  return isMoodLevel(value);
}

function isIntentionStatus(value: unknown): value is IntentionStatus {
  return (
    typeof value === 'string' &&
    INTENTION_STATUSES.has(value as IntentionStatus)
  );
}

function isIntentionEventType(
  value: unknown
): value is IntentionHistoryEventType {
  return (
    typeof value === 'string' &&
    INTENTION_EVENT_TYPES.has(value as IntentionHistoryEventType)
  );
}

function isFocusPeriod(value: unknown): value is IntentionFocusPeriod {
  return (
    typeof value === 'string' &&
    FOCUS_PERIODS.has(value as IntentionFocusPeriod)
  );
}

function isWeeklyOutcome(value: unknown): value is WeeklyOutcome {
  return (
    typeof value === 'string' && WEEKLY_OUTCOMES.has(value as WeeklyOutcome)
  );
}

function isWeeklyAdjustment(value: unknown): value is WeeklyAdjustment {
  return (
    typeof value === 'string' &&
    WEEKLY_ADJUSTMENTS.has(value as WeeklyAdjustment)
  );
}

function isWeeklyHelpfulAction(value: unknown): value is WeeklyHelpfulAction {
  return (
    typeof value === 'string' &&
    WEEKLY_HELPFUL_ACTIONS.has(value as WeeklyHelpfulAction)
  );
}

function isSkillId(value: unknown): value is SkillId {
  return typeof value === 'string' && SKILL_IDS.has(value as SkillId);
}
