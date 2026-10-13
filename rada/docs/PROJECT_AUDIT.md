# KHWWC — Project Audit Report

**Date:** 2026-10-13  
**Status:** Actual implementation state (not aspirational)

---

## 1. Executive Summary

The KHWWC application is a React + TypeScript + Vite frontend for a Kenyan healthcare workers welfare society. It has a comprehensive page structure covering 8 user roles (member, admin, treasurer, secretary, vice-secretary, chairperson, office, super-admin) with ~100+ routes and a public-facing website. The frontend is mature in terms of UI coverage but has critical gaps in production API integration.

**Key Finding:** The application has a demo-mode toggle (`getDemoMode()`) that controls whether real API calls or hardcoded demo data is returned. However, the implementation is inconsistent — only `LoginPage` and `ChatPage` have proper demo/production branching. **Every other page (24 of 25 tested) is hardwired to `mockMember`/`mockAdmin`/`mockTreasurer` and will always return demo data regardless of the toggle.**

There is no Laravel backend implemented. The frontend's `API_BASE_URL` points to `https://api.khwwc.co.ke/api` but no backend source code exists in this project. The Supabase integrations (AI assistant + group chat) are partially implemented with demo fallbacks.

---

## 2. Technology Stack (Actual)

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend framework | React | ^18.3.1 |
| Build tool | Vite | ^5.4.2 |
| Language | TypeScript | ^5.5.3 |
| Routing | react-router-dom | ^7.18.4 |
| Data fetching | @tanstack/react-query | ^5.104.2 |
| Icons | lucide-react | ^0.446.0 |
| Styling | Tailwind CSS | ^3.4.1 |
| Backend (Supabase) | @supabase/supabase-js | ^2.57.4 |
| Spreadsheet parsing | xlsx | ^0.18.5 |
| Backend API | Laravel | **Not implemented** |

---

## 3. Frontend Architecture

### 3.1 API Layer Structure

```
src/api/
├── client.ts        — Base fetch wrapper, token management, demo-mode flag
├── auth.ts          — Auth API calls (login, logout, me, password)
├── member.ts        — Member portal API calls (29 endpoints)
├── admin.ts         — Admin + Treasurer API calls (63 endpoints)
├── roles.ts         — Secretary, Vice-Sec, Chairperson, Office, Super-Admin (34 endpoints)
├── website.ts       — Website CMS API calls (18 endpoints)
├── public.ts        — Public website API calls (6 endpoints)
├── minutes.ts       — Meeting minutes API calls (11 endpoints)
├── imports.ts       — Bank statement import API (1 endpoint, chunked)
├── chat.ts          — AI assistant (Supabase edge function, 2 endpoints)
├── group-chat.ts    — Group chat (Supabase direct DB, 15 operations)
├── mock.ts          — Demo/prod switch layer (tryApi pattern)
├── demo-data.ts     — Hardcoded demo dataset (~500 lines)
└── demo-chat.ts     — In-memory demo group chat state
```

### 3.2 Authentication Flow

1. User enters phone number on `LoginPage`
2. `phoneToSyntheticEmail()` converts phone to `{normalized}@khwwc.local`
3. `AuthContext.login()` branches on `demoMode`:
   - **Demo:** `mockAuth.login()` — infers role from phone digits, returns `demo-jwt-token-{timestamp}`
   - **Production:** `authApi.login()` — POST to `/auth/login`
4. JWT stored in `sessionStorage` (`khwwc_jwt_token`)
5. User object stored in `sessionStorage` (`khwwc_user`)
6. `RouteGuard` checks `user.role` against allowed roles per route

**Critical gap:** `logout()` never calls any server endpoint — just clears local state. No server-side session invalidation.

**Critical gap:** No server session revalidation on page reload. `AuthContext` hydrates from `sessionStorage` and trusts it.

### 3.3 Demo Mode Architecture

```
getDemoMode() → reads localStorage 'khwwc_demo_mode' (default: true)
  │
  ├── TRUE  → mock*.method() → tryApi(real, demo) → returns demo data after 200ms delay
  └── FALSE → mock*.method() → tryApi(real, demo) → calls real API
```

**Problem:** Most pages import `mockMember`/`mockAdmin`/`mockTreasurer` directly instead of checking `getDemoMode()`. Even in production mode, `tryApi` is the intermediary, but several methods have `Promise.reject(new Error('Not configured'))` as their real API call, meaning production mode would throw for:

- `mockTreasurer.getImportHistory()`
- `mockTreasurer.getImportBatchDetail()`
- `mockAdmin.getBankUnmatched()`
- `mockAdmin.reconcileBankUnmatched()`

### 3.4 Page Inventory

| Module | Pages | Routes | All using mock? |
|--------|-------|--------|-----------------|
| Public Website | 6 pages | 8 routes | Yes (via `mockPublic`) |
| Auth | 2 pages | 2 routes | Login has branching |
| Member Portal | 14 pages | 14 routes | Yes (via `mockMember`) |
| Treasurer | 15 pages | ~20 routes | Yes (via `mockTreasurer`) |
| Admin | 4 pages | ~32 routes | Yes (via `mockAdmin`) |
| Secretary/Vice-Sec | 1 file (RolePages) | ~9 routes | Yes (via `mockSecretary/mockViceSecretary`) |
| Chairperson | 1 file (RolePages) | 3 routes | Yes (via `mockChairperson`) |
| Office | 1 file (RolePages) | 1 route | Yes (via `mockOffice`) |
| Super-Admin | 1 file (SuperAdminPages) | ~16 routes | Yes (via `mockSuperAdmin`) |
| Website CMS | 1 file (WebsitePages) | ~18 routes | Yes (via `mockWebsite`) |
| Minutes | (within RolePages) | ~11 routes | Yes (via `mockSecretary` etc.) |
| Chat | 1 page | 1 route | Has branching |
| **Total** | **~48 page files** | **~125 routes** | **95% hardwired to mock** |

---

## 4. Issues Found

### 4.1 Critical Issues

| ID | Severity | Component | Issue |
|----|----------|-----------|-------|
| C-01 | Critical | `mock.ts` | 4 methods throw `Error('Not configured')` for production API — features are demo-only |
| C-02 | Critical | `AuthContext` | `logout()` doesn't call server — no JWT invalidation |
| C-03 | Critical | `AuthContext` | No server session revalidation on reload — stale users trusted |
| C-04 | Critical | `WithdrawalReceipts` | Print function builds HTML via string interpolation without escaping — XSS risk |
| C-05 | Critical | `MemberDownloads` | `exportMembershipCard` hardcodes member data — not tied to logged-in user |
| C-06 | Critical | `TreasurerDashboard` | Dashboard stats hardcoded (512 members, payment ratio, contribution mix) — not from API |
| C-07 | Critical | `AdminPages` | `AdminNews` calls `getEvents()` instead of a news endpoint — wrong API |
| C-08 | Critical | `AdminPages` | `AdminRegistrationManagement` and `AdminExecutiveBadges` return `Promise.resolve({ data: [] })` — never fetch real data |
| C-09 | Critical | `AdminPages` | `AdminSettings`, `AdminOfficeSignatures`, `AdminRegistrationSettings` have `onSubmit={async () => {}}` — no-op submissions |
| C-10 | Critical | `TreasurerReports` | Download buttons have no `onClick` — purely decorative |
| C-11 | Critical | `TreasurerDocuments` | Download buttons have no `onClick` — purely decorative |
| C-12 | Critical | `TreasurerSettings` | Logo/Signature/Stamp upload areas have no file input or upload logic |

### 4.2 High Severity Issues

| ID | Severity | Component | Issue |
|----|----------|-----------|-------|
| H-01 | High | `mockSecretary.deleteMinutes` | Calls `secretaryApi.cancelMeeting(id)` — wrong endpoint (delete vs cancel) |
| H-02 | High | `mockSecretary.secretaryReview` | Calls `submitForReview` for both approve and reject — decision not sent to distinct endpoint |
| H-03 | High | `MemberProfile` | Calls `setForm()` during render — React anti-pattern, can cause infinite loops |
| H-04 | High | `TreasurerSettings` | Calls `setForm()` during render and `useState` initializer for side effects — anti-patterns |
| H-05 | High | `ContentListPage` | Calls `useQuery` inside conditional — violates React hooks rules |
| H-06 | High | `AppLayout` | `allRoles` array missing `'vice-secretary'` — Switch Role menu incomplete |
| H-07 | High | `ChatPage` | Production mode references `demoChatData.allMembers` for member lookup — demo data dependency in prod path |
| H-08 | High | `WalletPages` | No ErrorState — query failures silent |
| H-09 | High | `BankSync` | No ErrorState — query failures silent |
| H-10 | High | `ImportHistory` | No ErrorState for either query — silent failures |
| H-11 | High | `TreasurerReports` | No ErrorState |
| H-12 | High | Nearly all mutations | No `onError` handlers — failures are silent to the user |

### 4.3 Medium Severity Issues

| ID | Severity | Component | Issue |
|----|----------|-----------|-------|
| M-01 | Medium | `MemberDownloads` | Fetches only page 1 of contributions — statements incomplete |
| M-02 | Medium | `MemberDownloads` | All exports are CSV, no PDF generation despite UI suggesting PDF |
| M-03 | Medium | `MemberEvents` | No pagination, no event detail, no RSVP |
| M-04 | Medium | `MemberNews` | No article detail view — cards display-only |
| M-05 | Medium | `MemberNotifications` | No "mark all as read", no pagination |
| M-06 | Medium | `PublicLayout` | Social links are `href="#"` stubs |
| M-07 | Medium | `PublicLayout` | Contact info hardcoded, not from settings API |
| M-08 | Medium | `demo-chat.ts` | Typing indicator wired to read but never populated — dead feature |
| M-09 | Medium | `ChatPage` | `NewGroupModal` passes `demoChatData.allMembers` even in production |
| M-10 | Medium | `ContributionAdjustments` | No confirmation dialog before adjusting |
| M-11 | Medium | `MemoHistory` | Resend has no confirmation dialog |
| M-12 | Medium | `ForcePasswordChangePage` | Hardcodes `'old'` as old password |
| M-13 | Medium | Password fields | Min-length inconsistent: 6 in some pages, 8 in others |
| M-14 | Medium | `CreateMemo` | `recipients_count` defaults to 512 — hardcoded |
| M-15 | Medium | `BankUnmatched` | Member dropdown is 5 hardcoded names |
| M-16 | Medium | `WithdrawalReceipts` | Print uses `window.open` + `document.write` — blocked by popup blockers |

### 4.4 Low Severity Issues

| ID | Severity | Component | Issue |
|----|----------|-----------|-------|
| L-01 | Low | `MemberDashboard` | Typo "CONTRIBUTUTION" (should be "CONTRIBUTION") |
| L-02 | Low | `PaymentModal` | Same "CONTRIBUTUTION" typo in accountRef |
| L-03 | Low | `PayPenalty` | "penalty(es)" typo |
| L-04 | Low | `ExecutiveDashboard` | No retry on error (unlike other pages) |
| L-05 | Low | `App.tsx` | `WebsiteSettingsRoute` parses section from `window.location.pathname` instead of route params |
| L-06 | Low | `RouteGuard` | `getHomePath` duplicates `roleDashboardPath` from `AuthContext` |
| L-07 | Low | `demo-data.ts` | `demoRoleUsers` casts `role: 'vice-secretary' as any` |
| L-08 | Low | Pervasive | Widespread `any` types in mock layer and page components |
| L-09 | Low | `format.ts` | `relativeTime` loses "months ago" for ≥30 days |
| L-10 | Low | `MemoHistory` | Edit button uses `Plus` icon instead of edit icon |

---

## 5. Supabase Integration Audit

### 5.1 AI Assistant (`src/api/chat.ts`)

- **Demo mode:** Calls Supabase edge function at `{SUPABASE_URL}/functions/v1/ai-assistant` with anon key
- **Production mode:** Calls `{API_BASE_URL}/functions/v1/ai-assistant` with Bearer JWT
- **Streaming:** SSE-based, parses `data: { content, done?, conversationId? }` chunks
- **History:** GET endpoint fetches conversation + messages
- **Status:** Partially working — edge function exists in `supabase/functions/ai-assistant/index.ts`
- **Gap:** No conversation listing (only single conversation returned); no conversation deletion
- **Gap:** `contextType` for secretary_assistant not clearly distinguished from admin_assistant in the edge function

### 5.2 Group Chat (`src/api/group-chat.ts`)

- **Architecture:** Direct Supabase DB access (anon key) — no Laravel involvement
- **Tables:** `chat_conversations`, `chat_participants`, `chat_messages`, `chat_reactions`, `chat_typing`
- **Realtime:** Supabase Realtime channels for messages, reactions, typing, conversations
- **Operations:** 15 operations (fetch, send, delete, react, typing, create group, add/remove participants, subscribe)
- **Status:** Production path implemented but untested
- **Gap:** No RLS policies enforced — relies on anon key access (security risk)
- **Gap:** `NewGroupModal` in `ChatPage.tsx` references `demoChatData.allMembers` for member list even in production mode
- **Gap:** All error handlers are empty `catch { /* ignore */ }` — silent failures

### 5.3 Database Migrations

Three migration files exist:
1. `20261013111928_create_ai_assistant_tables.sql` — Creates `ai_assistant_conversations` and `ai_assistant_messages`
2. `20261013125231_create_chat_tables.sql` — (superseded by #3)
3. `20261013125256_create_chat_tables_schema.sql` — Creates `chat_conversations`, `chat_participants`, `chat_messages`, `chat_reactions`, `chat_typing`

---

## 6. API Contract Coverage

The frontend defines **187 total API operations** across 15 modules:

| Module | Endpoints | Production-ready? |
|--------|-----------|-------------------|
| Auth | 6 | Login has branching; logout doesn't call server |
| Public Website | 6 | Hardwired to mock |
| Member Portal | 29 | Hardwired to mock |
| Treasurer | 38 | Hardwired to mock; 2 endpoints explicitly broken |
| Admin | 25 | Hardwired to mock; 2 endpoints explicitly broken |
| Website CMS | 18 | Hardwired to mock |
| Secretary | 9 | Hardwired to mock; endpoint mismatch bug |
| Vice-Secretary | 5 | Hardwired to mock |
| Chairperson | 3 | Hardwired to mock |
| Office | 1 | Hardwired to mock |
| Minutes (shared) | 11 | Hardwired to mock |
| Signatures (shared) | 3 | Hardwired to mock |
| Super-Admin | 16 | Hardwired to mock |
| AI Assistant | 2 | Has branching (demo/prod) |
| Group Chat | 15 | Has branching (demo/prod) |
| **Total** | **187** | **~5% production-ready** |

---

## 7. UI Component Inventory

### 7.1 Shared Components (`src/components/ui.tsx`)

| Component | Purpose | Status |
|-----------|---------|--------|
| `Button` | Primary/secondary/ghost/danger variants | Working |
| `Card` | Container with optional padding | Working |
| `Badge` | Status indicators with color variants | Working |
| `Input` | Text input with label/error | Working |
| `Select` | Dropdown select | Working |
| `Textarea` | Multi-line input | Working |
| `Modal` | Dialog overlay | Working |
| `Table` | Data table with headers | Working |
| `LoadingState` | Full-page spinner | Working |
| `ErrorState` | Error message with optional retry | Working |
| `EmptyState` | Empty data placeholder | Working |
| `PageHeader` | Page title + description + actions | Working |
| `StatCard` | Dashboard stat with icon/trend | Working |
| `Tabs` | Tab navigation | Working |
| `FilterBar` | Search/filter bar | Working |
| `Pagination` | Page navigation | Working |
| `Avatar` | User avatar with initials fallback | Working |
| `StatusBadge` | Semantic status indicator | Working |
| `FileUpload` | Drag-and-drop file upload | Working |
| `ProgressBar` | Linear progress | Working |
| `Toast` | Notification toast (via context) | Working |

### 7.2 Feature Components

| Component | Purpose | Status |
|-----------|---------|--------|
| `Charts.tsx` | Bar/line/donut charts (SVG-based) | Working |
| `ChatWidget.tsx` | AI assistant floating widget | Has demo/prod branching |
| `GroupChatWidget.tsx` | Group chat floating button + panel | Working |
| `PaymentModal.tsx` | M-Pesa STK push modal | Working (mock data) |
| `GenericPages.tsx` | Generic list/detail/form page builders | Working |

---

## 8. Business Rules Identified

1. **Phone-based login:** Users log in with phone number, converted to synthetic email `{phone}@khwwc.local`
2. **8 roles:** member, admin, treasurer, secretary, vice-secretary, chairperson, office, super-admin
3. **Minutes workflow:** Vice-Secretary creates → submits → Secretary reviews → Chairperson approves/rejects
4. **Payout types:** wedding, death_member, death_spouse, death_child, death_parent, retirement, emergency, medical
5. **Wallet types:** operational, contributions, penalty, donation
6. **Payout wallet sources:** operational, donation, penalty
7. **Contribution status:** pending, confirmed, failed
8. **Withdrawal status:** pending, approved, rejected, paid
9. **Expense status:** pending, approved, paid, rejected
10. **Penalty status:** unpaid, paid, waived
11. **Document status:** pending, approved, rejected, expired
12. **Minutes status:** draft, submitted_to_secretary, pending_chairperson_approval, rejected_by_secretary, approved, rejected
13. **Organization payouts:** bereavement, medical, education (configurable amounts in org settings)
14. **Bank statement import:** Chunked at 200 rows per batch; matches by phone; detects duplicates
15. **M-Pesa STK Push:** Initiated via `/payments/stk-push`, polled via `/payments/status/{checkoutRequestId}`

---

## 9. Recommendations

### 9.1 Immediate (Phase 1)

1. Fix all React hooks violations (`MemberProfile`, `TreasurerSettings`, `ContentListPage`)
2. Fix XSS in `WithdrawalReceipts` print function
3. Fix `AppLayout.allRoles` to include `'vice-secretary'`
4. Fix `mockSecretary.deleteMinutes` endpoint mismatch
5. Fix `AdminNews` calling wrong API endpoint

### 9.2 Frontend Integration (Phase 3)

1. Replace all `mockMember`/`mockAdmin`/`mockTreasurer` imports with direct API module imports guarded by `getDemoMode()`
2. Add `onError` handlers to all mutations
3. Add `ErrorState` to `WalletPages`, `BankSync`, `ImportHistory`, `TreasurerReports`
4. Implement all decorative/no-op buttons (download, upload, settings forms)
5. Fix `logout()` to call `authApi.logout()`
6. Add server session revalidation on reload

### 9.3 Backend (Phase 2 — Copilot)

1. Implement Laravel backend per the generated blueprint
2. Use `jwt-auth` package for JWT authentication
3. Implement all 170 REST endpoints with proper controllers, services, policies
4. Use MySQL with proper migrations, foreign keys, and indexes
5. Implement financial safety (idempotency, audit trail, reconciliation)

### 9.4 Supabase Migration

1. Migrate group chat to Laravel + WebSockets (or keep Supabase with proper RLS)
2. Migrate AI assistant to Laravel-controlled edge function with auth
3. Add RLS policies to all Supabase chat tables

---

## 10. File Count Summary

| Category | Files | Lines (approx) |
|----------|-------|----------------|
| API layer | 15 | ~2,500 |
| Auth | 2 | ~300 |
| Components | 7 | ~3,000 |
| Pages (member) | 14 | ~5,000 |
| Pages (treasurer) | 15 | ~6,000 |
| Pages (admin) | 4 | ~4,000 |
| Pages (roles) | 1 | ~3,000 |
| Pages (super-admin) | 1 | ~2,000 |
| Pages (website) | 1 | ~2,500 |
| Pages (public) | 6 | ~2,000 |
| Pages (auth) | 2 | ~500 |
| Layouts | 2 | ~800 |
| Config | 1 | ~500 |
| Lib | 2 | ~500 |
| Types | 1 | ~520 |
| Supabase functions | 1 | ~300 |
| Supabase migrations | 3 | ~400 |
| Docs | 8 | ~15,000 |
| **Total** | **~87** | **~48,000** |

---

## Audit Conclusion

The KHWWC frontend is feature-complete in terms of UI coverage but functionally incomplete for production use. The primary blocker is the absence of a Laravel backend and the pervasive use of demo data even when the demo toggle is off. The existing `API_BASE_URL`, TypeScript types, and API module signatures provide a solid contract for the Laravel backend to implement against.

**Priority:** Generate the complete Laravel backend blueprint and documentation, then fix the frontend's demo-mode wiring to ensure production mode calls real APIs.
