# School Portal UI/UX Redesign Spec

## Design System Overview

Based on the Figma marketing design language: **monochrome editorial core** (black ink on white canvas) interrupted by **pastel color-block sections**. Pill-shaped CTAs, variable-weight sans-serif type, and shadow-light elevation where color replaces depth.

**Icons**: Monochrome, slightly rounded style via Icons8 MCP (style: `material-outlined` or `fluency` in monochrome). Fallback: `lucide-react` with `strokeWidth={1.5}` for a rounded monochrome feel.

---

## Phase 1: Design Tokens & Global CSS

**Files**: `apps/admin/app/globals.css`, `apps/parent/app/globals.css`

Replace current CSS with design tokens from the spec:

```
Colors:
  --ink:           #000000     (all text, primary actions)
  --canvas:        #ffffff     (page background, cards)
  --inverse-canvas:#000000     (footer, dark sections)
  --inverse-ink:   #ffffff     (text on dark surfaces)
  --hairline:      #e6e6e6     (borders, dividers)
  --hairline-soft: #f1f1f1     (subtler dividers)
  --surface-soft:  #f7f7f5     (off-white card backgrounds)
  --block-lime:    #dceeb1     (dashboard/stats sections)
  --block-lilac:   #c5b0f4     (announcements sections)
  --block-cream:   #f4ecd6     (billing sections)
  --block-mint:    #c8e6cd     (schedule sections)
  --block-pink:    #efd4d4     (activities sections)
  --block-coral:   #f3c9b6     (settings sections)
  --block-navy:    #1f1d3d     (dark accent sections)
  --success:       #1ea64a     (confirmed/paid states)
  --magenta:       #ff3d8b     (promo/urgent only)

Typography:
  --font-sans: 'Inter', system-ui, sans-serif  (figmaSans substitute)
  --font-mono: 'JetBrains Mono', 'Geist Mono', monospace (figmaMono substitute)

  Display XL:  86px / 340 / line-height 1.00 / tracking -1.72px  (hero)
  Display LG:  64px / 340 / line-height 1.10 / tracking -0.96px  (section openers)
  Headline:    26px / 540 / line-height 1.35 / tracking -0.26px  (card titles in color blocks)
  Body LG:     20px / 330 / line-height 1.40 / tracking -0.14px  (lead copy)
  Body:        18px / 320 / line-height 1.45 / tracking -0.26px  (default)
  Body SM:     16px / 330 / line-height 1.45 / tracking -0.14px  (cards, small text)
  Button:      20px / 480 / line-height 1.40 / tracking -0.10px  (all CTAs)
  Eyebrow:     18px / 400 / mono / uppercase / tracking 0.54px   (section labels)
  Caption:     12px / 400 / mono / uppercase / tracking 0.60px   (column heads)

Spacing: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 96px
Radius:  xs 2px | sm 6px | md 8px | lg 24px | xl 32px | pill 50px | full 9999px
```

---

## Phase 2: Shared UI Components (`packages/ui`)

### Button (`button.tsx`)
- **default**: black bg, white text, pill radius (50px), `text-[20px] font-[480]`, padding `10px 20px`
- **secondary**: white bg, black text, pill radius, same type, padding `8px 18px 10px`, 1px hairline border
- **destructive**: black bg → red bg on hover, pill, white text
- **outline**: white bg, hairline border, black text, pill
- **ghost**: transparent bg, hover → surface-soft bg, pill
- **icon**: 40px circle, surface-soft bg, black icon
- Remove all blue color references. No square buttons.

### Card (`card.tsx`)
- Default: white bg, hairline border (1px `#e6e6e6`), `rounded-[24px]` (lg), NO shadow
- Remove `shadow-sm`. Elevation comes from color blocks, not shadows.
- Add new variant: `color-block` — accepts pastel bg colors (lime, lilac, cream, mint, pink, coral, navy) via className
- Padding: 24px (lg spacing)

### Badge (`badge.tsx`)
- Keep pill shape (`rounded-full`)
- Variants remapped to monochrome + semantic:
  - `default`: black bg, white text
  - `gray`: surface-soft bg, ink text
  - `green`: mint block bg, success text
  - `red`: pink block bg, magenta text
  - `yellow`: cream block bg, dark amber text
  - `outline`: hairline border, ink text

### Input (`input.tsx`)
- `rounded-[8px]` (md), hairline border, padding `12px 14px`
- Body type (18px/320)
- Focus: ring-2 ring-black (not blue)
- Remove blue references

### Label (`label.tsx`)
- Body-sm type, ink color, weight 480

### New: ColorBlock component
- Full-width section with pastel bg, `rounded-[24px]`, padding 48px
- Props: `color: 'lime' | 'lilac' | 'cream' | 'mint' | 'pink' | 'coral' | 'navy'`
- Navy variant uses inverse-ink (white text)

### New: Eyebrow component
- Mono font, uppercase, positive tracking, 18px
- Used as section category labels

---

## Phase 3: Admin Portal — Layout & Navigation

### Sidebar (`admin/components/sidebar.tsx`)
- White bg, hairline right border (no shadow)
- Logo area: "Little Scholars" in display-lg weight, black
- Nav items: body-sm type, weight 330
  - Active: black bg, white text, pill radius
  - Inactive: ink text, hover → surface-soft bg, pill radius
- Icons: 20px monochrome rounded (from Icons8 or lucide with strokeWidth 1.5)
- Sign out: bottom of sidebar, red text, ghost style

### Header (`admin/components/header.tsx`)
- White bg, hairline bottom border, height 56px
- Page title in headline (26px/540)
- Right side: notification bell (circular icon button), user avatar circle

### Dashboard Layout
- `bg-canvas` (white, not gray-50)
- Main content area: padding 32px
- Max content width: 1280px

---

## Phase 4: Admin Portal — Pages

### Dashboard (`/`)
- Hero greeting: display-xl "Good morning, [name]" on white canvas
- Stats row: 2-3 cards in `color-block-section` (lime for enrollment, lilac for revenue, cream for attendance)
- Each stat card: white bg on pastel section, `rounded-[24px]`, number in card-title (24px/700), label in caption mono
- Recent activity: white card with hairline border

### Students (`/students`)
- Eyebrow label: "STUDENT MANAGEMENT" in mono uppercase
- Search bar: full-width input with circular icon button
- Filter/sort bar: pill toggles (like pricing tabs) for class filter, sort dropdown
- Table: hairline dividers only (no card wrapper), body-sm type
- Student name: link weight 480, class in body-sm weight 320

### Parents (`/parents`)
- Stats color blocks: lime block with total parents, mint block with children linked
- Table: same pattern as students

### Announcements (`/announcements`)
- Lilac color-block hero section with "Announcements" headline
- Form: white card on lilac block, `rounded-[24px]`
- List: white cards with hairline borders on white canvas

### Billing (`/billing`)
- Cream color-block for total outstanding amount
- Invoice list: white cards, payment status badges

### Schedule, Classes, Workshops, Activities, Settings
- Each gets a signature color block: mint (schedule), lime (classes), coral (workshops), pink (activities), surface-soft (settings)
- Consistent pattern: eyebrow → headline in color block → content cards on white canvas

---

## Phase 5: Parent Portal — Layout & Navigation

### Bottom Nav (`parent/components/bottom-nav.tsx`)
- White bg, hairline top border, height 56px
- Nav items: icon (20px) + caption (12px mono uppercase)
- Active: black icon + black text, with a small black dot indicator
- Inactive: gray-400 icon + text
- Safe area padding for mobile

### Root Layout
- `bg-canvas` (white)
- Body: `font-sans` Inter, ink color
- Remove dark mode media query (design system is light-only)

---

## Phase 6: Parent Portal — Pages

### Home/Dashboard (`/`)
- Hero: "Good day, [name]" in display-lg (64px/340) on white
- Notification bell: circular icon button top-right
- Stats: 2-up grid, each stat in a pastel color-block mini-card (lime for news count, pink for bills)
- Announcements preview: white cards with hairline
- Schedule cards: per-child, each child's card uses a different pastel accent strip at top (lime, lilac, cream, mint cycling)

### Announcements (`/announcements`)
- Lilac color-block header strip with "News" headline
- Cards: white bg, hairline border, `rounded-[24px]`
- Swipe-to-archive: same interaction, archive action bg is surface-soft
- Archived page: same pattern with "Archived" eyebrow

### Billing (`/billing`)
- Cream color-block for total outstanding
- Invoice cards: white bg, hairline border
- Status badges: monochrome (black = paid, hairline = pending, pink = overdue)

### Settings (`/settings`)
- Surface-soft background
- Cards: white bg, hairline border, `rounded-[24px]`
- Sign out: black pill button with white text

### Login/Register
- Centered card on white canvas
- Logo in display-lg
- Inputs: hairline border, `rounded-[8px]`
- Submit: black pill button
- Link: black text, weight 480, underline

---

## Phase 7: Icons (Icons8 MCP)

**Style**: Monochrome, slightly rounded — use Icons8 style `material-outlined` or `fluency` rendered in single color (black `#000000`).

**Fallback** (if MCP unavailable): `lucide-react` with `strokeWidth={1.5}` and `size={20}` for nav, `size={16}` for inline, `size={24}` for hero. All rendered in currentColor (inherits black ink).

**Icon mapping** for key actions:
| Action | Icon |
|--------|------|
| Home | home |
| Students/Children | school |
| Parents | people |
| Teachers | person |
| Classes | classroom |
| Workshops | palette |
| Announcements | megaphone |
| Activities | calendar |
| Billing | receipt |
| Schedule | clock |
| Notifications | bell |
| Settings | settings |
| Search | search |
| Edit | edit |
| Delete | delete |
| Add | add-circle |
| Archive | archive |
| Check/Confirm | checkmark-circle |
| Filter | filter |
| Sort | arrow-sort |
| Sign out | log-out |

---

## Implementation Order

1. **Phase 1**: Design tokens in both globals.css files
2. **Phase 2**: Rewrite shared UI components (button, card, badge, input, label + new ColorBlock, Eyebrow)
3. **Phase 3**: Admin sidebar + header + dashboard layout
4. **Phase 4**: Admin pages (dashboard → students → parents → announcements → billing → remaining)
5. **Phase 5**: Parent bottom nav + root layout
6. **Phase 6**: Parent pages (home → announcements → billing → settings → login/register → remaining)
7. **Phase 7**: Swap icons to Icons8 MCP where available, lucide fallback elsewhere

Each phase builds on the previous. No phase should be started before the prior is verified with a passing build.
