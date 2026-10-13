# KHWWC Role Permission Matrix

**Date:** 2026-10-13
**Total Roles:** 8

This document maps each role to the modules, routes, and API endpoints it can access.

---

## Role Overview

| Role | Home Route | Nav Items | Can Switch To (demo) |
|------|------------|-----------|----------------------|
| member | `/member` | 11 + 4 mobile | All roles |
| admin | `/admin` | 31 | All roles |
| treasurer | `/treasurer` | 19 | All roles |
| secretary | `/secretary` | 7 | All roles |
| vice-secretary | `/vice-secretary` | 2 | All roles |
| chairperson | `/chairperson` | 4 | All roles |
| office | `/office` | 1 | All roles |
| super-admin | `/super-admin` | 43 | All roles |

> In demo mode, the AppLayout sidebar includes a role switcher dropdown that lets
> the user impersonate any of the 8 roles without re-logging in.

---

## Module Access Matrix

| Module | member | admin | treasurer | secretary | vice-sec | chairperson | office | super-admin |
|--------|--------|-------|-----------|-----------|----------|-------------|--------|-------------|
| Member Portal | RW | R | R | — | — | — | — | R |
| Admin Panel | — | RW | — | — | — | — | — | R |
| Treasurer Panel | — | R* | RW | — | — | — | — | R |
| Secretary Panel | — | — | — | RW | — | — | — | — |
| Vice Secretary | — | — | — | — | RW | — | — | — |
| Chairperson | — | — | — | — | — | RW | — | — |
| Office | — | — | — | — | — | — | RW | — |
| Super Admin | — | — | — | — | — | — | — | RW |
| Website CMS | — | RW | — | — | — | — | — | R |
| AI Chat | RW | RW | RW | RW | RW | RW | RW | RW |
| Group Chat | RW | RW | RW | RW | RW | RW | RW | RW |
| API Matrix | R | R | R | R | R | R | R | R |

`RW` = read+write, `R` = read-only, `R*` = treasurer routes accessible to admin, `—` = no access

---

## Route Access by Role

### Member Routes (role: member)

| Route | Permissions |
|-------|-------------|
| `/member` | View dashboard, contribution stats, notifications |
| `/member/events` | View upcoming/past events |
| `/member/documents` | Request documents, view status |
| `/member/downloads` | Download statements, receipts |
| `/member/withdrawal-receipts` | View withdrawal history |
| `/member/news` | Read news articles |
| `/member/beneficiaries` | CRUD own beneficiaries |
| `/member/notifications` | View/mark-read notifications |
| `/member/profile` | Update own profile, change password |
| `/member/pay-penalty` | Pay outstanding penalties via M-Pesa |
| `/member/donate` | Donate to active campaigns |
| `/member/executive/:roleName` | View executive dashboard for assigned role |

### Admin Routes (role: admin)

| Route | Permissions |
|-------|-------------|
| `/admin` | Dashboard: 512 members, 4.2M contributions, 7 pending approvals |
| `/admin/members` | List, search, filter, paginate members |
| `/admin/members/:id` | View member detail, contributions, beneficiaries |
| `/admin/contributions` | List, filter, verify contributions |
| `/admin/import` | Excel import (members) |
| `/admin/beneficiary-import` | Excel import (beneficiaries) |
| `/admin/beneficiaries` | List all beneficiaries |
| `/admin/payments` | Track all payments |
| `/admin/unmatched` | Match unmatched payments to members |
| `/admin/sms` | Send bulk SMS to members |
| `/admin/events` | CRUD events |
| `/admin/documents` | Manage document requests |
| `/admin/news` | CRUD news articles |
| `/admin/beneficiary-requests` | Approve/reject beneficiary requests |
| `/admin/defaulters` | View defaulters list |
| `/admin/notifications` | Manage notifications |
| `/admin/settings` | Admin settings |
| `/admin/banking/diagnostics` | Bank integration diagnostics |
| `/admin/signatures` | Manage office signatures |
| `/admin/penalty-payments` | Verify penalty payments |
| `/admin/penalty-wallet` | View penalty wallet |
| `/admin/donations` | View all donations |
| `/admin/donation-campaigns` | CRUD campaigns |
| `/admin/withdrawal-approval` | Approve/reject withdrawals |
| `/admin/registration-settings` | Registration form settings |
| `/admin/registration-management` | Manage registration applicants |
| `/admin/registration-api-docs` | View API documentation |
| `/admin/executive-badges` | Manage executive badges |
| `/admin/website/*` | Full CMS access (8 sub-routes) |

### Treasurer Routes (roles: treasurer, admin)

| Route | Permissions |
|-------|-------------|
| `/treasurer` | Dashboard: balances, bank reconciliation, trends |
| `/treasurer/contributions` | List, adjust contributions |
| `/treasurer/contribution-adjustments` | Adjust contribution amounts/status |
| `/treasurer/penalty-wallet` | View penalty wallet transactions |
| `/treasurer/donation-wallet` | View donation wallet transactions |
| `/treasurer/operational-wallet` | View operational wallet transactions |
| `/treasurer/withdrawal-approvals` | Approve/reject withdrawal requests |
| `/treasurer/documents` | Treasurer-specific documents |
| `/treasurer/reports` | Financial reports |
| `/treasurer/bank-sync` | Trigger bank sync |
| `/treasurer/bank-statement` | View bank statements |
| `/treasurer/bank-statement-import` | Import bank statement CSV |
| `/treasurer/book-balance-import` | Import book balance |
| `/treasurer/book-balance` | View book balance vs bank balance |
| `/treasurer/wallet-reports` | Per-wallet reports |
| `/treasurer/expenses` | Create, approve, reject expenses |
| `/treasurer/donation-campaigns` | CRUD donation campaigns |
| `/treasurer/memos` | Create, edit, send, delete memos |
| `/treasurer/settings` | Organization payout settings |

### Secretary Routes (role: secretary)

| Route | Permissions |
|-------|-------------|
| `/secretary` | Dashboard: pending minutes, approved count, meetings |
| `/secretary/events` | Manage events |
| `/secretary/minutes-review` | Review pending minutes, approve/reject |
| `/secretary/meeting-minutes` | CRUD meeting minutes |
| `/secretary/meeting-scheduling` | Schedule meetings |
| `/secretary/signature` | Upload signature |
| `/secretary/withdrawal-approvals` | Approve/reject withdrawals |

### Vice Secretary Routes (role: vice-secretary)

| Route | Permissions |
|-------|-------------|
| `/vice-secretary` | Dashboard: events, documents, members |
| `/vice-secretary/minutes` | Create/edit minutes, submit for review |

### Chairperson Routes (role: chairperson)

| Route | Permissions |
|-------|-------------|
| `/chairperson` | Dashboard: pending approvals, approved/rejected counts |
| `/chairperson/approve-minutes` | Approve or reject minutes |
| `/chairperson/signature` | Upload signature |
| `/chairperson/withdrawal-approvals` | Approve/reject withdrawals |

### Office Routes (role: office)

| Route | Permissions |
|-------|-------------|
| `/office` | Dashboard: members, pending applications, documents |

### Super Admin Routes (role: super-admin)

| Route | Permissions |
|-------|-------------|
| `/super-admin` | Full dashboard: KPIs, charts, member directory |
| `/super-admin/members/:id` | View any member detail |
| `/super-admin/troubleshooting` | System issues and diagnostics |
| `/super-admin/audit-logs` | Full audit trail |
| `/super-admin/security` | Security settings (2FA, password policy, IP whitelist) |
| `/super-admin/password-management` | Password policies, expired, forced resets |
| `/super-admin/access-control` | Roles, permissions, user counts |
| `/super-admin/online-users` | Currently active users |
| `/super-admin/login-activity` | Login success/failure history |
| `/super-admin/system-monitoring` | Real-time system metrics |
| `/super-admin/bank` | Bank integration configuration |
| `/super-admin/database` | Database size, tables, connections, backups |
| `/super-admin/system` | Version, uptime, environment, feature flags |
| `/super-admin/trace` | API request traces |
| `/super-admin/members` | (Admin reuse) Full member management |
| `/super-admin/contributions` | (Admin reuse) Contribution management |
| `/super-admin/*` (20 more) | (Admin reuse) All admin module pages |
| `/super-admin/website/*` | (CMS reuse) All website CMS pages |

---

## Minutes Approval Workflow

```
Vice Secretary → creates minutes → submits
     ↓
Secretary → reviews → approves (forwards) or rejects (returns)
     ↓
Chairperson → approves (final) or rejects (returns to secretary)
```

## Withdrawal Approval Workflow

```
Member → submits withdrawal request
     ↓
Treasurer → approves/rejects (can also be done by Admin, Secretary, Chairperson)
     ↓
Status: pending → approved → paid  (or rejected)
```

## Payout Approval Workflow

```
Treasurer → creates payout (wedding/death/medical/etc.)
     ↓
Signatories → co-sign (Secretary + Chairperson)
     ↓
Status: pending → approved → paid
```
