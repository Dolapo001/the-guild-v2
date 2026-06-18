# The Guild — Design System

Foundation tokens for the modernization. Defined once in `src/app/globals.css`
(`@theme` + `:root` + `.dark`) and consumed as Tailwind v4 utilities. Use these
instead of ad-hoc hex values, random spacing, or one-off shadows.

## Color tokens

Semantic, theme-aware (light + dark via the `.dark` class). All state colors
meet WCAG AA contrast on their surface.

| Token | Utility examples | Light | Dark |
|---|---|---|---|
| background | `bg-background` | `#f4f7fa` | `#05070f` |
| foreground | `text-foreground` | `#1e293b` | `#e7eaf3` |
| surface / surface-2 | `bg-surface` `bg-surface-2` | `#fff` / `#eef2f7` | `#0c1022` / `#141a30` |
| card | `bg-card` | `#fff` | `#0c1022` |
| muted / muted-foreground | `bg-muted` `text-muted-foreground` | `#f1f5f9` / `#64748b` | `#11162b` / `#94a3b8` |
| border | `border-border` | `slate/8%` | `white/10%` |
| ring | `ring-ring` | `#1a237e` | `#5c6bc0` |
| primary | `bg-primary text-primary` | `#1a237e` | `#5c6bc0` |
| secondary | `bg-secondary` | `#ffb74d` | `#ffb74d` |
| accent | `bg-accent` | `#00695c` | `#26a69a` |
| **success** | `bg-success text-success` | `#047857` | `#34d399` |
| **warning** | `bg-warning text-warning` | `#b45309` | `#fbbf24` |
| **error** | `bg-error text-error` | `#dc2626` | `#f87171` |
| **info** | `bg-info text-info` | `#1d4ed8` | `#60a5fa` |

Each state color has a `-foreground` pair (`text-success-foreground`, …) for
text/icons placed on a filled swatch. For subtle tints use opacity, e.g.
`bg-success/10 text-success`.

> Dark mode: the full palette is defined under `.dark`. The app currently runs
> light (`forcedTheme="light"`); flipping to dark is a one-line change in the
> root `ThemeProvider` — no component edits required.

## Typography scale

Utilities carry size + line-height + weight + tracking together.

| Utility | Size | Use |
|---|---|---|
| `text-display` | 3.5rem / 800 | Hero numbers, marketing |
| `text-h1` | 2.25rem / 800 | Page titles |
| `text-h2` | 1.75rem / 700 | Section titles |
| `text-h3` | 1.375rem / 700 | Card titles |
| `text-h4` | 1.125rem / 600 | Sub-headings |
| `text-body-lg` | 1.0625rem | Lead paragraphs |
| `text-body` | 0.9375rem | Default body |
| `text-small` | 0.8125rem / 500 | Secondary text |
| `text-caption` | 0.6875rem / 700 / +tracking | Labels, eyebrows (pair with `uppercase`) |

Font: Plus Jakarta Sans → Inter (`--font-sans`).

## Spacing

Tailwind's 4px base scale (`p-2`=8px, `p-4`=16px, `p-6`=24px, `p-10`=40px).
Section rhythm: `py-28` between major sections, `gap-4`/`gap-6` within grids,
`p-5`/`p-6` card padding. Avoid arbitrary values.

## Radius

| Token | Utility | Value | Use |
|---|---|---|---|
| input | `rounded-input` | 0.75rem | Inputs, small buttons |
| card | `rounded-card` | 1rem | Cards, list rows |
| panel | `rounded-panel` | 1.5rem | Dialogs, large panels, command palette |

(Plain `rounded-xl`/`rounded-2xl` remain valid; the semantic tokens keep larger
surfaces consistent.)

## Elevation

| Utility | Use |
|---|---|
| `shadow-e1` | Resting cards, inputs |
| `shadow-e2` | Hover lift, dropdowns |
| `shadow-e3` | Popovers, sheets |
| `shadow-e4` | Modals, command palette |

Depth increases toward the user's focus. Dark mode uses deeper shadows.

## Glassmorphism (selective)

Reserved for floating chrome — `bg-glass-surface backdrop-blur-md border-glass-border`.
Apply to: navigation, search, modals, command palette, floating panels. Never on
dense content where it harms readability.

## Command palette (⌘K / Ctrl+K)

Global command center (`components/shared/command-palette.tsx`), mounted in the
dashboard layout. Role-aware navigation + create actions + account, fuzzy search,
full keyboard control (↑/↓/↵/Esc), and recents. Open via the keyboard shortcut or
the **Quick actions ⌘K** button in the top nav. Other features can open it by
dispatching `window.dispatchEvent(new Event("open-command-palette"))`.

## Modernization roadmap (next, screen by screen)

The token layer + palette are the foundation. Remaining areas, each now able to
build on these tokens without re-deciding visuals:

1. **Primitives** — refactor `Button`, `GlassCard`, `Input` to the new tokens
   (state variants `success/warning/error`, `shadow-e*`, `rounded-*`).
2. **Data tables** — shared `<DataTable>` with search, sort, filters, bulk
   actions, pagination, empty/loading/error states.
3. **Forms** — floating labels, inline validation, draft save.
4. **Dashboards** — KPI cards with trend deltas, area/line charts, activity feed.
5. **Empty states** — reusable `<EmptyState>` (illustration + guidance + action).
6. **Auth screens** — apply the premium token layout.

These are best done iteratively per screen so each can be verified, rather than
in one unverifiable sweep.

## Dark-readiness sweep (in progress)

Goal: replace hardcoded light-only colors with semantic tokens so the app can
later switch to dark mode by toggling the root `.dark` class — **without
changing the current light appearance**.

**Phase 1 (done):** an app-wide codemod applied only the *pixel-identical*
mappings (the token's light value is byte-for-byte the replaced color), so the
light UI is provably unchanged:

| Hardcoded | Token | Light value (identical) |
|---|---|---|
| `bg-white` | `bg-card` | `#ffffff` |
| `bg-slate-100` | `bg-muted` | `#f1f5f9` |
| `text-slate-500` | `text-muted-foreground` | `#64748b` |
| `text-slate-800` | `text-foreground` | `#1e293b` |
| `border-slate-100` | `border-border` | slate @ ~8% |

**Remaining (per-screen, needs visual review):** non-exact colors —
`text-gray-*`, `text-slate-400/600/700/900`, `bg-gray-50`, `border-gray-*`, and
the translucent `bg-white/NN` glass overlays. These don't map 1:1 to a token, so
each should be converted and eye-checked screen by screen (heaviest files:
`profile`, `staff-portal`, `active-job`, `job-history`, `wallet`). Only after
this is complete should dark mode be switched on.
