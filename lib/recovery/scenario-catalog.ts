import { MessageCircleWarning, Smartphone, Wallet, type LucideIcon } from 'lucide-react';

/**
 * Student-facing response-practice scenarios. Hardcoded (not CMS) because the
 * education library is reserved for reviewed clinical revisions — this is a
 * supporting skills exercise, explicitly framed as fictional. Strings live in
 * the `scenarioSim` namespace; only structure lives here. No scoring, no
 * failure states, no server writes.
 */
export type ScenarioId = 'friend_invite' | 'judol_ad' | 'pinjol';

export interface ScenarioChoice {
  /** Choice number in the i18n keys (choice1..3 / outcome1..3). */
  index: 1 | 2 | 3;
  /** The assertive-refusal choice gets an affirming outcome. */
  kind: 'assertive' | 'risky' | 'delay';
}

export interface Scenario {
  id: ScenarioId;
  icon: LucideIcon;
  choices: readonly [ScenarioChoice, ScenarioChoice, ScenarioChoice];
}

export const SCENARIOS: readonly Scenario[] = [
  {
    id: 'friend_invite',
    icon: MessageCircleWarning,
    choices: [
      { index: 1, kind: 'assertive' },
      { index: 2, kind: 'risky' },
      { index: 3, kind: 'delay' },
    ],
  },
  {
    id: 'judol_ad',
    icon: Smartphone,
    choices: [
      { index: 1, kind: 'risky' },
      { index: 2, kind: 'assertive' },
      { index: 3, kind: 'delay' },
    ],
  },
  {
    id: 'pinjol',
    icon: Wallet,
    choices: [
      { index: 1, kind: 'delay' },
      { index: 2, kind: 'risky' },
      { index: 3, kind: 'assertive' },
    ],
  },
] as const;
