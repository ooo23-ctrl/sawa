# KHWWC Visual Implementation Plan

**Date:** 2026-10-13
**Scope:** Super Admin Dashboard and Treasurer Dashboard enhancement to match reference images.

---

## 1. Design System

### Color Palette

| Token | Color | Usage |
|-------|-------|-------|
| Primary | Blue 600 (`#2563eb`) | Primary actions, member avatars, links |
| Secondary | Emerald 600 (`#059669`) | Contributions, success states, active members |
| Accent | Violet 600 (`#7c3aed`) | Payments, quick action buttons |
| Success | Green 500 (`#22c55e`) | Confirmed, healthy, active |
| Warning | Amber 500 (`#f59e0b`) | Pending, warnings |
| Error | Red 500 (`#ef4444`) | Failed, rejected, inactive |
| Neutral | Slate (50-900) | Backgrounds, text, borders, sidebar |
| Dark | Slate 900 (`#0f172a`) | Sidebar, quick actions panel, promo banner |

### KPI Card Gradients (Super Admin)

| Card | Gradient | Icon Color |
|------|----------|------------|
| Total Members | `from-blue-600 to-blue-500` | blue-50 |
| Total Contributions | `from-green-600 to-green-500` | green-50 |
| Total Payments | `from-violet-600 to-violet-500` | violet-50 |
| Wallet Transactions | `from-orange-500 to-amber-500` | orange-50 |
| Bank Transactions | `from-teal-600 to-teal-500` | teal-50 |

### KPI Card Gradients (Treasurer)

| Card | Gradient | Icon Color |
|------|----------|------------|
| Total Members | `from-blue-600 to-blue-500` | blue-50 |
| Total Contributions | `from-green-600 to-green-500` | green-50 |
| Total Payments | `from-violet-600 to-violet-500` | violet-50 |
| Bank Balance | `from-orange-500 to-amber-500` | orange-50 |

### Typography

| Element | Size | Weight |
|---------|------|--------|
| Page title | text-xl / text-base | bold (700) |
| Section header | text-sm | bold (700) |
| KPI value | text-2xl / text-xl | bold (700) |
| KPI label | text-sm | medium (500) |
| KPI sub-text | text-xs | normal (400) |
| Table header | text-xs | medium (500) |
| Table body | text-xs / text-sm | normal/medium |
| Badge | text-xs | medium (500) |

### Spacing

- 8px base unit (Tailwind default)
- Card padding: `p-5` (20px)
- KPI card padding: `p-4` / `p-5`
- Grid gap: `gap-3` (12px) for KPIs, `gap-4` (16px) for sections
- Section spacing: `space-y-5` (20px between major sections)

---

## 2. Super Admin Dashboard Layout

```
┌─────────────────────────────────────────────────────────┐
│  [avatar] Good Morning, Admin          [date/time] [bell]│
│          Welcome to KHWWC Super Admin Console           │
├─────────────────────────────────────────────────────────┤
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐           │
│  │Total │ │Contr │ │Paymt │ │Wallet│ │Bank  │  (5 KPI) │
│  │ 512  │ │4.2M  │ │2.9M  │ │ 146  │ │  3!  │           │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘           │
├─────────────────────────────────────────────────────────┤
│  ┌───────────────────┐ ┌────────┐ ┌─────────────────┐  │
│  │ Contributions &   │ │ Members│ │  Quick Actions  │  │
│  │ Payments Trend    │ │ by     │ │  (dark panel)   │  │
│  │ (LineChart)       │ │ Status │ │  6 action links │  │
│  │                   │ │(Donut) │ │                 │  │
│  └───────────────────┘ └────────┘ └─────────────────┘  │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────────┐ ┌─────────────────────────┐    │
│  │ Recent Contributions│ │ Top Contribution Members│    │
│  │ (table w/ avatars)  │ │ (ranked list w/ crown)  │    │
│  └─────────────────────┘ └─────────────────────────┘    │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────┐   │
│  │ Recent Activity (icon + text + time)             │   │
│  └──────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────┐   │
│  │ Members Directory (search, filter, export, table)│   │
│  └──────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────┤
│  [● System Online]  API: 200  Queue: 0  DB: Healthy     │
└─────────────────────────────────────────────────────────┘
```

### Components Used

- `KpiCard` — gradient card with icon, value, label, sub-text
- `LineChart` — SVG line chart with 2 series (contributions + payments)
- `DonutChart` — SVG donut with center label and legend
- `MemberAvatar` — colored circle with initials
- Quick Actions — dark slate panel with arrow links
- Member directory table — search, filter, export buttons + paginated table
- System status strip — dark bar with green pulse dot

### Data Sources

| Element | Source |
|---------|--------|
| Total Members (512) | `mockAdmin.dashboard().total_members` |
| Active/Pending/Inactive | `mockAdmin.dashboard().active_members` / `pending_approvals` / calculated |
| Total Contributions (4.2M) | `mockAdmin.dashboard().total_contributions` |
| Online Users | `mockSuperAdmin.dashboard().online_users` |
| Contributions Trend | `mockAdmin.dashboard().contributions_trend` (6 months) |
| Recent Contributions | `mockAdmin.getContributions({page:1}).data` |
| Top Members | `mockAdmin.dashboard().recent_signups` sorted by contributions_total |
| Member Directory | `mockAdmin.getMembers({page, search})` |
| System Status | `mockSuperAdmin.dashboard().system_health` |

---

## 3. Treasurer Dashboard Layout

```
┌─────────────────────────────────────────────────────────┐
│  [avatar] Welcome back, Treasurer       [date] [bell]   │
│           Treasurer • KHWWC Welfare                      │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────┐    │
│  │  [icon] Treasurer Dashboard     [This Month ▾]  │    │
│  │  Financial overview, bank reconciliation...     │    │
│  └─────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────┤
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                    │
│  │Total │ │Contr │ │Paymt │ │Bank  │   (4 KPI)         │
│  │ 512  │ │4.2M  │ │2.9M  │ │6.9M  │                    │
│  └──────┘ └──────┘ └──────┘ └──────┘                    │
├─────────────────────────────────────────────────────────┤
│  ┌───────────────────────────┐ ┌──────────────────┐     │
│  │ Contributions vs Payments │ │ Contribution     │     │
│  │ (LineChart, 2 series)     │ │ Summary (Donut)  │     │
│  └───────────────────────────┘ └──────────────────┘     │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐ ┌───────────────────────────────────┐  │
│  │ Quick       │ │ Recent Activity                  │  │
│  │ Actions     │ │ (5 activity items w/ icons)      │  │
│  │ (dark panel)│ │                                  │  │
│  └─────────────┘ └───────────────────────────────────┘  │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────┐   │
│  │ Recent Contributions (table w/ avatars)         │   │
│  └──────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────┤
│  ┌────────────────┐ ┌─────────────────────────────────┐ │
│  │ Bank Accounts  │ │ Recent Bank Transactions       │ │
│  │ (2 cards:      │ │ (table: date, desc, ref, type, │ │
│  │  Co-op, Equity)│ │  amount, balance)              │ │
│  └────────────────┘ └─────────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────┐   │
│  │  "Accurate Records. Better Welfare."   [Button]  │   │
│  │   (dark gradient promo banner)                   │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Components Used

- Dark gradient header bar (slate-900 to slate-800)
- `KpiCard` — 4 gradient cards with trend indicators
- `LineChart` — SVG with 2 series (contributions green, payments blue)
- `DonutChart` — SVG donut with contribution breakdown + legend
- Quick Actions — dark panel with colored icon buttons
- Recent Activity — icon circle + text + timestamp
- Bank account cards — logo, name, number, balance, credits/debits
- Bank transactions table — color-coded credit/debit
- Promo banner — dark gradient with decorative circles

### Data Sources

| Element | Source |
|---------|--------|
| Contributions Balance (4.2M) | `mockTreasurer.dashboard().contributions_balance` |
| Bank Balance (6.92M) | `mockTreasurer.dashboard().bank_balance` |
| Monthly Contributions Trend | `mockTreasurer.dashboard().monthly_contributions` |
| Recent Contributions | `mockAdmin.getContributions({page:1}).data` |
| Bank Transactions | `mockTreasurer.getBankStatement(1).data` |
| Wallets | `mockTreasurer.getWallets()` |
| Total Members (512) | `mockAdmin.dashboard().total_members` |
| Payments (calculated) | `contributions_balance * 0.707` |

---

## 4. Chart Components

### LineChart

- Pure SVG, no dependencies
- Props: `series: {label, color, points: {label, value}[]}[]`, `height?: number`
- Features: grid lines, Y-axis labels (K/M formatting), area fill (8% opacity), polyline, dots
- Default size: 560x180 viewBox, responsive width

### DonutChart

- Pure SVG, no dependencies
- Props: `segments: {label, value, color, detail?}[]`, `centerLabel`, `centerSub?`
- Features: arc paths with fill, center text (label + sub)
- Size: 180x180 viewBox, max-width 180px

---

## 5. Responsive Breakpoints

| Breakpoint | Width | Layout Change |
|------------|-------|---------------|
| mobile | <640px | KPI grid 2 cols, single column sections |
| sm | ≥640px | Date/time visible, some inline elements |
| lg | ≥1024px | KPI grid 5 cols (super-admin) / 4 cols (treasurer), 3-col chart row |
| xl | ≥1280px | Full multi-column layout |

---

## 6. Animation / Micro-interactions

- System online dot: `animate-pulse` on green dot
- Quick action links: `hover:bg-white/5` transition + arrow color shift
- Table rows: `hover:bg-slate-50/50` subtle highlight
- KPI trend icons: TrendingUp icon in top-right of cards
- Promo banner: decorative circles in background, hover on CTA button
- Search input: focus ring `focus:ring-blue-100`
- Buttons: `hover:bg-blue-700` / `hover:bg-slate-100` transitions
