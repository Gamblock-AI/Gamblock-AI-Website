import {
  Armchair,
  CalendarDays,
  Clock,
  Coffee,
  Droplets,
  Fish,
  Flower2,
  Frame,
  HandHeart,
  LampDesk,
  Layers,
  Leaf,
  Library,
  Lightbulb,
  NotebookPen,
  Palette,
  Radio,
  RectangleHorizontal,
  Sparkles,
  Waves,
  type LucideIcon,
} from 'lucide-react';
import type { RecoveryRoomTheme } from '@/hooks/use-recovery-experience';

/**
 * Display mirror of the server's recovery-space progression rules
 * (`internal/service/unlock_rules.go`, rule version 2). The backend stays
 * authoritative for unlock state and placement validation; this catalog only
 * renders names, criteria, icons, and slot positions. Criteria are always
 * visible — no mystery boxes.
 */
export type DecorSlotId =
  | 'wall_left'
  | 'wall_center'
  | 'wall_right'
  | 'desk'
  | 'shelf'
  | 'window_sill'
  | 'floor_left'
  | 'floor_center'
  | 'floor_right';

export type DecorCriteria =
  | { kind: 'practiceKind'; value: 'grounding_54321' | 'urge_surfing' | 'focus_sprint' }
  | { kind: 'journal' }
  | { kind: 'reviews'; value: number }
  | { kind: 'practices'; value: number }
  | { kind: 'activeDays'; value: number }
  | { kind: 'missions'; value: number }
  | { kind: 'level'; value: number };

export interface DecorCatalogItem {
  id: string;
  icon: LucideIcon;
  criteria: DecorCriteria;
  /** Allowed placement slots; the first entry is the default (`true`). */
  slots: readonly DecorSlotId[];
}

export const DECOR_SLOT_POSITIONS: Record<DecorSlotId, string> = {
  wall_left: 'left-[25%] top-[28%]',
  wall_center: 'left-[45%] top-[20%]',
  wall_right: 'left-[70%] top-[33%]',
  desk: 'left-[80%] top-[47%]',
  shelf: 'left-[62%] top-[40%]',
  window_sill: 'left-[45%] top-[18%]',
  floor_left: 'left-[20%] top-[57%]',
  floor_center: 'left-[50%] top-[78%]',
  floor_right: 'left-[62%] top-[72%]',
};

export const DECOR_CATALOG: readonly DecorCatalogItem[] = [
  // Rule-version 1 items (criteria unchanged).
  { id: 'plant', icon: Leaf, criteria: { kind: 'practiceKind', value: 'grounding_54321' }, slots: ['floor_left', 'window_sill', 'shelf'] },
  { id: 'curtain', icon: Waves, criteria: { kind: 'practiceKind', value: 'urge_surfing' }, slots: ['window_sill'] },
  { id: 'desk_lamp', icon: LampDesk, criteria: { kind: 'practiceKind', value: 'focus_sprint' }, slots: ['desk', 'shelf'] },
  { id: 'note_board', icon: NotebookPen, criteria: { kind: 'journal' }, slots: ['wall_left', 'wall_center', 'wall_right'] },
  { id: 'wall_art', icon: Sparkles, criteria: { kind: 'reviews', value: 1 }, slots: ['wall_center', 'wall_left', 'wall_right'] },
  { id: 'gami_figure', icon: HandHeart, criteria: { kind: 'activeDays', value: 5 }, slots: ['shelf', 'desk', 'window_sill'] },
  // Rule-version 2: tiered participation rewards.
  { id: 'cushion', icon: Armchair, criteria: { kind: 'practices', value: 5 }, slots: ['floor_center', 'floor_left', 'floor_right'] },
  { id: 'zen_tray', icon: Flower2, criteria: { kind: 'practices', value: 15 }, slots: ['desk', 'shelf'] },
  { id: 'fountain_mini', icon: Droplets, criteria: { kind: 'practices', value: 30 }, slots: ['shelf', 'window_sill'] },
  { id: 'photo_frame', icon: Frame, criteria: { kind: 'activeDays', value: 10 }, slots: ['desk', 'shelf', 'wall_right'] },
  { id: 'wall_clock', icon: Clock, criteria: { kind: 'activeDays', value: 25 }, slots: ['wall_right', 'wall_left'] },
  { id: 'calendar_wall', icon: CalendarDays, criteria: { kind: 'reviews', value: 3 }, slots: ['wall_left', 'wall_right'] },
  { id: 'desk_organizer', icon: Layers, criteria: { kind: 'missions', value: 10 }, slots: ['desk'] },
  // Rule-version 2: level-gated rewards.
  { id: 'poster_calm', icon: Palette, criteria: { kind: 'level', value: 2 }, slots: ['wall_right', 'wall_left', 'wall_center'] },
  { id: 'mug_warm', icon: Coffee, criteria: { kind: 'level', value: 3 }, slots: ['desk', 'shelf'] },
  { id: 'rug_soft', icon: RectangleHorizontal, criteria: { kind: 'level', value: 4 }, slots: ['floor_center'] },
  { id: 'bookshelf_mini', icon: Library, criteria: { kind: 'level', value: 6 }, slots: ['floor_right', 'floor_left'] },
  { id: 'string_lights', icon: Lightbulb, criteria: { kind: 'level', value: 8 }, slots: ['wall_center', 'window_sill'] },
  { id: 'radio_lofi', icon: Radio, criteria: { kind: 'level', value: 12 }, slots: ['shelf', 'desk'] },
  { id: 'aquarium_mini', icon: Fish, criteria: { kind: 'level', value: 16 }, slots: ['shelf', 'desk'] },
] as const;

const CATALOG_BY_ID = new Map(DECOR_CATALOG.map((item) => [item.id, item]));

export function decorCatalogItem(id: string): DecorCatalogItem | undefined {
  return CATALOG_BY_ID.get(id);
}

export function decorIcon(id: string): LucideIcon {
  return CATALOG_BY_ID.get(id)?.icon ?? Sparkles;
}

/** Resolve a stored placement value (`true` or a slot id) to a slot. */
export function decorSlot(id: string, value: unknown): DecorSlotId | null {
  const item = CATALOG_BY_ID.get(id);
  if (!item || !value) return null;
  if (typeof value === 'string' && (item.slots as readonly string[]).includes(value)) {
    return value as DecorSlotId;
  }
  return item.slots[0];
}

export const ROOM_THEME_IMAGES: Record<RecoveryRoomTheme, string> = {
  dorm_room: '/images/recovery-room/calm-dorm-room.webp',
  sunrise_study: '/images/recovery-room/sunrise-study.webp',
};
