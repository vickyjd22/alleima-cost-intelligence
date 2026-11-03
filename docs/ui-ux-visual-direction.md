# Visual Direction — Alleima-Inspired

_Phase 2 deliverable. Separates **observed** characteristics of the public reference site from **proposed** application design decisions. We do not claim access to Alleima's private design system, nor that the hex values below are official brand tokens._

Reference studied: https://www.alleima.com/en/ (public pages only).

## A. Observed characteristics of the reference site

These are observations from the public homepage, not verified internal specifications.

- **Industrial, materials-science character.** Content is organised around products (tube & pipe, strip steel, fine wire, bar) and ten industries (chemical, consumer, industrial, industrial heating, hydrogen & renewable energy, medical, mining & construction, nuclear, oil & gas, transportation). The tone is technical, precise, and trustworthy.
- **Strong, quiet typographic hierarchy.** Large section headings, short descriptive paragraphs, generous line spacing. Text does the work; decoration is minimal.
- **Big-number storytelling.** Headline statistics are presented prominently (e.g. ~6,800 employees, 8.3% adjusted EBIT margin, 18,630 MSEK revenue, >900 active alloys — 2025 figures). This "stat band" pattern is worth echoing on the dashboard.
- **Structured, card-based information architecture.** Products and industries are presented as clean, equally weighted cards with a title, a short description, and a quiet call to action.
- **Restrained colour and high whitespace.** The page reads as premium and calm; colour is used sparingly for emphasis and navigation, not decoration.
- **Clear, understated calls to action** ("All reports", "Read more") rather than loud buttons.

## B. Translation into an enterprise application

The goal is **not** to copy the marketing site. We translate its character into a working cost-intelligence tool:

| Reference trait | Application translation |
| --- | --- |
| Industrial / technical tone | Deep steel-navy navigation rail; cool, precise neutrals; tabular numerics for money and variances |
| Big-number storytelling | Dashboard stat band (period, yield, reconciliation health, exceptions) styled like the site's figures |
| Structured card IA | Consistent `Card` + `SectionHeader` grid across modules; equal-weight KPI quads |
| Restraint + whitespace | 4 px spacing grid, generous row heights, one interaction blue, status colour used only for meaning |
| Quiet CTAs | Secondary/ghost buttons as default; primary reserved for the main action per screen |
| Trustworthy / audit-ready | Visible approval timelines, audit panels, "sample data" banners, never colour-only status |

## C. Official Alleima brand palette (now applied)

**Update:** the client supplied the official Alleima brand assets (logo + annual-report pages). The earlier navy/blue "interpretation" has been **replaced** by the real brand identity. These values now drive `src/theme/tokens.ts` (keys preserved, values re-toned).

The published Alleima identity (by Kurppa Hosk) uses Molten Orange, Dark Steel Blue, Iron Red, White, and Titanium Grey. _Brand colours per the published identity; see the Abduzeedo write-up on the Alleima identity for the stated hex._

| Role | Brand hex | Usage in the app |
| --- | --- | --- |
| **Molten Orange** (primary / interaction) | `#FF5532` | Logo glyph, buttons, links, active nav, chart highlights, focus |
| Orange pressed | `#E8431F` | Hover / pressed state |
| **Dark Steel Blue** (ink + rail) | `#0F232E` | Headings/body ink, navigation rail, toasts, shadows |
| **Iron Red** (deep secondary) | `#872823` | Secondary/accent moments, deep emphasis |
| White | `#FFFFFF` | Cards and panels |
| **Titanium Grey** (neutral family) | `#E1E1E1` | Borders and dividers; soft `#F6F6F4` canvas wash |
| Secondary text | `#5A6B73` | Calm steel-grey supporting copy |

**Semantic colours** are kept deliberately distinct from the brand orange so meaning never collides with brand accent: success `#2F8A5B`, warning `#C57A12`, **error `#C62828`** (a true red, not the orange), info `#0F232E`. Status is always paired with an icon/label (never colour-only).

### Contrast check (WCAG 2.2)

| Pair | Ratio | Result |
| --- | --- | --- |
| Dark Steel text `#0F232E` on canvas `#F6F6F4` | ~15:1 | AAA |
| Secondary text `#5A6B73` on card `#FFFFFF` | ~5.2:1 | AA |
| White on Molten Orange `#FF5532` | ~3.1:1 | AA for large text / UI components; body text on orange is avoided — orange is used as a fill behind white labels on buttons (large/bold) and as an accent, not for long body copy |
| White on Dark Steel `#0F232E` | ~15:1 | AAA |

_Ratios are computed from the hex values and should be re-verified with an automated tool. Note the orange/white pair: we use it only for bold button labels and UI elements (which qualify under the 3:1 large-text / non-text rules), never for small body text._

## D. Typography

- **Typeface:** Inter (already referenced in `fontStack`). The project does not currently bundle a font file; web falls back to system UI fonts. **Proposal:** keep the Inter stack; optionally bundle Inter via `expo-font` in the production phase for pixel-consistency. No new licensed typeface is introduced.
- **Scale:** keep the existing `type` scale (display 40 → caption2 10.5). It already provides a strong hierarchy. We will apply it more deliberately — larger section titles, quieter eyebrows, tabular numerics for figures.

## E. Design principles (applied)

- Premium enterprise appearance; minimal, purposeful decoration.
- Strong typographic hierarchy; clear section separation.
- 4 px spacing grid (existing `spacing` tokens).
- Restrained colour; one interaction blue; teal for insight; amber/red reserved for cost/risk/exceptions.
- Accessible contrast and **visible focus states** (added in the design system).
- Responsive desktop / tablet / mobile (existing breakpoints: wide ≥1024, roomy ≥1320, compact <760).
- No unnecessary gradients, heavy shadows, oversized rounded cards, or decorative animation. Shadows stay soft (`shadowCard`), radii stay moderate.

## F. What is explicitly out of scope / unverified

- Official Alleima brand hex, logo lockups, and licensed fonts — **not confirmed**; treat section C as a proposal for client sign-off.
- Marketing imagery / photography from the site is **not** reused.
- Dark mode — not proposed unless the client requests it.
