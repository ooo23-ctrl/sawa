# KHWWC — Role Permission Matrix

**Date:** 2026-10-13  
**Purpose:** Server-side authorization rules per endpoint per role

---

## 1. Role Definitions

| Role | Key | Description | Scope |
|------|-----|-------------|-------|
| Member | `member` | Standard welfare member | Own data only |
| Admin | `admin` | Administrator | All members, events, notifications, imports |
| Treasurer | `treasurer` | Financial officer | All financial operations, wallets, payouts |
| Secretary | `secretary` | Minutes review & meetings | Minutes review, meeting scheduling |
| Vice-Secretary | `vice-secretary` | Minutes drafting | Minutes creation, submission |
| Chairperson | `chairperson` | Final approvals | Minutes approval/rejection |
| Office | `office` | Office staff | Dashboard summary only |
| Super-Admin | `super-admin` | Full system access | Everything |

---

## 2. Permission Matrix

### 2.1 Auth Module

| Endpoint | member | admin | treasurer | secretary | vice-secretary | chairperson | office | super-admin |
|----------|--------|-------|-----------|-----------|----------------|-------------|--------|-------------|
| POST /auth/login | Public | Public | Public | Public | Public | Public | Public | Public |
| POST /auth/logout | Own | Own | Own | Own | Own | Own | Own | Own |
| GET /auth/me | Own | Own | Own | Own | Own | Own | Own | Own |
| POST /auth/password | Own | Own | Own | Own | Own | Own | Own | Own |
| POST /auth/force-password-change | Own | Own | Own | Own | Own | Own | Own | Own |
| POST /auth/v1/password | Own | - | - | - | - | - | - | - |

### 2.2 Public Website Module

| Endpoint | All roles | Anonymous |
|----------|-----------|-----------|
| GET /public/website/settings | Yes | Yes |
| GET /public/website/content/{type} | Yes | Yes |
| GET /public/website/content/{type}/{slug} | Yes | Yes |
| GET /public/website/leadership | Yes | Yes |
| GET /public/website/people/{slug} | Yes | Yes |
| POST /public/website/contact | Yes | Yes |

### 2.3 Member Portal Module

| Endpoint | member | admin | treasurer | secretary | vice-secretary | chairperson | office | super-admin |
|----------|--------|-------|-----------|-----------|----------------|-------------|--------|-------------|
| GET /member/dashboard | Own | - | - | - | - | - | - | All |
| GET /member/profile | Own | - | - | - | - | - | - | All |
| PUT /member/profile | Own | - | - | - | - | - | - | - |
| GET /member/contributions | Own | - | - | - | - | - | - | All |
| GET /member/beneficiaries | Own | - | - | - | - | - | - | All |
| POST /member/beneficiaries | Own | - | - | - | - | - | - | - |
| PUT /member/beneficiaries/{id} | Own | - | - | - | - | - | - | - |
| DELETE /member/beneficiaries/{id} | Own | - | - | - | - | - | - | - |
| GET /member/notifications | Own | - | - | - | - | - | - | - |
| PATCH /member/notifications/{id}/read | Own | - | - | - | - | - | - | - |
| GET /member/documents | Own | - | - | - | - | - | - | - |
| GET /member/events | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| GET /member/news | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| GET /member/penalties | Own | - | - | - | - | - | - | All |
| POST /member/penalties/{id}/pay | Own | - | - | - | - | - | - | - |
| GET /member/withdrawal-receipts | Own | - | - | - | - | - | - | All |
| GET /member/donation-campaigns | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| POST /member/donate | Own | - | - | - | - | - | - | - |
| GET /member/downloads/statement | Own | - | - | - | - | - | - | All |
| GET /member/downloads/receipt/{id} | Own | - | - | - | - | - | - | All |
| GET /member/executive/{roleName} | - | - | - | Own | Own | Own | Own | Own |

### 2.4 Documents Module (Shared)

| Endpoint | member | admin | treasurer | secretary | vice-secretary | chairperson | office | super-admin |
|----------|--------|-------|-----------|-----------|----------------|-------------|--------|-------------|
| GET /documents/me/summary | Own | Own | Own | Own | Own | Own | Own | All |
| GET /documents/types | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| POST /documents | Own | - | - | - | - | - | - | - |
| POST /documents/{id}/replace | Own | - | - | - | - | - | - | - |
| DELETE /documents/{id} | Own | - | - | - | - | - | - | - |

### 2.5 Payments Module

| Endpoint | member | admin | treasurer | secretary | vice-secretary | chairperson | office | super-admin |
|----------|--------|-------|-----------|-----------|----------------|-------------|--------|-------------|
| POST /payments/stk-push | Own | - | - | - | - | - | - | - |
| GET /payments/status/{id} | Own | Own | Own | - | - | - | - | Own |
| POST /payments/mpesa-callback | Public (verified by signature) | | | | | | | |

### 2.6 Treasurer Module

| Endpoint | member | admin | treasurer | secretary | vice-secretary | chairperson | office | super-admin |
|----------|--------|-------|-----------|-----------|----------------|-------------|--------|-------------|
| GET /treasurer/dashboard | - | - | Yes | - | - | - | - | Yes |
| GET /treasurer/contributions | - | - | All | - | - | - | - | All |
| POST /treasurer/contributions/{id}/adjust | - | - | Yes | - | - | - | - | Yes |
| GET /treasurer/*-wallet | - | - | All | - | - | - | - | All |
| GET /treasurer/wallets | - | - | All | - | - | - | - | All |
| GET /treasurer/wallet-reports | - | - | All | - | - | - | - | All |
| GET /treasurer/withdrawal-approvals | - | - | All | - | - | - | - | All |
| POST /treasurer/withdrawal-approvals/{id}/* | - | - | Yes | - | - | - | - | Yes |
| GET /treasurer/documents | - | - | All | - | - | - | - | All |
| GET /treasurer/reports | - | - | All | - | - | - | - | All |
| GET /treasurer/reports/{type}/export | - | - | All | - | - | - | - | All |
| GET /treasurer/bank-sync | - | - | All | - | - | - | - | All |
| POST /treasurer/bank-sync | - | - | Yes | - | - | - | - | Yes |
| GET /treasurer/bank-statement | - | - | All | - | - | - | - | All |
| POST /treasurer/bank-statement-import | - | - | Yes | - | - | - | - | Yes |
| POST /treasurer/book-balance-import | - | - | Yes | - | - | - | - | Yes |
| GET /treasurer/book-balance | - | - | All | - | - | - | - | All |
| GET /treasurer/expenses | - | - | All | - | - | - | - | All |
| POST /treasurer/expenses | - | - | Yes | - | - | - | - | Yes |
| POST /treasurer/expenses/{id}/* | - | - | Yes | - | - | - | - | Yes |
| /treasurer/donation-campaigns (all) | - | - | Yes | - | - | - | - | Yes |
| /treasurer/memos (all) | - | - | Yes | - | - | - | - | Yes |
| /treasurer/memo-templates | - | - | All | - | - | - | - | All |
| /treasurer/settings | - | - | Yes | - | - | - | - | Yes |
| /treasurer/payouts (all) | - | - | Yes | - | - | - | - | Yes |

### 2.7 Admin Module

| Endpoint | member | admin | treasurer | secretary | vice-secretary | chairperson | office | super-admin |
|----------|--------|-------|-----------|-----------|----------------|-------------|--------|-------------|
| GET /admin/dashboard | - | Yes | - | - | - | - | - | Yes |
| GET /admin/members | - | All | - | - | - | - | - | All |
| GET /admin/members/{id} | - | All | - | - | - | - | - | All |
| GET /admin/members/{id}/contributions | - | All | - | - | - | - | - | All |
| GET /admin/members/{id}/beneficiaries | - | All | - | - | - | - | - | All |
| GET /admin/contributions | - | All | - | - | - | - | - | All |
| GET /admin/beneficiaries | - | All | - | - | - | - | - | All |
| GET /admin/defaulters | - | All | - | - | - | - | - | All |
| GET /admin/payments | - | All | - | - | - | - | - | All |
| GET /admin/unmatched | - | All | - | - | - | - | - | All |
| POST /admin/unmatched/{id}/match | - | Yes | - | - | - | - | - | Yes |
| GET /admin/notifications | - | All | - | - | - | - | - | All |
| POST /admin/sms | - | Yes | - | - | - | - | - | Yes |
| GET /admin/events | - | All | - | - | - | - | - | All |
| POST /admin/events | - | Yes | - | - | - | - | - | Yes |
| GET /admin/documents | - | All | - | - | - | - | - | All |
| GET /admin/penalty-payments | - | All | - | - | - | - | - | All |
| POST /admin/penalty-payments/{id}/verify | - | Yes | - | - | - | - | - | Yes |
| GET /admin/donations | - | All | - | - | - | - | - | All |
| GET /admin/donation-campaigns | - | All | - | - | - | - | - | All |
| POST /admin/donation-campaigns | - | Yes | - | - | - | - | - | Yes |
| GET /admin/withdrawal-approval | - | All | - | - | - | - | - | All |
| POST /admin/withdrawal-approval/{id}/* | - | Yes | - | - | - | - | - | Yes |
| POST /admin/import | - | Yes | - | - | - | - | - | Yes |
| POST /admin/beneficiary-import | - | Yes | - | - | - | - | - | Yes |

### 2.8 Website CMS Module

| Endpoint | member | admin | treasurer | secretary | vice-secretary | chairperson | office | super-admin |
|----------|--------|-------|-----------|-----------|----------------|-------------|--------|-------------|
| All /admin/website/* | - | Yes | - | - | - | - | - | Yes |

### 2.9 Secretary Module

| Endpoint | member | admin | treasurer | secretary | vice-secretary | chairperson | office | super-admin |
|----------|--------|-------|-----------|-----------|----------------|-------------|--------|-------------|
| GET /secretary/dashboard | - | - | - | Yes | - | - | - | Yes |
| GET /secretary/minutes-review | - | - | - | All | - | - | - | All |
| POST /secretary/minutes/{id}/submit-review | - | - | - | Yes | - | - | - | Yes |
| GET /secretary/meeting-minutes | - | - | - | All | - | - | - | All |
| POST /secretary/meeting-minutes | - | - | - | Yes | - | - | - | Yes |
| PUT /secretary/meeting-minutes/{id} | - | - | - | Yes | - | - | - | Yes |
| GET /secretary/meeting-scheduling | - | - | - | All | - | - | - | All |
| POST /secretary/meeting-scheduling | - | - | - | Yes | - | - | - | Yes |
| POST /secretary/meeting-scheduling/{id}/cancel | - | - | - | Yes | - | - | - | Yes |

### 2.10 Vice-Secretary Module

| Endpoint | member | admin | treasurer | secretary | vice-secretary | chairperson | office | super-admin |
|----------|--------|-------|-----------|-----------|----------------|-------------|--------|-------------|
| GET /vice-secretary/dashboard | - | - | - | - | Yes | - | - | Yes |
| GET /vice-secretary/meeting-minutes | - | - | - | - | All | - | - | All |
| POST /vice-secretary/meeting-minutes | - | - | - | - | Yes | - | - | Yes |
| PUT /vice-secretary/meeting-minutes/{id} | - | - | - | - | Yes | - | - | Yes |
| POST /vice-secretary/meeting-minutes/{id}/submit | - | - | - | - | Yes | - | - | Yes |

### 2.11 Chairperson Module

| Endpoint | member | admin | treasurer | secretary | vice-secretary | chairperson | office | super-admin |
|----------|--------|-------|-----------|-----------|----------------|-------------|--------|-------------|
| GET /chairperson/dashboard | - | - | - | - | - | Yes | - | Yes |
| GET /chairperson/approve-minutes | - | - | - | - | - | All | - | All |
| POST /chairperson/approve-minutes/{id}/* | - | - | - | - | - | Yes | - | Yes |

### 2.12 Office Module

| Endpoint | member | admin | treasurer | secretary | vice-secretary | chairperson | office | super-admin |
|----------|--------|-------|-----------|-----------|----------------|-------------|--------|-------------|
| GET /office/dashboard | - | - | - | - | - | - | Yes | Yes |

### 2.13 Minutes Module (Shared)

| Endpoint | member | admin | treasurer | secretary | vice-secretary | chairperson | office | super-admin |
|----------|--------|-------|-----------|-----------|----------------|-------------|--------|-------------|
| GET /minutes | All (own) | All | All | All (review) | All (own) | All (approve) | - | All |
| GET /minutes/{id} | Own | All | All | All | Own | All | - | All |
| POST /minutes | - | - | - | - | Yes | - | - | Yes |
| PUT /minutes/{id} | - | - | - | - | Own (draft) | - | - | Yes |
| DELETE /minutes/{id} | - | - | - | - | Own (draft) | - | - | Yes |
| POST /minutes/{id}/submit | - | - | - | - | Own | - | - | Yes |
| POST /minutes/{id}/secretary-review | - | - | - | Yes | - | - | - | Yes |
| POST /minutes/{id}/approve | - | - | - | - | - | Yes | - | Yes |
| POST /minutes/{id}/reject | - | - | - | - | - | Yes | - | Yes |
| GET /minutes/executive-members | - | Yes | Yes | Yes | Yes | Yes | - | Yes |

### 2.14 Signatures Module (Shared)

| Endpoint | member | admin | treasurer | secretary | vice-secretary | chairperson | office | super-admin |
|----------|--------|-------|-----------|-----------|----------------|-------------|--------|-------------|
| GET /signatures/current | - | - | - | Yes (sec) | - | Yes (chair) | - | Yes |
| POST /signatures | - | - | - | Yes (sec) | - | Yes (chair) | - | Yes |

### 2.15 Super-Admin Module

| Endpoint | member | admin | treasurer | secretary | vice-secretary | chairperson | office | super-admin |
|----------|--------|-------|-----------|-----------|----------------|-------------|--------|-------------|
| All /super-admin/* | - | - | - | - | - | - | - | Yes |

---

## 3. Data Ownership Rules

| Data Type | Owner Access | Admin Access | Treasurer Access |
|-----------|-------------|--------------|------------------|
| Member profile | Own only | Read all | Read all |
| Contributions | Own only | Read all | Read + adjust all |
| Beneficiaries | Own CRUD | Read all | Read all |
| Penalties | Own read | Read + verify | Read all |
| Documents | Own CRUD | Read all | Read all |
| Notifications | Own only | Own (admin) | Own (treasurer) |
| Withdrawal requests | Own receipts | Approve all | Approve all |
| Donations | Own create | Read all | Read all |
| Meeting minutes | - | Read all | Read all | Read/review all | Create/submit own | Approve/reject all |

---

## 4. Minutes Workflow Authorization

```
Vice-Secretary (creator)
  ├── CREATE minutes (status: draft)
  ├── UPDATE own draft minutes
  ├── DELETE own draft minutes
  └── SUBMIT minutes (status: draft → submitted_to_secretary)
       │
       ▼
Secretary (reviewer)
  ├── READ submitted minutes
  ├── REVIEW minutes (approve → pending_chairperson_approval)
  │                     (reject → rejected_by_secretary)
  └── Can also create/edit/submit minutes (has secretary access)
       │
       ▼
Chairperson (approver)
  ├── READ minutes pending approval
  ├── APPROVE minutes (pending_chairperson_approval → approved)
  └── REJECT minutes (pending_chairperson_approval → rejected, with notes)
```

**Server enforcement:** Each transition checks the current status and the user's role. A vice-secretary cannot approve; a chairperson cannot create. The status field is the source of truth for workflow position.
