# DESIGN.md - AccounterFlow FinTech Design System

## 1. Visual Theme & Philosophy
- Theme: Ultra-clean, dark financial dashboard (inspired by Linear and Mercury).
- Aesthetic: Modern, high density, professional, zero fluff.
- Border Radius: Medium-compact (`rounded-lg` / 8px for cards, `rounded-md` / 6px for buttons and inputs).
- Visual Density: Compact. Eliminate dead whitespace and giant empty hero banners.

## 2. Color Tokens (Tailwind / CSS Variables)
- Canvas Background: `#0B0D11` (Deep Charcoal Navy)
- Surface / Cards: `#14171F`
- Elevated Surface (Modals, Popovers): `#1B202B`
- Subtle Borders: `rgba(255, 255, 255, 0.08)` (1px solid)
- Primary Accent (Actions): `#3B82F6` (Electric Blue) or `#10B981` (Emerald)
- Status Paid / Success: Text `#34D399`, Background `rgba(52, 211, 153, 0.12)`
- Status Pending: Text `#FBBF24`, Background `rgba(251, 191, 36, 0.12)`
- Status Danger / Over-budget: Text `#F87171`, Background `rgba(248, 113, 113, 0.12)`
- Text Primary: `#F9FAFB`
- Text Secondary / Muted: `#9CA3AF`
- Text Terciary: `#6B7280`

## 3. Typography & Financial Data Rules
- Fonts: `Inter`, `Geist Sans`, or system sans-serif.
- Currency & Numerical Values: ALWAYS use tabular figures (`font-mono` or `tabular-nums`) and right alignment in tables.
- Monospace tags: Badges and status pills must be compact uppercase (text-xs, font-medium).

## 4. Layout & Component Guidelines
- Page Header: Replace giant empty banner containers with a sleek 48px sticky top bar containing: Title, breadcrumb or subtitle, and primary actions (e.g., "+ Transacción").
- Tables:
  - Row height: 44px–48px.
  - Hover state: `rgba(255, 255, 255, 0.03)`.
  - Amounts: Aligned to the right column with explicit currency formatting.
- Cards (KPI / Metrics):
  - Label in muted text (12px, uppercase tracking-wide).
  - Main metric in bold (24px or 28px).
  - Comparison footer (e.g., "+14.2% vs last month") with green/red pill.
- Forms & Filters: Segmented pill buttons with clear active states.

## 5. Responsive & Mobile Rules
- Phone QA baseline: test at **342px** and 390px; also check tablet (768px) and desktop (1440px). No page or modal may scroll horizontally.
- Preserve the desktop composition. Use mobile-first overrides for narrow layouts instead of shrinking desktop controls until labels clip.
- Mobile page gutters: 16px. Keep component gaps consistent at 12–16px and avoid nested surfaces that repeat borders and padding.
- Filters stay in one toolbar. On phones, stack full-width date/category controls and place status choices in a two-column grid. Controls and flex children must use `min-w-0`/`w-full` where needed; never force a no-wrap status row beyond its container.
- Tables become flat, touch-friendly rows on phones: identity and amount first, metadata next, actions/status after. Keep every field, use subtle separators, and avoid cards nested inside a table card. Let editable status controls wrap or use a grid.
- Touch targets should be at least 44px tall. Status buttons may wrap to another row, but their labels must remain readable and uncut.
- Mobile dialogs use about 8px of viewport inset and 16px of panel padding. Cap the panel to the viewport height, scroll the form body rather than the whole dialog, and keep the action footer visible. Stack form fields and use a two-column status selector on phones.
- Check the longest translated labels and realistic large currency values at 342px, not only English labels or short sample amounts.
