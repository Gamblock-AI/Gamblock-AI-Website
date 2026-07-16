# Gamblock-AI Recovery Dashboard Design System

This file extends the authoritative product and UI context in `../context/`.
If this document conflicts with the PKM proposal or a repository context file,
the proposal and repository context win.

## Experience principle

The dashboard is a calm daily recovery workspace for Indonesian students. It
must feel supportive, private, and practical. It is not a security operations
center, productivity scoreboard, or surveillance console.

The default journey is:

1. remember the user's intention;
2. make a private mood and urge check-in;
3. complete one realistic daily mission;
4. learn one recommended coping skill and understand why it was suggested;
5. review the week without punishment or shame.

## Visual direction

- Light-first editorial utility with generous whitespace and a clear reading
  order.
- Dashboard pages reuse the same cyan-blue `bg-mesh` background as public and
  authentication surfaces. Product panels remain solid enough to keep text,
  controls, and state boundaries clearly legible.
- Plus Jakarta Sans for all interface typography. Use weight and size, not a
  second decorative font, to create hierarchy.
- Navy `#16294C` is the primary action and trust color.
- Cyan and azure are quiet informational accents and page washes. They do not
  fill routine reading cards or large dashboard workspaces.
- Sage `#2F9E6F` means completion, stability, and supportive progress.
- Amber is reserved for gentle attention.
- Crimson is reserved for destructive or genuinely critical states. Never use
  it as a routine progress, navigation, or motivational color.
- White and near-white surfaces use one-pixel neutral-cool borders and soft
  functional shadows. Reserve full-color navy, sage, amber, and crimson for
  compact icon tiles, status marks, and actions so the interface has contrast
  without turning whole cards into pastel blocks. Card shells never use a
  colored left-edge accent. Neutral card identity icons use navy; sage, amber,
  and crimson icon tiles are reserved for confirmed progress, attention, and
  critical states. No neumorphism, glass stacks, gradients on controls, or
  nested card towers.
- Use the canonical Gami mascot sparingly for reassurance, empty states, and
  onboarding. Gami must never shame, celebrate blocked attempts, or imitate a
  gambling reward.

## Type scale

| Role | Desktop | Mobile | Weight |
| --- | --- | --- | --- |
| Page title | 30-36px | 26-30px | 700-800 |
| Section title | 18-22px | 18-20px | 700 |
| Card title | 15-17px | 15-17px | 700 |
| Body | 14-16px | 14-16px | 400-500 |
| Supporting text | 12-14px | 12-14px | 400-500 |
| Eyebrow | 11-12px | 11-12px | 700, restrained uppercase |

Body copy uses a line height of 1.5 or greater. Avoid all-caps headings and
avoid placeholder text as the only label.

## Spacing and shape

- Base spacing unit: 4px.
- Common gaps: 8, 12, 16, 24, 32, and 40px.
- Main content maximum width: 1280px.
- Page padding: 20px mobile, 28px tablet, 32px desktop.
- Primary panel radius: 24px.
- Secondary surface radius: 16-20px.
- Buttons and inputs: 12-16px radius, minimum 44px hit target.
- Keep at least 24px between major sections. Prefer section dividers and
  whitespace over wrapping every group in another card.
- Panel and notice headers place the icon, title, and compact status in the
  first row. Descriptions sit below that row and use the panel width so icons
  and status controls do not squeeze body copy into a narrow column.

## Interaction

- One primary action per panel. Secondary actions are quieter text or outline
  controls.
- Every interactive element has a visible keyboard focus ring and a complete
  hover, active, disabled, loading, success, and error state where applicable.
- Motion is short and functional: 160-240ms opacity or small translate changes.
  Clickable cards may lift by at most one pixel. No count-up KPIs, pulsing
  alerts, bouncing cards, or layout-shifting hover.
- Honor `prefers-reduced-motion` and never make comprehension depend on motion.
- Avoid icon-only controls unless the icon is universal and has an accessible
  name.
- Card-leading icons use a consistent 40px rounded tile with an 18-20px Lucide
  icon. Avoid unframed decorative icons and mixing circular, square, and
  oversized icon treatments at the same hierarchy.
- Locale selection is an equal-width segmented control: both choices retain
  the same bounds, while only the selected locale receives the solid active
  fill.

## Data and privacy presentation

- Show only aggregate protection status and recovery activity.
- Never display URL, domain, DOM text, browsing history, or a timeline of sites.
- Mood, urge, intention, and journal content are private to the user. Do not
  expose them in partner or organization views.
- Do not invent trends, percentages, system uptime, mission completion, or
  recommendations. Show a meaningful empty or insufficient-data state.
- Explain recommendation inputs in plain language and provide another option.
- Communicate local-only storage next to sensitive controls, not solely in a
  distant privacy page.

## Responsive shell

- Desktop: persistent 248px navigation rail and a 64px quiet top bar.
- Tablet: compact navigation rail or drawer with preserved labels.
- Mobile: compact header plus a maximum of five bottom navigation destinations;
  remaining destinations live in a clearly labeled menu.
- Search uses a labeled command-field trigger on desktop and a 44px icon
  trigger on smaller screens. Both open the same keyboard-accessible dialog.
- No essential action may sit behind hover. No content may be obscured by the
  sticky header or bottom navigation.

## Required states

Every data-backed surface must support loading, empty, error with retry, and
success. Recovery actions also need safe partial-data states: “belum cukup data”
is preferable to a fabricated chart or insight.

## Forbidden patterns

- Security-operations dashboards for the student experience.
- Blocked-site category charts or intervention timelines containing browsing
  details.
- Fake precision such as static 99.8% effectiveness.
- Punitive streaks, streak resets, leaderboards, confetti, badges, or casino-like
  reward loops.
- Excessive cards, nested cards, gradient controls, glassmorphism, neumorphism,
  decorative 3D, neon, or heavy shadows.
- Crimson active navigation and routine red status dots.
- Shaming, alarmist, or moralizing language.
- Emoji used as the sole accessible label for an action.

## Delivery checklist

- Check 375, 768, 1024, and 1440px layouts.
- Check keyboard order, visible focus, semantic labels, and 4.5:1 text contrast.
- Check long Indonesian and English labels without truncating essential meaning.
- Check loading, empty, error, retry, saved, and unsaved states.
- Check reduced motion and 200% zoom.
- Check all displayed data against a real API contract or clearly labeled local
  state.
- Check privacy copy wherever sensitive recovery data is entered or summarized.
