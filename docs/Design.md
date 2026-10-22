# Edubits v2.0 — Design

Edubits adopts the supplied Linear-style reference (`DESIGN-edubits.md`) in place of its current look. Where the reference is silent or disagrees with your decisions, this doc says so. Items marked **(derived)** are mine, not from the reference, and need your review.

**Your overrides of the reference**
- Light mode is kept (the reference ships none).
- Font is Inter (the reference's recommended free substitute for its proprietary type).
- Single accent everywhere; per-tool colors are dropped.

## 1. Principles

- Dark-first, near-black canvas; hierarchy comes from a surface ladder and hairline borders, not shadows.
- One accent: lavender-blue, used only for the brand mark, the primary CTA, focus rings and link emphasis.
- Inter at weights 400, 500 and 600; display sizes use aggressive negative tracking.
- Compact controls: 8px radius, 14px labels, 8px × 14px button padding.
- No gradients, no spotlight cards, no decorative color.

## 2. Themes

- **Dark** is the default and the reference look.
- **Light** is optional and switched with `body.light` (the existing mechanism). Its values are **(derived)** from the reference's inverse tokens.
- Every color in components comes from a `var(--token)`; no raw hex outside the token blocks below.

## 3. Color tokens

| Role | CSS variable | Dark | Light **(derived)** |
|------|--------------|------|---------------------|
| Page background | `--bg` | `#010102` | `#ffffff` |
| Card / panel | `--surface` | `#0f1011` | `#f5f6f6` |
| Hovered / selected | `--surface-2` | `#141516` | `#eceeef` |
| Sub-nav / menus | `--surface-3` | `#18191a` | `#e6e8e9` |
| Deepest lift | `--surface-4` | `#191a1b` | `#e0e2e4` |
| Border | `--border` | `#23252a` | `#e3e5e8` |
| Strong border | `--border-strong` | `#34343a` | `#d2d5d9` |
| Nested border | `--border-tertiary` | `#3e3e44` | `#c4c7cc` |
| Primary text | `--text` | `#f7f8f8` | `#0f1011` |
| Secondary text | `--text-secondary` | `#d0d6e0` | `#3e3e44` |
| Muted text | `--muted` | `#8a8f98` | `#62666d` |
| Disabled / footnote | `--text-tertiary` | `#62666d` | `#8a8f98` |
| Accent | `--primary` | `#5e6ad2` | `#5e6ad2` |
| Accent hover | `--primary-hover` | `#828fff` | `#4c58bf` |
| Focus tint | `--primary-focus` | `#5e69d1` | `#5e69d1` |
| Text on accent | `--on-primary` | `#ffffff` | `#ffffff` |
| Inverse button | `--inverse-bg` / `--inverse-text` | `#ffffff` / `#000000` | `#0f1011` / `#ffffff` |
| Success | `--success` | `#27a644` | `#1a7f37` |
| Warning **(derived)** | `--warning` | `#e5a50a` | `#a16207` |
| Danger **(derived)** | `--danger` | `#e5484d` | `#cf222e` |
| Modal scrim | `--overlay` | `rgba(0,0,0,0.6)` | `rgba(0,0,0,0.6)` |

Semantic colors are used only for status: quiz right/wrong, Task Tracker states, form errors. The reference defines success only; warning and danger are added because "deadline near" and "deadline missed" need them.

Retired variables: `--sgpa-color` and `--cgpa-color` (no per-tool colors).

```css
:root {
  --bg: #010102;
  --surface: #0f1011;
  --surface-2: #141516;
  --surface-3: #18191a;
  --surface-4: #191a1b;
  --border: #23252a;
  --border-strong: #34343a;
  --border-tertiary: #3e3e44;
  --text: #f7f8f8;
  --text-secondary: #d0d6e0;
  --muted: #8a8f98;
  --text-tertiary: #62666d;
  --primary: #5e6ad2;
  --primary-hover: #828fff;
  --primary-focus: #5e69d1;
  --on-primary: #ffffff;
  --inverse-bg: #ffffff;
  --inverse-text: #000000;
  --success: #27a644;
  --warning: #e5a50a;
  --danger: #e5484d;
  --overlay: rgba(0, 0, 0, 0.6);
}

body.light {
  --bg: #ffffff;
  --surface: #f5f6f6;
  --surface-2: #eceeef;
  --surface-3: #e6e8e9;
  --surface-4: #e0e2e4;
  --border: #e3e5e8;
  --border-strong: #d2d5d9;
  --border-tertiary: #c4c7cc;
  --text: #0f1011;
  --text-secondary: #3e3e44;
  --muted: #62666d;
  --text-tertiary: #8a8f98;
  --primary-hover: #4c58bf;
  --inverse-bg: #0f1011;
  --inverse-text: #ffffff;
  --success: #1a7f37;
  --warning: #a16207;
  --danger: #cf222e;
}
```

## 4. Typography

**Families**
- Sans: `Inter, "SF Pro Display", -apple-system, system-ui, "Segoe UI", Roboto, sans-serif` → `--font-sans`
- Mono: `"JetBrains Mono", ui-monospace, "SF Mono", Menlo, monospace` → `--font-mono` (code only)

Display and text are one voice: Inter at 400, 500 and 600. Nothing above 600.

| Token | Size | Weight | Line height | Tracking | Use |
|-------|------|--------|-------------|----------|-----|
| display-xl | 80px | 600 | 1.05 | -3.0px | Homepage headline |
| display-lg | 56px | 600 | 1.10 | -1.8px | Section openers |
| display-md | 40px | 600 | 1.15 | -1.0px | Page titles |
| headline | 28px | 600 | 1.20 | -0.6px | Panel and banner headings |
| card-title | 22px | 500 | 1.25 | -0.4px | Card titles |
| subhead | 20px | 400 | 1.40 | -0.2px | Intro paragraphs |
| body-lg | 18px | 400 | 1.50 | -0.1px | Lead text |
| body | 16px | 400 | 1.50 | -0.05px | Default text |
| body-sm | 14px | 400 | 1.50 | 0 | Card body, nav, footer |
| caption | 12px | 400 | 1.40 | 0 | Meta, badges |
| button | 14px | 500 | 1.20 | 0 | All button labels |
| eyebrow | 13px | 500 | 1.30 | +0.4px | Section labels (positive tracking) |
| mono | 13px | 400 | 1.50 | 0 | Code and IDs |

On mobile, display-xl scales from 80px down to about 36px (toward display-md).

## 5. Spacing and shape

**Spacing (4px base):** xxs 4 · xs 8 · sm 12 · md 16 · lg 24 · xl 32 · xxl 48 · section 96. Cards pad 24px, testimonial-style cards 32px, banners 48px. Max content width about 1280px.

**Radius:** xs 4 (badges) · sm 6 (tags) · md 8 (buttons, inputs) · lg 12 (cards) · xl 16 (large panels) · xxl 24 (rare banners) · pill and full 9999 (tabs, status pills, avatars).

## 6. Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| 0 | No fill, no border | Body text, hero, footer |
| 1 | `--surface` + 1px `--border` | Cards, panels |
| 2 | `--surface-2` + 1px `--border-strong` | Hovered or featured cards |
| 3 | `--surface-3` | Dropdown menus, sub-nav |
| Focus | 2px `--primary-focus` outline at 50% opacity | Focused inputs and buttons |

No drop shadows. In dark mode, lifted panels may carry a faint white highlight on their top edge.

## 7. Components

| Component | Spec |
|-----------|------|
| Button, primary | `--primary` fill, `--on-primary` text, button type, 8px × 14px, radius md. Hover `--primary-hover`, pressed `--primary-focus` |
| Button, secondary | `--surface` fill, `--text`, 1px `--border`, same size and radius |
| Button, tertiary | No fill, `--text` |
| Button, inverse | `--inverse-bg` fill, `--inverse-text` |
| Buttons, general | Never pill-shaped; tap height at least 40px |
| Input, select, dropdown | `--surface` fill, `--text`, 1px `--border`, radius md, 8px × 12px, focus ring; at least 44px tall on touch |
| Card | `--surface`, 1px `--border`, radius lg, 24px padding; hover to `--surface-2` and `--border-strong` |
| Mini card **(derived)** | Card with 16px padding, for the SGPA/CGPA calculators |
| Large panel | `--surface`, radius xl, 24px padding; frames the PDF viewer and admin dashboard |
| Photo card **(derived)** | Card with the subject photo on top and no gradient overlay, title in card-title below, a status badge; photo at most 200 KB WebP |
| Pill tabs | Default: `--bg` fill, `--muted` text. Selected: `--surface-2` fill, `--text`. Radius pill, 6px × 14px, at least 36px tall (44px on touch). Used for Resources tabs and the quiz mode toggle |
| Status badge | `--surface-2` fill, `--text-secondary`, caption, radius pill, 2px × 8px |
| Status badge variants **(derived)** | Near: `--warning` text. Missed: `--danger` text. Done: `--success` text. Fill stays `--surface-2` |
| Top nav | `--bg`, 56px tall, sticky, body-sm; wordmark left, links centered, account actions right |
| Footer | `--bg`, `--muted` text, caption, 64px × 32px padding, dense link grid. Since 2026-10-22 it is one shared component (`HomeFooter.jsx`) rendered under both homepage views; the contributors page is `/people` |
| CTA banner | `--surface`, headline type, radius lg, 48px padding |
| Eyebrow label **(derived)** | caption-size label above a section title, uppercase, 0.4px tracking, `--muted`; used on the landing page |
| Preview frame **(derived)** | `--surface` + 1px `--border`, radius xl, 4px padding, image inside at radius lg and full width; holds product screenshots on the landing page |
| Proof strip **(derived)** | Row of big numbers (display-md, 600) with a `--muted` body-sm label, between 1px `--border` rules; no card, no fill |
| Feature row **(derived)** | Two columns (copy 1fr, preview frame 1.4fr) that alternate sides per row; one column under 768px with the copy first |

## 8. Screen patterns for v2.0 **(derived)**

- **Homepage, logged out (landing page, `decisions/5.md`):** display-xl headline and one value-proposition line; primary **Get started** and secondary **Continue with Google** (the secondary button stays neutral, brand color only inside the Google icon), then a "Log in" text link in `--primary`. Below: preview frame, proof strip, feature rows (Resources, QuizEngine) with the other tools as static cards, origin story, CTA banner that repeats the hero actions, footer. Tool cards are not links on this page because every tool is gated.
- **Homepage, logged in:** the headline greets the user by name, then two groups of cards: Exam prep (Resources, QuizEngine, featured size), then Other tools. No duplicate hero buttons.
- **Resources:** year cards → subject cards → pill tabs (PYQs, Playlists, Notes). Each paper shows two cards (questions; questions + solution) that open a large panel holding the viewer.
  - **(proposed, `Feature.md` §8.1)** A subject search field and a "Continue where you left off" card on `/resources`; "N papers" on year cards and a progress bar on subject cards; the active tab in the URL; paper rows instead of two large tiles (title, tag, Questions and Solution buttons, attempted checkbox, notes behind a toggle); a viewer with continuous scroll, remembered page and side-by-side Questions and Solution on desktop; skeleton cards while loading; an empty state that invites students to send a missing paper.
- **QuizEngine:** pill toggle for College viva and NPTEL, then a grid of photo cards.
- **Calculators:** mini cards with inputs; credits as a dropdown (1–6).
- **Task Tracker:** deadline-first list with status badges; Kanban as a secondary view using cards.

## 9. Do and don't

**Do**
- Keep `--bg` as the anchor surface; the faint blue tint in dark mode is intentional.
- Use `--primary` only for the brand mark, the primary CTA, focus rings and link emphasis.
- Climb the surface ladder one step at a time.
- Pair weight 600 headlines with weight 400 body.

**Don't**
- Don't use lavender as a section background or card fill.
- Don't add a second accent color.
- Don't add gradients, spotlight cards or the gradient headline word from v1.
- Don't pill-round buttons.
- Don't use `#000000` as the dark canvas.

## 10. Responsive

| Name | Width | Changes |
|------|-------|---------|
| Desktop-XL | 1440px | Default layout |
| Desktop | 1280px | 3-up card grid |
| Tablet | 1024px | Grid becomes 2-up |
| Mobile-Lg | 768px | Nav becomes a hamburger; grid becomes 1-up |
| Mobile | 480px | Single column; display-xl about 36px |

Images keep their aspect ratio and are never cropped awkwardly.

## 11. Open items

- Inter loading: a Google Fonts link in `index.html` (no new package), or `@fontsource/inter` (new dependency, needs your approval). Default is the link.
- Review the light-mode, warning and danger tokens marked **(derived)**.
- Photo sourcing and art direction for the QuizEngine cards.
- Motion and loading skeletons are not covered by the reference.
- Skeleton and loading-state spec for Resources (`ERRORS.md` P4).
- Subject art: one metadata map, and replacing mismatched SVGs (`ERRORS.md` D5).

## 12. Known deviations from this document (2026-10-22 review)

These are open and none is fixed yet. File and line numbers are from the review; re-check before editing.

| Rule | Where it is broken | Fix |
|------|--------------------|-----|
| No drop shadows (§6) | `features/resources/pages/Resources.css:99` (`0 8px 24px`), `features/resources/components/PdfViewer.css:138` (`0 4px 20px`), `features/homepage/people.css:171` (`0 2px 8px`) | Remove, and use the elevation ladder (surface level and border) |
| Tokens only | `features/homepage/people.css:133` uses `var(--shadow-lg)`, which `variables.css` does not define, so the declaration is invalid and renders nothing | Remove |
| Status badge fill stays `--surface-2`; only the text takes the status color (§7) | `Resources.css:256` and `:387` (green `rgba(34, 197, 94, ...)` fills), `PdfViewer.css:124` (red `rgba(239, 68, 68, ...)` fill) | `--surface-2` fill with `--success` or `--danger` text |
| Colors come from tokens | Raw `rgba(...)` values: `Resources.css:303` and `:422` (primary tint and focus ring), `PdfViewer.css:4` (overlay) and `:208` | Use tokens or `color-mix(in srgb, var(--token) N%, transparent)`; use the focus token for focus rings |