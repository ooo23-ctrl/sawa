# KHWWC API Contract Matrix

**Date:** 2026-10-13
**Base URL (production):** `https://api.khwwc.co.ke/api`
**Auth:** Bearer JWT token (sessionStorage key `khwwc_token`)
**Content-Type:** `application/json` (except file uploads: `multipart/form-data`)

> See `docs/API_MATRIX.md` for the full 150-endpoint reference. This document
> summarizes the contract for each module: method, path, required role, request
> body, and response shape.

---

## 1. Auth Module (15 endpoints)

| Method | Endpoint | Role | Body | Response |
|--------|----------|------|------|----------|
| POST | `/auth/login` | public | `{email, password}` | `{token, user}` |
| POST | `/auth/register` | public | `{name, email, password, phone, county, workplace}` | `{user}` |
| POST | `/auth/forgot-password` | public | `{email}` | `{message}` |
| POST | `/auth/reset-password` | public | `{token, password}` | `{message}` |
| POST | `/auth/verify-email` | public | `{token}` | `{message}` |
| GET | `/auth/profile` | authenticated | — | `{user}` |
| PUT | `/auth/profile` | authenticated | `{name, phone, ...}` | `{user}` |
| POST | `/auth/change-password` | authenticated | `{current, password}` | `{message}` |
| POST | `/auth/logout` | authenticated | — | `{message}` |
| GET | `/auth/permissions` | authenticated | — | `{permissions[]}` |
| POST | `/auth/refresh` | authenticated | — | `{token}` |
| GET | `/auth/2fa/status` | authenticated | — | `{enabled}` |
| POST | `/auth/2fa/enable` | authenticated | — | `{qr_code}` |
| POST | `/auth/2fa/verify` | authenticated | `{code}` | `{message}` |
| POST | `/auth/2fa/disable` | authenticated | `{code}` | `{message}` |

---

## 2. Public Website Module (8 endpoints)

| Method | Endpoint | Role | Body | Response |
|--------|----------|------|------|----------|
| GET | `/public/home` | public | — | `{hero, stats, news[], events[]}` |
| GET | `/public/leadership` | public | — | `{people[]}` |
| GET | `/public/people/{slug}` | public | — | `{person}` |
| GET | `/public/content/{type}` | public | — | `{data[], meta}` |
| GET | `/public/content/{type}/{slug}` | public | — | `{article}` |
| GET | `/public/events` | public | — | `{events[]}` |
| POST | `/public/contact` | public | `{name, email, subject, message}` | `{message}` |
| GET | `/public/settings` | public | — | `{settings}` |

---

## 3. Member Module (14 endpoints)

| Method | Endpoint | Role | Body | Response |
|--------|----------|------|------|----------|
| GET | `/member/dashboard` | member | — | `{stats, contributions[], notifications[]}` |
| GET | `/member/contributions` | member | — | `{data[], meta}` |
| GET | `/member/documents` | member | — | `{data[]}` |
| POST | `/member/documents` | member | `multipart: file, type` | `{document}` |
| GET | `/member/downloads` | member | — | `{statements[], receipts[]}` |
| GET | `/member/beneficiaries` | member | — | `{data[]}` |
| POST | `/member/beneficiaries` | member | `{name, relationship, phone, ...}` | `{beneficiary}` |
| GET | `/member/notifications` | member | — | `{data[]}` |
| GET | `/member/events` | member | — | `{data[]}` |
| GET | `/member/news` | member | — | `{data[]}` |
| POST | `/member/withdrawal-request` | member | `{amount, reason}` | `{request}` |
| GET | `/member/withdrawal-receipts` | member | — | `{data[]}` |
| POST | `/member/pay-penalty` | member | `{penalty_id, method}` | `{payment}` |
| POST | `/member/donate` | member | `{amount, campaign_id, method}` | `{donation}` |

---

## 4. Documents Module (6 endpoints)

| Method | Endpoint | Role | Body | Response |
|--------|----------|------|------|----------|
| GET | `/documents` | authenticated | — | `{data[]}` |
| POST | `/documents` | authenticated | `multipart: file` | `{document}` |
| GET | `/documents/{id}` | authenticated | — | `{document}` |
| DELETE | `/documents/{id}` | authenticated | — | `{message}` |
| GET | `/documents/download/{id}` | authenticated | — | `binary` |
| POST | `/documents/sign/{id}` | authenticated | `{signature_data}` | `{message}` |

---

## 5. Payments Module (4 endpoints)

| Method | Endpoint | Role | Body | Response |
|--------|----------|------|------|----------|
| POST | `/payments/mpesa/stk` | authenticated | `{phone, amount, account}` | `{response}` |
| POST | `/payments/mpesa/callback` | public (webhook) | `{Body}` | `{ResultCode}` |
| GET | `/payments/status/{id}` | authenticated | — | `{status}` |
| GET | `/payments/receipt/{id}` | authenticated | — | `binary` |

---

## 6. Treasurer Module (22 endpoints)

| Method | Endpoint | Role | Body | Response |
|--------|----------|------|------|----------|
| GET | `/treasurer/dashboard` | treasurer | — | `{balances, trends, pending[]}` |
| GET | `/treasurer/contributions` | treasurer | `?page` | `{data[], meta}` |
| PUT | `/treasurer/contributions/{id}` | treasurer | `{amount, status, ...}` | `{contribution}` |
| GET | `/treasurer/wallets` | treasurer | — | `{wallets[]}` |
| GET | `/treasurer/wallet/penalty` | treasurer | `?page` | `{data[], meta}` |
| GET | `/treasurer/wallet/donation` | treasurer | `?page` | `{data[], meta}` |
| GET | `/treasurer/wallet/operational` | treasurer | `?page` | `{data[], meta}` |
| GET | `/treasurer/withdrawal-approvals` | treasurer | — | `{data[]}` |
| POST | `/treasurer/withdrawal-approvals/{id}/{action}` | treasurer | — | `{message}` |
| GET | `/treasurer/bank-statement` | treasurer | `?page` | `{data[], meta}` |
| POST | `/treasurer/bank-statement/import` | treasurer | `multipart: file` | `{imported}` |
| GET | `/treasurer/book-balance` | treasurer | — | `{balance, entries[]}` |
| POST | `/treasurer/book-balance/import` | treasurer | `multipart: file` | `{imported}` |
| GET | `/treasurer/bank-sync` | treasurer | — | `{last_sync, status}` |
| POST | `/treasurer/bank-sync/trigger` | treasurer | — | `{imported}` |
| GET | `/treasurer/wallet-reports` | treasurer | — | `{reports[]}` |
| GET | `/treasurer/expenses` | treasurer | `?page` | `{data[], meta}` |
| POST | `/treasurer/expenses` | treasurer | `{description, amount, category}` | `{expense}` |
| POST | `/treasurer/expenses/{id}/{action}` | treasurer | — | `{message}` |
| GET | `/treasurer/reports` | treasurer | — | `{reports[]}` |
| GET | `/treasurer/documents` | treasurer | — | `{data[]}` |
| GET | `/treasurer/settings` | treasurer | — | `{settings}` |
| PUT | `/treasurer/settings` | treasurer | `{settings}` | `{message}` |
| GET | `/treasurer/donation-campaigns` | treasurer | — | `{campaigns[]}` |
| POST | `/treasurer/donation-campaigns` | treasurer | `{title, target, ...}` | `{campaign}` |
| GET | `/treasurer/memos` | treasurer | — | `{memos[]}` |
| POST | `/treasurer/memos` | treasurer | `{title, subject, body}` | `{memo}` |
| GET | `/treasurer/payouts` | treasurer | — | `{payouts[]}` |
| POST | `/treasurer/payouts` | treasurer | `{member_id, type, amount}` | `{payout}` |
| GET | `/treasurer/payouts/eligible/{type}` | treasurer | — | `{members[]}` |

---

## 7. Admin Module (24 endpoints)

| Method | Endpoint | Role | Body | Response |
|--------|----------|------|------|----------|
| GET | `/admin/dashboard` | admin | — | `{stats, trends, signups[]}` |
| GET | `/admin/members` | admin | `?page, search, status` | `{data[], meta}` |
| GET | `/admin/members/{id}` | admin | — | `{member}` |
| GET | `/admin/members/{id}/contributions` | admin | — | `{contributions[]}` |
| GET | `/admin/members/{id}/beneficiaries` | admin | — | `{beneficiaries[]}` |
| GET | `/admin/contributions` | admin | `?page, status` | `{data[], meta}` |
| POST | `/admin/import` | admin | `multipart: file` | `{imported}` |
| POST | `/admin/import/beneficiaries` | admin | `multipart: file` | `{imported}` |
| GET | `/admin/beneficiaries` | admin | `?page` | `{data[], meta}` |
| GET | `/admin/payments` | admin | `?page` | `{data[], meta}` |
| GET | `/admin/payments/unmatched` | admin | — | `{payments[]}` |
| POST | `/admin/payments/{id}/match` | admin | `{member_id}` | `{message}` |
| POST | `/admin/sms/bulk` | admin | `{message, recipients}` | `{message}` |
| GET | `/admin/events` | admin | — | `{events[]}` |
| POST | `/admin/events` | admin | `{title, date, ...}` | `{event}` |
| GET | `/admin/documents` | admin | — | `{data[]}` |
| GET | `/admin/news` | admin | — | `{data[]}` |
| GET | `/admin/beneficiary-requests` | admin | — | `{data[]}` |
| GET | `/admin/defaulters` | admin | — | `{defaulters[]}` |
| GET | `/admin/notifications` | admin | — | `{data[]}` |
| GET | `/admin/penalties` | admin | — | `{penalties[]}` |
| POST | `/admin/penalties/{id}/verify` | admin | — | `{message}` |
| GET | `/admin/donations` | admin | — | `{donations[]}` |
| GET | `/admin/donation-campaigns` | admin | — | `{campaigns[]}` |
| GET | `/admin/withdrawal-approvals` | admin | — | `{withdrawals[]}` |
| POST | `/admin/withdrawal-approvals/{id}/{action}` | admin | — | `{message}` |
| GET | `/admin/settings` | admin | — | `{settings}` |

---

## 8. Website CMS Module (14 endpoints)

| Method | Endpoint | Role | Body | Response |
|--------|----------|------|------|----------|
| GET | `/website/dashboard` | admin | — | `{stats, content[], messages[]}` |
| GET | `/website/content` | admin | `?page` | `{data[], meta}` |
| POST | `/website/content` | admin | `{title, type, content, ...}` | `{content}` |
| PUT | `/website/content/{id}` | admin | `{...fields}` | `{content}` |
| DELETE | `/website/content/{id}` | admin | — | `{message}` |
| GET | `/website/people` | admin | — | `{people[]}` |
| POST | `/website/people` | admin | `{name, title, ...}` | `{person}` |
| PUT | `/website/people/{id}` | admin | `{...fields}` | `{person}` |
| DELETE | `/website/people/{id}` | admin | — | `{message}` |
| GET | `/website/contact-messages` | admin | `?page` | `{data[], meta}` |
| POST | `/website/contact-messages/{id}/read` | admin | — | `{message}` |
| GET | `/website/media` | admin | — | `{media[]}` |
| GET | `/website/settings/{section}` | admin | — | `{settings}` |
| PUT | `/website/settings/{section}` | admin | `{...fields}` | `{message}` |
| GET | `/website/email-templates` | admin | — | `{templates[]}` |
| PUT | `/website/email-templates/{id}` | admin | `{subject, body}` | `{template}` |

---

## 9. Minutes / Signature Module (10 endpoints)

| Method | Endpoint | Role | Body | Response |
|--------|----------|------|------|----------|
| GET | `/minutes` | secretary+ | — | `{data[]}` |
| POST | `/minutes` | secretary+ | `{title, meeting_date, content}` | `{minutes}` |
| PUT | `/minutes/{id}` | secretary+ | `{...fields}` | `{minutes}` |
| DELETE | `/minutes/{id}` | secretary+ | — | `{message}` |
| POST | `/minutes/{id}/submit` | secretary+ | — | `{message}` |
| POST | `/minutes/{id}/review` | secretary | `{decision, notes?}` | `{message}` |
| POST | `/minutes/{id}/approve` | chairperson | `{action}` | `{message}` |
| GET | `/signatures` | authenticated | — | `{signatures[]}` |
| POST | `/signatures/upload` | authenticated | `multipart: file` | `{signature}` |
| GET | `/signatures/download/{id}` | authenticated | — | `binary` |

---

## 10. Role-Specific Module (12 endpoints)

### Secretary

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| GET | `/secretary/dashboard` | — | `{stats, pending[], upcoming[]}` |
| GET | `/secretary/minutes-review` | — | `{minutes[]}` |
| GET | `/secretary/schedule` | — | `{meetings[]}` |
| POST | `/secretary/schedule` | `{title, date, ...}` | `{meeting}` |

### Chairperson

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| GET | `/chairperson/dashboard` | — | `{stats, pending[]}` |
| GET | `/chairperson/pending-approvals` | — | `{minutes[]}` |
| POST | `/chairperson/approve/{id}` | `{action}` | `{message}` |

### Vice Secretary

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| GET | `/vice-secretary/dashboard` | — | `{stats, documents[], events[]}` |

### Office

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| GET | `/office/dashboard` | — | `{stats, activities[]}` |

---

## 11. Super Admin Module (14 endpoints)

| Method | Endpoint | Role | Body | Response |
|--------|----------|------|------|----------|
| GET | `/super-admin/dashboard` | super-admin | — | `{total_users, online_users, total_members, system_health[], recent_logins[], pending_alerts}` |
| GET | `/super-admin/members/{id}` | super-admin | — | `{member}` |
| GET | `/super-admin/troubleshooting` | super-admin | — | `{issues[], diagnostics[]}` |
| GET | `/super-admin/audit-logs` | super-admin | `?page` | `{data[], meta}` |
| GET | `/super-admin/security` | super-admin | — | `{two_factor, password_policy, session_timeout}` |
| PUT | `/super-admin/security` | super-admin | `{...settings}` | `{message}` |
| GET | `/super-admin/passwords` | super-admin | — | `{policies[], expired, forced}` |
| GET | `/super-admin/access-control` | super-admin | — | `{roles[]}` |
| PUT | `/super-admin/access-control/{id}` | super-admin | `{permissions[]}` | `{message}` |
| GET | `/super-admin/online-users` | super-admin | — | `{users[]}` |
| GET | `/super-admin/login-activity` | super-admin | `?page` | `{data[], meta}` |
| GET | `/super-admin/system-monitoring` | super-admin | — | `{metrics[], services[]}` |
| GET | `/super-admin/database` | super-admin | — | `{size, tables, connections, slow_queries}` |
| GET | `/super-admin/system` | super-admin | — | `{version, uptime, environment, features[]}` |
| GET | `/super-admin/trace` | super-admin | — | `{traces[]}` |

---

## 12. AI Assistant (SSE)

| Method | Endpoint | Role | Body | Response |
|--------|----------|------|------|----------|
| POST | `/ai-assistant` | authenticated | `{message, conversation_id?}` | `text/event-stream` (SSE) |
| GET | `/ai-assistant/conversations` | authenticated | — | `{conversations[]}` |
| GET | `/ai-assistant/conversations/{id}` | authenticated | — | `{messages[]}` |

---

## 13. Group Chat (Supabase Realtime — direct, no Laravel)

| Operation | Table | Realtime Channel |
|-----------|-------|-----------------|
| List conversations | `group_conversations` | — |
| Create conversation | `group_conversations` | — |
| Send message | `group_messages` | `conversation:{id}` |
| Typing indicator | `chat_typing_users` | `conversation:{id}` |
| Reactions | `group_reactions` | `conversation:{id}` |

---

## Error Response Format

All endpoints return errors as:

```json
{
  "message": "Human-readable error",
  "errors": { "field": ["validation message"] }
}
```

Status codes: 200 (success), 201 (created), 400 (bad request), 401 (unauthorized), 403 (forbidden), 404 (not found), 422 (validation), 500 (server error).
