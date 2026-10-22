# DESIGN_SYSTEM.md

Reference: `ui-design.png.png` (ConnectHub) — language only, no social content.

## Tokens (`src/theme/tokens.ts` — single source)
- primary `#4F46E5`, primaryPressed `#4338CA`, accent `#818CF8`
- bg `#F5F7FC`, card `#FFFFFF`, text `#172033`, text2 `#667085`, border `#E3E8F2`
- success `#16A34A`, warning `#F59E0B`, error `#DC2626`, dark `#101828`
- radius: card 16, input 12, button 12; spacing 4/8/12/16/24; shadows soft; fonts: system + Inter (web) / System (native); icons: Lucide consistent 1.5px stroke.

Dark mode mirrors tokens; contrast AA minimum; focus ring visible on web.

## Components (`src/components/`)
AppShell, Sidebar, MobileNav, TopBar, Breadcrumbs, PageHeader, KpiCard, ChartCard, DataTable (search/sort/paginate/column select), FilterPanel, StatusChip, Form inputs (validated), PeriodSelector, Dropdown, Tabs, Stepper, Drawer/Modal, ConfirmDialog, Upload + ImportPreview, Empty/LoadingSkeleton/ErrorState, Toast/Alert, ApprovalTimeline, AuditPanel, CostBreakdownPanel, TraceabilityTimeline.

Variants: primary/secondary/destructive/disabled. Data screens: filters above table, sticky headers, drawers for quick edit, full pages for complex flows. No oversized headings, no heavy gradients, restrained illustration.

## Navigation registry (`src/config/modules.ts`)
13 modules (§6) with `id, title, icon, route, roles[]`. Sidebar + bottom nav render from same registry filtered by claims.


---

# Apple HIG Upgrade (2026-10-14)

## Principles applied (Clarity / Deference / Depth)
- SF Pro type roles: largeTitle 34 → caption2 11; tabular numerals for KPIs; min body 15pt on compact.
- System grouped backgrounds (#F2F2F7 / #000000 dark), hairline separators, subtle card shadows only.
- Tint = system blue (#007AFF light / #0A84FF dark); semantic success/warning/error follow iOS values.
- All interactive targets ≥ 44x44pt; focus ring on inputs; status never color-only (label + dot).
- Patterns: large-title PageHeader, iPad sidebar + iOS tab bar, bottom sheets with grabber, action-sheet More, dark-translucent toast, segmented period control, iOS search fields.
- Dark Mode via useColorScheme (useAppleTheme); legacy tokens export kept for compatibility.
