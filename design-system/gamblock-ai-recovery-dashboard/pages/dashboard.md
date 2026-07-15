# Dashboard Page Specification

This page specification overrides the master design system only where it is
more specific.

## Information architecture

### Student dashboard

1. Quiet greeting, one-sentence orientation, and compact protection status.
2. Primary “Hari ini” workspace with intention, private check-in, and one daily
   mission.
3. Explainable skill recommendation with a direct learning action and an option
   to choose a different skill.
4. Seven-day recovery review using voluntary, private inputs only. When fewer
   than three check-ins exist, show an insufficient-data state instead of a
   chart.
5. Small privacy reassurance and support link.

The intention and primary mission must be visible on a 768px-high laptop without
scrolling past a large decorative hero.

### Partner or organization dashboard

Show only aggregate operational information allowed by the current contracts:
member and active-device totals, aggregate mission completion, approvals, and
system status. Never show an individual's intention, mood, urge, journal,
browsing details, or inferred risk.

## Layout

- Desktop student view uses a 12-column grid. The “Hari ini” workspace occupies
  eight columns and the supporting rail occupies four.
- The primary workspace may use a subtle cool-blue wash to establish hierarchy;
  all nested controls remain flat.
- At tablet width the grid becomes one column with today, recommendation, and
  review in that order.
- At mobile width use edge-to-edge sections inside 20px page padding, full-width
  primary actions, and a fixed safe-area-aware bottom navigation.

## Primary components

- `TodayHeader`: greeting, date, truthful protection state, no fake notification.
- `IntentionPanel`: editable intention with explicit local/private storage copy.
- `PrivateCheckIn`: labeled mood and urge inputs, optional context tags, save
  confirmation, and no free-text browsing detail prompt.
- `DailyMission`: one primary mission, completion, skip/replace with a reason,
  and non-punitive language.
- `SkillRecommendation`: skill title, short practice, “why this fits”, evidence
  or review status, and another-option control.
- `WeeklyReview`: sufficient-data summary, calm micro-chart when warranted, and
  a reflective next-step prompt.
- `ProtectionSummary`: mode, runtime status, last sync, and model/rules version in
  a disclosure rather than dominant KPI cards.

## Content rules

- Use Indonesian plain language and address the user respectfully without
  infantilizing them.
- Prefer “Langkah berikutnya”, “Simpan check-in”, and “Pilih alternatif”.
- Never use “gagal”, “kalah”, or streak-reset language for a difficult day.
- State what is private and where it is stored before the user saves sensitive
  input.

## Visual hierarchy

- The strongest visual weight belongs to the next helpful action, not historical
  block counts.
- Use navy for primary actions, sage for completed states, cyan for informational
  context, amber for gentle caution, and crimson only for destructive actions.
- Charts use direct labels and no legends when a single series is shown.
- Keep the dashboard to three surface levels: page, primary panel, control row.

## Acceptance criteria

- A first-time user can understand what to do next in under five seconds.
- All proposal-core recovery actions are reachable from the dashboard.
- No fabricated values appear when the API is unavailable or the user has no
  history.
- Student-private recovery data never enters partner UI.
- Dashboard remains usable with keyboard, reduced motion, narrow screens, and
  long translated strings.
