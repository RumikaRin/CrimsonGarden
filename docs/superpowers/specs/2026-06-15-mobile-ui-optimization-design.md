# Mobile UI Optimization Design

## Goal

Optimize Crimson Academy for 375px mobile screens while preserving desktop behavior and all existing learning workflows.

## Scope

The first mobile optimization pass covers:

- Shared dashboard shell and navigation
- Student home page
- Exam selection and active exam experience
- Quick Quiz
- Vocabulary Snake

Other dashboard pages inherit the improved shell spacing and navigation but are not redesigned in this pass.

## Design Direction

Use a content-first mobile layout. Fixed interface chrome must stay compact so learning content receives most of the viewport. Preserve the Crimson and Chalk visual system, Lucide icons, rounded-xl controls, and 44px minimum touch targets.

## Shared Mobile Shell

- Do not render a mobile header, sidebar, or drawer; the bottom navigation is the only mobile navigation surface.
- Keep five primary destinations in the bottom navigation.
- Respect device safe areas at the top and bottom.
- Ensure page content is never hidden behind fixed navigation.
- Use consistent horizontal gutters and vertical spacing across dashboard pages.
- Keep desktop sidebar and desktop page layouts unchanged.

## Home Page

- Reduce the visual hero height on mobile.
- Keep the primary message and next action visible without excessive scrolling.
- Present metrics as compact scan-friendly rows or tiles.
- Make activity cards shorter while preserving labels and actions.
- Keep recent activity rows readable without horizontal overflow.

## Exam Experience

### Exam Selection

- Keep settings accessible without displacing the page heading.
- Use full-width exam cards and clear primary actions.

### Active Exam

- Make the question card the primary mobile surface.
- Add a compact sticky mobile status bar containing timer, progress, and question-grid access.
- Move secondary exam information and settings below the question on mobile.
- Keep the question grid available without forcing a permanently tall panel.
- Make previous and next actions easy to reach and prevent labels from overflowing.
- Preserve the existing three-column desktop exam layout.

## Quick Quiz

- Keep setup and result actions full-width on mobile.
- Ensure answer buttons have comfortable spacing and readable wrapping.
- Keep explanation and next-question actions close to the selected answer.

## Vocabulary Snake

- Prioritize the game canvas and current vocabulary prompt.
- Use compact two-column HUD metrics.
- Keep touch controls immediately below the canvas.
- Reduce nonessential vertical spacing and move secondary settings below gameplay.
- Preserve game mechanics and desktop layout.

## Accessibility And Interaction

- Minimum touch target: 44px.
- Maintain visible keyboard focus.
- Respect reduced motion.
- Avoid horizontal scrolling at 375px.
- Use safe-area insets for fixed navigation.
- Do not make color the only status indicator.

## Verification

- Run TypeScript validation with `npm run lint`.
- Run production build with `npm run build`.
- Verify key pages at 375px, 768px, and 1440px when browser automation is available.
- Confirm active exam controls and Snake touch controls remain usable.
