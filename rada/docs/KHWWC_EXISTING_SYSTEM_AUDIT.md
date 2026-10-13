# KHWWC Welfare Application — Existing System Audit

**Date:** 2026-10-13
**Application:** KHWWC Welfare Management System
**Repository:** moto (cloned from github.com/technologyupdates002-eng/moto.git)

---

## 1. Technology Stack

| Layer         | Technology                                      |
|---------------|-------------------------------------------------|
| Build tool    | Vite 5.4.8                                      |
| Framework     | React 18 + TypeScript 5.6                       |
| Styling       | Tailwind CSS 3.4 + PostCSS                      |
| Data fetching | TanStack React Query 5                          |
| Routing       | React Router v7 (BrowserRouter)                 |
| Icons         | lucide-react                                    |
| Backend       | Laravel REST API (production) / mock layer (demo) |
| Auth          | Custom JWT (sessionStorage token + user)        |
| Realtime      | Supabase (group chat) + SSE (AI assistant)      |
| Edge Functions| Supabase Deno (ai-assistant)                    |
| Database      | Supabase Postgres (chat tables, AI assistant)   |

---

## 2. Dual-Mode Architecture

The application operates in two modes controlled by `localStorage` key `khwwc_demo_mode` (defaults to `true`):

- **Demo Mode (ON):** All API calls return static data from `src/api/demo-data.ts` with a 200ms simulated delay. No backend required.
- **Production Mode (OFF):** All API calls hit the real Laravel API at `API_BASE_URL` (default: `https://api.khwwc.co.ke/api`).

The bridge function `tryApi()` in `src/api/mock.ts` checks demo mode and routes accordingly.

---

## 3. File Inventory

### Core application files

| File                              | Purpose                                               | Lines |
|-----------------------------------|-------------------------------------------------------|-------|
| `src/App.tsx`                     | Router definition, all routes                        | 308   |
| `src/main.tsx`                    | React entry point                                     | 12    |
| `src/index.css`                   | Tailwind directives + global styles                   | 30    |
| `src/auth/AuthContext.tsx`        | JWT auth provider, login/logout, user state           | ~120  |
| `src/auth/RouteGuard.tsx`         | RequireAuth wrapper, role-based redirect              | 39    |
| `src/layouts/AppLayout.tsx`       | Dark navy sidebar, role switcher, demo toggle, mobile nav | 289 |
| `src/layouts/PublicLayout.tsx`    | Public website header/footer                          | ~60   |
| `src/config/nav.ts`               | Navigation config per role (8 roles)                  | 154   |
| `src/lib/format.ts`               | Currency, date, status, CSV utilities                 | ~80   |
| `src/lib/query.ts`                | React Query keys + client config                      | ~110  |

### API layer

| File                      | Purpose                                          |
|---------------------------|--------------------------------------------------|
| `src/api/client.ts`       | Fetch wrapper with Bearer auth, 401 handling     |
| `src/api/mock.ts`         | Demo/production bridge (tryApi pattern)          |
| `src/api/demo-data.ts`    | Static demo data (members, contributions, etc.)  |
| `src/api/auth.ts`         | Auth API (login, profile, change password)       |
| `src/api/member.ts`       | Member portal API (14 endpoints)                 |
| `src/api/admin.ts`        | Admin API (24 endpoints)                         |
| `src/api/treasurer.ts`    | Treasurer API (20+ endpoints)                    |
| `src/api/public.ts`       | Public website API (8 endpoints)                 |
| `src/api/website.ts`      | Website CMS API (14 endpoints)                   |
| `src/api/minutes.ts`      | Minutes/signature API (10 endpoints)             |
| `src/api/roles.ts`        | Secretary/Chairperson/Vice/Office API (12 endpoints) |
| `src/api/chat.ts`         | AI assistant chat (SSE streaming)                |
| `src/api/group-chat.ts`   | Supabase group chat (direct realtime)            |
| `src/api/demo-chat.ts`    | Demo AI chat responses                           |
| `src/api/imports.ts`      | API barrel exports                               |

### UI components

| File                              | Purpose                                              |
|-----------------------------------|------------------------------------------------------|
| `src/components/ui.tsx`           | Design system: Card, StatCard, Badge, Button, Input, Select, Textarea, Avatar, EmptyState, LoadingState, ErrorState, SkeletonCard, PageHeader, Pagination, Modal, ConfirmDialog, Tabs, SearchInput, DataTable |
| `src/components/Charts.tsx`       | SVG-based LineChart and DonutChart (no dependencies) |
| `src/components/GenericPages.tsx` | GenericListPage, GenericDashboardPage, GenericFormPage, GenericDetailPage templates |
| `src/components/ChatWidget.tsx`   | AI assistant chat widget with SSE streaming          |
| `src/components/GroupChatWidget.tsx` | Supabase realtime group chat widget               |
| `src/components/PaymentModal.tsx`  | M-Pesa / payment modal                              |

### Page files

| Directory                    | Files | Pages |
|------------------------------|-------|-------|
| `src/pages/public/`          | 6     | Home, Leadership, PersonDetail, ContentList, ContentDetail, Contact |
| `src/pages/auth/`            | 2     | Login, ForcePasswordChange |
| `src/pages/member/`          | 12    | Dashboard, Events, Documents, Downloads, Receipts, News, Beneficiaries, Notifications, Profile, PayPenalty, Donate, ChatPage |
| `src/pages/treasurer/`       | 12    | Dashboard, Contributions, ContributionAdjustments, WithdrawalApprovals, Documents, Reports, BankSync, DonationCampaigns, MemoHistory, CreateMemo, Settings, BankStatementImport |
| `src/pages/treasurer/` (cont)| 2     | WalletPages (3 wallet pages), TreasurerPages (5 pages) |
| `src/pages/admin/`           | 3     | AdminDashboard, AdminMembers, AdminPages (24+ pages) |
| `src/pages/website/`         | 1     | WebsitePages (8 CMS pages) |
| `src/pages/roles/`           | 1     | RolePages (Secretary 7, ViceSecretary 2, Chairperson 4, Office 1 = 14 pages) |
| `src/pages/super-admin/`     | 1     | SuperAdminPages (14 pages) |
| `src/pages/ApiMatrixPage.tsx`| 1     | Interactive API endpoint browser |

### Documentation

| File                          | Purpose                                        |
|-------------------------------|------------------------------------------------|
| `docs/API_MATRIX.md`          | Complete Laravel API matrix (150 endpoints)    |
| `docs/KHWWC_EXISTING_SYSTEM_AUDIT.md` | This file                              |
| `docs/KHWWC_FRONTEND_ROUTE_MATRIX.md` | All frontend routes with role mapping   |
| `docs/KHWWC_API_CONTRACT_MATRIX.md`   | API contract for each endpoint          |
| `docs/KHWWC_ROLE_PERMISSION_MATRIX.md` | Role-based access control matrix       |
| `docs/KHWWC_VISUAL_IMPLEMENTATION_PLAN.md` | Visual design implementation plan   |
| `docs/KHWWC_IMPLEMENTATION_PROGRESS.md` | Progress tracking document            |

### Supabase

| Path                                    | Purpose                        |
|-----------------------------------------|--------------------------------|
| `supabase/config.toml`                  | Supabase project config        |
| `supabase/migrations/`                  | 3 SQL migrations               |
| `supabase/functions/ai-assistant/`      | AI assistant edge function     |

---

## 4. User Roles (8)

| Role              | Home Route         | Nav Items | Description                        |
|-------------------|--------------------|-----------|------------------------------------|
| member            | `/member`          | 11 + 4 bottom nav | Regular member portal       |
| admin             | `/admin`           | 31        | Full admin + website CMS           |
| treasurer         | `/treasurer`       | 19        | Financial management               |
| secretary         | `/secretary`       | 7         | Minutes review & scheduling        |
| vice-secretary    | `/vice-secretary`  | 2         | Minutes management                 |
| chairperson       | `/chairperson`     | 4         | Minutes approval & signatures      |
| office            | `/office`          | 1         | Office dashboard                   |
| super-admin       | `/super-admin`     | 43        | System admin + all admin + CMS     |

---

## 5. Data Model (from demo-data.ts)

| Dataset               | Records | Key Fields |
|-----------------------|---------|------------|
| demoMembers           | 8       | id, name, email, phone, member_number, role, status, joined_date, contributions_total, penalties_total, donations_total, county, workplace |
| demoContributions     | 8       | id, member_id, member_name, amount, type, status, method, reference, period, date |
| demoBankTransactions  | 5       | id, date, description, reference, amount, type, matched, matched_contribution |
| demoWallets           | 4       | name, balance, transactions_count, last_activity |
| demoWalletTransactions| ~12     | id, wallet, type, amount, description, reference, balance_after, date, status |
| demoBeneficiaries     | ~6      | id, member_id, name, relationship, phone, email, percentage, id_number, date_of_birth |
| demoDocuments         | ~6      | id, title, type, status, size, uploaded_by, date |
| demoMinutes           | ~5      | id, title, meeting_date, status, prepared_by, content, attendees |
| demoMeetings          | ~4      | id, title, date, time, location, type, agenda, attendees_count, status |
| demoEvents            | ~4      | id, title, description, date, location, status, attendees_count |
| demoNotifications     | ~5      | id, title, message, type, read, date |
| demoPenalties         | ~4      | id, member_id, member_name, amount, reason, status, date |
| demoDonations         | ~4      | id, member_id, member_name, amount, campaign, method, reference, status, date |
| demoCampaigns         | ~3      | id, title, description, target, raised, contributors, status |
| demoWithdrawals       | ~3      | id, member_id, member_name, amount, reason, status, requested_date |
| demoExpenses          | ~3      | id, description, amount, category, date, status |
| demoDefaulters        | ~3      | id, member_name, member_number, phone, missed_periods, outstanding_amount, last_payment_date, status |
| demoPayouts           | ~3      | id, reference, member_id, member_name, payout_type, amount, status |
| demoAccessRoles       | ~5      | id, name, description, permissions[], users_count |
| demoOnlineUsers       | ~4      | id, name, email, role, last_activity, ip, device |
| demoLoginActivity     | ~6      | id, user, email, ip, device, status, date |
| demoAuditLogs         | ~5      | id, user, action, module, ip, date, details |
| demoSystemMetrics     | ~6      | label, value, status, detail |
| demoWebsiteContent    | ~8      | id, type, title, slug, content, status, author, date |
| demoLeadership        | ~6      | id, name, slug, title, position, bio, order |
| demoContactMessages   | ~4      | id, name, email, subject, message, read, date |
| demoMediaAssets       | ~4      | id, name, type, size, url, uploaded_date |
| demoEmailTemplates    | ~3      | id, name, subject, body, variables, last_modified |
| demoMemos             | ~3      | id, title, subject, body, status, prepared_by, recipients_count, created_at |
| demoMemoTemplates     | ~2      | id, name, subject, body |
| demoRegistrationApplicants | ~3 | id, name, email, phone, county, workplace, status, date |
| demoOrgSettings       | 1       | organization_name, tagline, about, email, phone, address, payout amounts |
| demoSettings          | 1       | organization_name, tagline, about, email, phone, address, social links |
| demoEligibleMembers   | ~4      | id, name, member_number, phone, eligible_amount |

---

## 6. Key Findings

### Strengths
- Well-structured dual-mode architecture (demo/production)
- Complete role-based access control with 8 roles
- 150+ REST endpoints fully mapped
- Reusable UI component library
- SVG charts without external dependencies
- Responsive design with mobile bottom nav for members
- Interactive API matrix page for endpoint exploration

### Areas Enhanced
- Super Admin Dashboard rebuilt with KPI cards, line/donut charts, quick actions, member directory
- Treasurer Dashboard rebuilt with KPI cards, charts, bank accounts, transactions, promo banner
- Charts component added (LineChart, DonutChart) — no npm dependencies

### Security Notes
- JWT token stored in sessionStorage (cleared on tab close)
- Role-based route guards (RequireAuth with roles array)
- API client handles 401 → redirect to login
- Supabase RLS enabled on chat tables
- AI assistant edge function deployed with CORS headers
