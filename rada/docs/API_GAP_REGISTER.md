# KHWWC — API Gap Register

**Date:** 2026-10-13  
**Purpose:** Document missing endpoints, inconsistent payloads, and unresolved decisions

---

## 1. Missing Endpoints (Frontend calls, backend not defined)

| ID | Frontend Call | Expected Path | Issue | Impact |
|----|--------------|---------------|-------|--------|
| G-01 | `mockTreasurer.getImportHistory()` | `GET /treasurer/import-batches` | Real API throws `Error('Not configured')` | Import history page unusable in production |
| G-02 | `mockTreasurer.getImportBatchDetail(id)` | `GET /treasurer/import-batches/{id}` | Real API throws `Error('Not configured')` | Batch detail view unusable in production |
| G-03 | `mockAdmin.getBankUnmatched()` | `GET /admin/bank-unmatched` | Real API throws `Error('Not configured')` | Bank unmatched page unusable in production |
| G-04 | `mockAdmin.reconcileBankUnmatched(id)` | `POST /admin/bank-unmatched/{id}/reconcile` | Real API throws `Error('Not configured')` | Reconciliation unusable in production |

## 2. Missing Endpoints (Frontend features exist, no API call defined)

| ID | Feature | Expected Endpoint | Current Behavior | Priority |
|----|---------|-------------------|------------------|----------|
| G-05 | Admin news management | `GET/POST/PUT /admin/news` | `AdminNews` calls `getEvents()` — wrong API | High |
| G-06 | Registration management | `GET/POST /admin/registration-applicants` | `AdminRegistrationManagement` returns empty array | Medium |
| G-07 | Executive badges | `GET /admin/executive-badges` | `AdminExecutiveBadges` returns empty array | Low |
| G-08 | Admin settings | `GET/PUT /admin/settings` | `AdminSettings` has no-op `onSubmit` | Medium |
| G-09 | Office signatures | `GET/POST /admin/office/signatures` | `AdminOfficeSignatures` has no-op `onSubmit` | Low |
| G-10 | Registration settings | `GET/PUT /admin/registration-settings` | `AdminRegistrationSettings` has no-op `onSubmit` | Low |
| G-11 | Treasurer report download | `GET /treasurer/reports/{type}/export` | Download buttons have no onClick | High |
| G-12 | Treasurer document download | `GET /treasurer/documents/{id}/download` | Download buttons have no onClick | Medium |
| G-13 | Settings file upload (logo/signature/stamp) | `POST /treasurer/settings/upload` | Upload areas are decorative | High |
| G-14 | Member change password | `POST /auth/v1/password` | Uses different path from `authApi.changePassword` | Medium |
| G-15 | REST alias for members | `GET /rest/v1/members` | Called by `minutesApi.getMembers()` — unclear if Laravel or Supabase REST | Medium |

## 3. Inconsistent Payloads

| ID | Issue | Details |
|----|-------|---------|
| G-16 | Secretary review decision | `mockSecretary.secretaryReview` calls `submitForReview(id)` for both approve and reject — the decision is lost. Should call `secretaryReview(id, decision, notes)` |
| G-17 | Secretary delete minutes | `mockSecretary.deleteMinutes` calls `cancelMeeting(id)` — wrong endpoint. Should call `minutesApi.delete(id)` |
| G-18 | Bank statement import dual path | `treasurerApi.importBankStatement(file)` sends a file upload; `importsApi.bankStatement(rows, meta)` sends JSON. Both hit same endpoint `/treasurer/bank-statement-import`. Backend must handle both content types |
| G-19 | Password change paths | `authApi.changePassword` → `/auth/password`; `memberApi.changePassword` → `/auth/v1/password`. Two different paths for same feature |
| G-20 | M-Pesa callback | No frontend call, but backend must implement `POST /payments/mpesa-callback` for Safaricom callbacks. Not in frontend API matrix |

## 4. Unresolved Decisions

| ID | Decision | Context | Options | Recommendation |
|----|----------|---------|---------|----------------|
| D-01 | Laravel version | PHP 8.4 requested, Laravel 13 requested | Laravel 13 may not exist yet (Laravel 11.x is current stable as of 2024) | Use latest stable Laravel (11.x) with PHP 8.3+; document version mismatch |
| D-02 | JWT package | Need maintained JWT package for Laravel | `tymon/jwt-auth` (fork: `php-open-source-saver/jwt-auth`) | Use `php-open-source-saver/jwt-auth` — actively maintained fork |
| D-03 | Group chat architecture | Currently Supabase direct DB + Realtime | Keep Supabase or migrate to Laravel + WebSockets | Keep Supabase with RLS policies; document migration path for later |
| D-04 | AI assistant architecture | Currently Supabase edge function | Keep edge function or move to Laravel | Keep edge function; add auth verification via JWT |
| D-05 | Real-time solution | Group chat needs real-time | Laravel Reverb, Laravel Echo, or Supabase Realtime | Keep Supabase Realtime for group chat |
| D-06 | File storage | Document uploads, profile photos, signatures | Local disk, S3, Supabase Storage | Use Laravel filesystem with local disk for dev; S3 for production |
| D-07 | M-Pesa integration | STK push and callback handling | Daraja API sandbox for dev, production for prod | Use sandbox; implement callback URL with signature verification |
| D-08 | PDF generation | Reports, statements, receipts | dompdf, mpdf, Snappy | Use `barryvdh/laravel-dompdf` |
| D-09 | SMS gateway | Bulk SMS to members | Africa's Talking API | Use `africastalking/africastalking` package or direct API |
| D-10 | Redis availability | Caching, queues, rate limiting | Redis or database fallback | Use Redis if available; database fallback for queues/cache |

## 5. Frontend Issues Affecting Backend Contract

| ID | Issue | Backend Impact |
|----|-------|----------------|
| F-01 | `memberApi.changePassword` sends `{ new_password }` without confirmation | Backend should still validate confirmation server-side |
| F-02 | `WithdrawalReceipts` print builds HTML without escaping | Backend should sanitize all user-provided strings in responses |
| F-03 | `MemberDownloads.exportMembershipCard` hardcodes member data | Backend should provide a `GET /member/downloads/membership-card` endpoint |
| F-04 | `TreasurerDashboard` hardcodes stats | Backend `/treasurer/dashboard` must return all displayed stats |
| F-05 | `AdminPages.AdminSettings` has no-op form | Define what settings are managed here (separate from org settings) |
| F-06 | `BankUnmatched` has 5 hardcoded member names | `GET /admin/bank-unmatched` must include searchable member list |
| F-07 | `CreateMemo` has 3 hardcoded recipient groups | Define `recipients` field in memo creation payload |

## 6. Supabase Dependency Audit

| Feature | Supabase Dependency | Migration Required? | Notes |
|---------|--------------------|--------------------|-------|
| AI Assistant | Edge function + tables | No (keep) | Add JWT auth verification |
| Group Chat | Direct DB + Realtime | No (keep with RLS) | Add RLS policies to all 5 chat tables |
| Profile photos | `storage/v1/object/profile-images/` | Maybe | Could use Laravel filesystem instead |
| Auth | None (uses Laravel JWT) | No | Frontend handles token in sessionStorage |

## 7. Endpoints Needing Clarification

| ID | Endpoint | Question |
|----|----------|----------|
| Q-01 | `GET /member/executive/{roleName}` | What stats are returned per role? Frontend shows generic stats. Backend needs to define role-specific dashboard data. |
| Q-02 | `GET /treasurer/payouts/eligible` | How is eligibility determined per payout type? Need business rules for each PayoutType. |
| Q-03 | `POST /treasurer/payouts` | What are the signatory requirements? Frontend has `signatories` array on Payout type. |
| Q-04 | `GET /admin/defaulters` | What constitutes a defaulter? How many missed periods triggers each status (warning/critical/action)? |
| Q-05 | `GET /treasurer/book-balance` | Is book balance a separate import or derived from bank transactions? |
| Q-06 | `POST /admin/import` | What Excel format is expected for member import? Column mapping needed. |
| Q-07 | `POST /admin/beneficiary-import` | What Excel format is expected for beneficiary import? |
| Q-08 | `GET /super-admin/system` | What version/uptime/environment data should be exposed? Should not expose sensitive config. |
| Q-09 | `GET /super-admin/trace` | What request tracing data is available? Need to define trace storage mechanism. |
| Q-10 | Minutes `visible_to_members` | Who can see approved minutes? All members or only those in the visible_to_members list? |

---

## Resolution Priority

1. **Immediate (blocks production):** G-01 through G-04 (broken endpoints), D-01 (Laravel version), D-02 (JWT package)
2. **High (feature gaps):** G-05, G-11, G-13, F-04
3. **Medium (inconsistencies):** G-14 through G-20, D-07, D-08, D-09
4. **Low (polish):** G-06 through G-10, remaining D-items
