# Design System: Crimson Academy

## 1. Visual Theme & Atmosphere

Crimson Academy is an academic product interface inspired by a carefully annotated
workbook, not a generic school dashboard. It should feel calm, credible, tactile,
and focused on helping students make measurable progress.

- Design variance: 6/10. Use controlled asymmetry and varied content proportions.
- Motion intensity: 4/10. Motion explains hierarchy and gives tactile feedback.
- Visual density: 6/10. Product screens are information-rich but never cramped.
- Theme lock: each selected theme stays consistent across the entire application.
- Shape rule: 16px primary surfaces, 12px controls, full-pill only for compact status.

## 2. Color Palette & Roles

### Crimson Theme

- **Chalk Canvas** (`#F2EFE7`): primary page background.
- **Cream Surface** (`#FAF9F6`): cards, dialogs, and raised content.
- **Charcoal Ink** (`#1A1814`): primary text. Never use pure black.
- **Stone Copy** (`#625D55`): secondary text and descriptions.
- **Chalk Rule** (`rgba(26, 24, 20, 0.12)`): borders and dividers.
- **Crimson Action** (`#DC143C`): the only accent, used for primary actions, focus,
  active navigation, and meaningful highlights.

### Garden Theme

- **Garden Canvas** (`#F4FAF0`): primary page background.
- **Garden Surface** (`#FFFFFF`): cards, dialogs, and raised content.
- **Charcoal Ink** (`#1A1814`): primary text.
- **Forest Copy** (`#52665B`): secondary text and descriptions.
- **Garden Rule** (`rgba(34, 67, 52, 0.16)`): borders and dividers.
- **Forest Action** (`#224334`): the only accent.

Feedback colors are semantic exceptions only: green for correct/success, amber for
warning or sync, and red for errors or incorrect answers.

## 3. Typography Rules

- **Display:** Playfair Display, 600-800 weight, tight tracking, 1.08-1.18 line height.
  Use for short page titles and meaningful academic headings only.
- **Body and UI:** Space Grotesk, 400-600 weight, relaxed line height, maximum 65ch.
- **Data:** JetBrains Mono with tabular figures for scores, timers, ranks, and dates.
- Use sentence case for headings and controls. Reserve uppercase tracking for rare
  metadata labels, no more than one per major content region.
- Avoid text smaller than 12px for essential information.

## 4. Component Stylings

- **Buttons:** minimum 44px touch target, 12px radius, strong focus ring, one primary
  action per region, and a subtle pressed state using scale or vertical translation.
- **Cards:** use elevation only for major hierarchy. Default surfaces use a soft border
  and tinted shadow. Accent offset shadows are reserved for one featured surface.
- **Inputs:** label above, helper or error below, cream surface, clear accent focus ring.
- **Status:** compact pill allowed only for sync, role, score, and state information.
- **Loading:** use skeletons matching the final layout. Avoid circular spinners except
  inside a compact action control.
- **Empty states:** explain why the state is empty and provide one clear next action.
- **Errors:** direct Vietnamese copy, placed inline near the failed action.

## 5. Layout Principles

- Use a max-width of 1400px and responsive CSS Grid.
- Desktop product shell uses a left navigation rail. Mobile uses a fixed top identity
  bar and a fixed bottom destination bar.
- Collapse all multi-column content to one column below 768px.
- Use asymmetric bento layouts only when card size communicates importance.
- Avoid nested cards. Use spacing, dividers, and subtle surface shifts inside cards.
- Use `min-height: 100dvh`, never `100vh`.
- Keep essential actions visible without horizontal scrolling at 375px.

## 6. Motion & Interaction

- Default timing: 180-300ms with premium ease or restrained spring physics.
- Animate only `transform` and `opacity`.
- Use staggered entry only for small related groups.
- Respect `prefers-reduced-motion`; remove decorative movement and blur transitions.
- Never use perpetual motion unless it communicates a live state such as syncing.
- Navigation, buttons, cards, and form controls need hover, active, and focus states.

## 7. Stitch Screen Generation Rules

- Preserve Crimson Academy navigation labels, route intent, and Vietnamese copy style.
- Generate product screens, not marketing landing pages.
- Prefer a clear page title, one primary action, and a varied two-column workspace.
- Show realistic educational data and natural scores, dates, and durations.
- Include loading, empty, error, offline, and completed states where relevant.
- For teacher screens, prioritize scanability and batch actions.
- For student screens, prioritize the next best action and visible progress.

## 8. Anti-Patterns

- No purple or blue neon gradients.
- No pure black, outer glow, excessive glassmorphism, or random dark sections.
- No centered hero for product screens.
- No three equal feature cards.
- No decorative technical labels, fake logs, or meaningless live indicators.
- No card inside card inside card.
- No emoji, generic placeholder names, fake round metrics, or AI copy cliches.
- No duplicate primary actions in the same visual region.
- No tiny essential text, wrapped desktop CTA labels, or hidden keyboard focus.

