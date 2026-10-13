# KHWWC — Complete Laravel API Matrix

> Base URL: `{API_BASE_URL}` (default `https://api.khwwc.co.ke/api`)
>
> Auth: `Authorization: Bearer {jwt_token}` on every protected endpoint.
>
> All requests/responses are JSON (`Content-Type: application/json`, `Accept: application/json`) unless marked as **multipart** or **download**.
>
> 401 → frontend clears token + redirects to login.
>
> Paginated responses use: `{ data: T[], meta: { current_page, per_page, total, last_page } }`

---

## Legend

| Symbol | Meaning |
|--------|---------|
| 🔓 | Public (no auth) |
| 🔐 | Authenticated (any role) |
| 👤 | Member role |
| 🏛️ | Admin role |
| 💰 | Treasurer role |
| 📝 | Secretary role |
| 📋 | Vice-Secretary role |
| 🪑 | Chairperson role |
| 🏢 | Office role |
| 🛡️ | Super-Admin role |
| 📎 | Multipart form-data |
| 📥 | Binary download response |

---

## 1. Authentication Module

| # | Method | Path | Role | Body / Params | Response | Notes |
|---|--------|------|------|---------------|----------|-------|
| 1.1 | POST | `/auth/login` | 🔓 | `{ phone, password }` | `{ token, user: AuthUser, requires_password_change?: boolean }` | Returns JWT + user object. `phone` is the primary identifier. |
| 1.2 | POST | `/auth/logout` | 🔐 | — | `{ message }` | Invalidate JWT |
| 1.3 | GET | `/auth/me` | 🔐 | — | `AuthUser` | Current user from token |
| 1.4 | POST | `/auth/password` | 🔐 | `{ current_password, new_password, new_password_confirmation }` | `{ message }` | Self-service password change |
| 1.5 | POST | `/auth/force-password-change` | 🔐 | `{ new_password, new_password_confirmation }` | `{ message }` | Forced reset on first login |
| 1.6 | POST | `/auth/v1/password` | 👤 | `{ new_password }` | `{ message }` | Member change password (alt endpoint) |

---

## 2. Public Website Module

| # | Method | Path | Role | Body / Params | Response |
|---|--------|------|------|---------------|----------|
| 2.1 | GET | `/public/website/settings` | 🔓 | — | `WebsiteSettings` |
| 2.2 | GET | `/public/website/content/{type}` | 🔓 | `?page` | `Paginated<WebsiteContent>` |
| 2.3 | GET | `/public/website/content/{type}/{slug}` | 🔓 | — | `WebsiteContent` |
| 2.4 | GET | `/public/website/leadership` | 🔓 | — | `LeadershipPerson[]` |
| 2.5 | GET | `/public/website/people/{slug}` | 🔓 | — | `LeadershipPerson` |
| 2.6 | POST | `/public/website/contact` | 🔓 | `{ name, email, subject, message }` | `{ message }` |

---

## 3. Member Portal Module

| # | Method | Path | Role | Body / Params | Response |
|---|--------|------|------|---------------|----------|
| 3.1 | GET | `/member/dashboard` | 👤 | — | `{ contributions_total, contributions_count, penalties_total, donations_total, wallet_balance, upcoming_events: EventItem[], recent_contributions: Contribution[], unread_notifications, status }` |
| 3.2 | GET | `/member/contributions` | 👤 | `?page` | `Paginated<Contribution>` |
| 3.3 | GET | `/member/beneficiaries` | 👤 | — | `Beneficiary[]` |
| 3.4 | POST | `/member/beneficiaries` | 👤 | `Partial<Beneficiary>` | `Beneficiary` |
| 3.5 | PUT | `/member/beneficiaries/{id}` | 👤 | `Partial<Beneficiary>` | `Beneficiary` |
| 3.6 | DELETE | `/member/beneficiaries/{id}` | 👤 | — | `void` |
| 3.7 | GET | `/member/notifications` | 👤 | — | `Notification[]` |
| 3.8 | PATCH | `/member/notifications/{id}/read` | 👤 | — | `void` |
| 3.9 | GET | `/member/documents` | 👤 | — | `Document[]` |
| 3.10 | GET | `/documents/me/summary` | 👤 | — | `{ total, uploaded, pending, approved, rejected, expired, completion_pct }` |
| 3.11 | GET | `/documents/types` | 👤 | — | `{ code, name, allowed_member_upload }[]` |
| 3.12 | GET | `/member/events` | 👤 | — | `EventItem[]` |
| 3.13 | GET | `/member/news` | 👤 | `?page` | `Paginated<NewsArticle>` |
| 3.14 | GET | `/member/profile` | 👤 | — | `Member` |
| 3.15 | PUT | `/member/profile` | 👤 | `Partial<Member>` | `Member` |
| 3.16 | GET | `/member/penalties` | 👤 | — | `Penalty[]` |
| 3.17 | POST | `/member/penalties/{id}/pay` | 👤 | `{ method, phone? }` | `{ message, reference }` |
| 3.18 | GET | `/member/withdrawal-receipts` | 👤 | — | `WithdrawalRequest[]` |
| 3.19 | GET | `/member/donation-campaigns` | 👤 | — | `DonationCampaign[]` |
| 3.20 | POST | `/member/donate` | 👤 | `{ campaign_id, amount, method, phone? }` | `{ message, reference }` |
| 3.21 | GET | `/member/executive/{roleName}` | 👤 | — | `{ role, title, stats: {label,value}[], actions: {label,route}[] }` |
| 3.22 | 📥 | `/member/downloads/statement` | 👤 | `?from&to` | PDF binary |
| 3.23 | 📥 | `/member/downloads/receipt/{id}` | 👤 | — | PDF binary |

### 3a. Document Uploads (Member)

| # | Method | Path | Role | Body | Response |
|---|--------|------|------|------|----------|
| 3.24 | POST 📎 | `/documents` | 👤 | `document_type_code`, `file`, `notes?`, `expires_at?` | `Document` |
| 3.25 | POST 📎 | `/documents/{id}/replace` | 👤 | `file`, `notes?`, `expires_at?` | `Document` |
| 3.26 | DELETE | `/documents/{id}` | 👤 | `?hard_delete=0` | `void` |

### 3b. Profile Photo Upload

| # | Method | Path | Role | Body | Response |
|---|--------|------|------|------|----------|
| 3.27 | POST 📎 | `/storage/v1/object/profile-images/{userId}/profile.{ext}` | 👤 | `file` | `{ url }` |

### 3c. Payments (M-Pesa STK Push)

| # | Method | Path | Role | Body | Response |
|---|--------|------|------|------|----------|
| 3.28 | POST | `/payments/stk-push` | 👤 | `{ phone, amount, account_ref, member_id?, paymentType, transactionDesc?, penaltyIds?, campaignId? }` | `{ checkoutRequestId, message }` |
| 3.29 | GET | `/payments/status/{checkoutRequestId}` | 👤 | — | `{ status, message? }` |

---

## 4. Treasurer Module

| # | Method | Path | Role | Body / Params | Response |
|---|--------|------|------|---------------|----------|
| 4.1 | GET | `/treasurer/dashboard` | 💰 | — | `{ operational_balance, contributions_balance, penalty_balance, donation_balance, book_balance, bank_balance, reconciliation_diff, pending_withdrawals, pending_expenses, monthly_contributions: {month,amount}[] }` |
| 4.2 | GET | `/treasurer/contributions` | 💰 | `?page&status&from&to` | `Paginated<Contribution>` |
| 4.3 | POST | `/treasurer/contributions/{id}/adjust` | 💰 | `{ amount, reason }` | `{ message }` |
| 4.4 | GET | `/treasurer/penalty-wallet` | 💰 | `?page` | `Paginated<WalletTransaction>` |
| 4.5 | GET | `/treasurer/donation-wallet` | 💰 | `?page` | `Paginated<WalletTransaction>` |
| 4.6 | GET | `/treasurer/operational-wallet` | 💰 | `?page` | `Paginated<WalletTransaction>` |
| 4.7 | GET | `/treasurer/wallets` | 💰 | — | `WalletSummary[]` |
| 4.8 | GET | `/treasurer/withdrawal-approvals` | 💰 | — | `WithdrawalRequest[]` |
| 4.9 | POST | `/treasurer/withdrawal-approvals/{id}/{approve\|reject}` | 💰 | `{ note? }` | `{ message }` |
| 4.10 | GET | `/treasurer/documents` | 💰 | — | `Document[]` |
| 4.11 | GET | `/treasurer/reports` | 💰 | — | `{ name, type, date, size }[]` |
| 4.12 | 📥 | `/treasurer/reports/{type}/export` | 💰 | `?from&to` | PDF binary |
| 4.13 | GET | `/treasurer/bank-sync` | 💰 | — | `{ last_sync, status, new_transactions }` |
| 4.14 | POST | `/treasurer/bank-sync` | 💰 | — | `{ message, imported }` |
| 4.15 | GET | `/treasurer/bank-statement` | 💰 | `?page` | `Paginated<BankTransaction>` |
| 4.16 | GET | `/treasurer/book-balance` | 💰 | — | `{ balance, last_updated, entries: WalletTransaction[] }` |
| 4.17 | GET | `/treasurer/wallet-reports` | 💰 | — | `{ wallet, transactions, balance, period }[]` |
| 4.18 | GET | `/treasurer/expenses` | 💰 | `?page` | `Paginated<Expense>` |
| 4.19 | POST | `/treasurer/expenses` | 💰 | `Partial<Expense>` | `Expense` |
| 4.20 | POST | `/treasurer/expenses/{id}/{approve\|reject}` | 💰 | — | `{ message }` |
| 4.21 | GET | `/treasurer/donation-campaigns` | 💰 | — | `DonationCampaign[]` |
| 4.22 | POST | `/treasurer/donation-campaigns` | 💰 | `Partial<DonationCampaign>` | `DonationCampaign` |
| 4.23 | PATCH | `/treasurer/donation-campaigns/{id}` | 💰 | `Partial<DonationCampaign>` | `DonationCampaign` |
| 4.24 | DELETE | `/treasurer/donation-campaigns/{id}` | 💰 | — | `{ message }` |
| 4.25 | GET | `/treasurer/memos` | 💰 | — | `Memo[]` |
| 4.26 | POST | `/treasurer/memos` | 💰 | `Partial<Memo>` | `Memo` |
| 4.27 | PATCH | `/treasurer/memos/{id}` | 💰 | `Partial<Memo>` | `Memo` |
| 4.28 | DELETE | `/treasurer/memos/{id}` | 💰 | — | `{ message }` |
| 4.29 | PATCH | `/treasurer/memos/{id}/resend` | 💰 | `{}` | `{ message }` |
| 4.30 | GET | `/treasurer/memo-templates` | 💰 | — | `MemoTemplate[]` |
| 4.31 | GET | `/treasurer/settings` | 💰 | — | `OrganizationSettings` |
| 4.32 | PATCH | `/treasurer/settings` | 💰 | `Partial<OrganizationSettings>` | `{ message }` |
| 4.33 | GET | `/treasurer/payouts` | 💰 | — | `Payout[]` |
| 4.34 | POST | `/treasurer/payouts` | 💰 | `{ member_id, payout_type, amount, reason, phone, wallet_type }` | `Payout` |
| 4.35 | GET | `/treasurer/payouts/eligible` | 💰 | `?payout_type` | `EligibleMember[]` |

### 4a. Bank Statement Import (Treasurer)

| # | Method | Path | Role | Body | Response |
|---|--------|------|------|------|----------|
| 4.36 | POST 📎 | `/treasurer/bank-statement-import` | 💰 | `file` (single Excel) | `{ message, imported }` |
| 4.37 | POST | `/treasurer/bank-statement-import` | 💰 | `{ rows: [[trans_date, value_date, details, ref, credit, debit, book_balance]…], source_name?, file_name? }` | `ImportBatchResponse` |
| 4.38 | POST 📎 | `/treasurer/book-balance-import` | 💰 | `file` | `{ message, imported }` |

**ImportBatchResponse shape:**
```json
{
  "batch_id": "uuid",
  "new_members": 0,
  "matched_members": 0,
  "contributions_created": 0,
  "contributions_updated": 0,
  "duplicates": 0,
  "unmatched": 0,
  "invalid_phone": 0,
  "imported": 0,
  "amount": 0,
  "failures": [{ "row": 0, "reason": "" }]
}
```

---

## 5. Admin Module

| # | Method | Path | Role | Body / Params | Response |
|---|--------|------|------|---------------|----------|
| 5.1 | GET | `/admin/dashboard` | 🏛️ | — | `{ total_members, active_members, total_contributions, pending_approvals, defaulters_count, recent_signups: Member[], contributions_trend: {month,amount}[] }` |
| 5.2 | GET | `/admin/members` | 🏛️ | `?page&search&status` | `Paginated<Member>` |
| 5.3 | GET | `/admin/members/{id}` | 🏛️ | — | `Member` |
| 5.4 | GET | `/admin/members/{id}/contributions` | 🏛️ | — | `Contribution[]` |
| 5.5 | GET | `/admin/members/{id}/beneficiaries` | 🏛️ | — | `Beneficiary[]` |
| 5.6 | GET | `/admin/contributions` | 🏛️ | `?page&status` | `Paginated<Contribution>` |
| 5.7 | GET | `/admin/beneficiaries` | 🏛️ | `?page` | `Paginated<Beneficiary>` |
| 5.8 | GET | `/admin/defaulters` | 🏛️ | — | `Defaulter[]` |
| 5.9 | GET | `/admin/payments` | 🏛️ | `?page` | `Paginated<Contribution>` |
| 5.10 | GET | `/admin/unmatched` | 🏛️ | — | `Contribution[]` |
| 5.11 | POST | `/admin/unmatched/{id}/match` | 🏛️ | `{ member_id }` | `{ message }` |
| 5.12 | GET | `/admin/notifications` | 🏛️ | — | `Notification[]` |
| 5.13 | POST | `/admin/sms` | 🏛️ | `{ message, recipients: string[] }` | `{ message }` |
| 5.14 | GET | `/admin/events` | 🏛️ | — | `EventItem[]` |
| 5.15 | POST | `/admin/events` | 🏛️ | `Partial<EventItem>` | `EventItem` |
| 5.16 | GET | `/admin/documents` | 🏛️ | — | `Document[]` |
| 5.17 | GET | `/admin/penalty-payments` | 🏛️ | — | `Penalty[]` |
| 5.18 | POST | `/admin/penalty-payments/{id}/verify` | 🏛️ | — | `{ message }` |
| 5.19 | GET | `/admin/donations` | 🏛️ | — | `Donation[]` |
| 5.20 | GET | `/admin/donation-campaigns` | 🏛️ | — | `DonationCampaign[]` |
| 5.21 | POST | `/admin/donation-campaigns` | 🏛️ | `Partial<DonationCampaign>` | `DonationCampaign` |
| 5.22 | GET | `/admin/withdrawal-approval` | 🏛️ | — | `WithdrawalRequest[]` |
| 5.23 | POST | `/admin/withdrawal-approval/{id}/{approve\|reject}` | 🏛️ | — | `{ message }` |

### 5a. Admin Imports

| # | Method | Path | Role | Body | Response |
|---|--------|------|------|------|----------|
| 5.24 | POST 📎 | `/admin/import` | 🏛️ | `file` (Excel) | `{ message, imported }` |
| 5.25 | POST 📎 | `/admin/beneficiary-import` | 🏛️ | `file` (Excel) | `{ message, imported }` |

---

## 6. Website Management Module (Admin)

| # | Method | Path | Role | Body / Params | Response |
|---|--------|------|------|---------------|----------|
| 6.1 | GET | `/admin/website/dashboard` | 🏛️ | — | `{ total_content, published_content, draft_content, total_people, unread_messages, media_count, recent_content: WebsiteContent[], recent_messages: ContactMessage[] }` |
| 6.2 | GET | `/admin/website/content` | 🏛️ | `?page` | `Paginated<WebsiteContent>` |
| 6.3 | POST | `/admin/website/content` | 🏛️ | `Partial<WebsiteContent>` | `WebsiteContent` |
| 6.4 | PUT | `/admin/website/content/{id}` | 🏛️ | `Partial<WebsiteContent>` | `WebsiteContent` |
| 6.5 | POST | `/admin/website/content/{id}/archive` | 🏛️ | — | `void` |
| 6.6 | GET | `/admin/website/people` | 🏛️ | — | `LeadershipPerson[]` |
| 6.7 | POST | `/admin/website/people` | 🏛️ | `Partial<LeadershipPerson>` | `LeadershipPerson` |
| 6.8 | PUT | `/admin/website/people/{id}` | 🏛️ | `Partial<LeadershipPerson>` | `LeadershipPerson` |
| 6.9 | DELETE | `/admin/website/people/{id}` | 🏛️ | — | `void` |
| 6.10 | GET | `/admin/website/people/leadership-members` | 🏛️ | — | `Member[]` |
| 6.11 | GET | `/admin/website/contact-messages` | 🏛️ | `?page` | `Paginated<ContactMessage>` |
| 6.12 | POST | `/admin/website/contact-messages/{id}/mark-read` | 🏛️ | — | `void` |
| 6.13 | GET | `/admin/website/media` | 🏛️ | — | `MediaAsset[]` |
| 6.14 | GET | `/admin/website/settings/{section}` | 🏛️ | — | `Record<string, unknown>` |
| 6.15 | PUT | `/admin/website/settings/{section}` | 🏛️ | `Record<string, unknown>` | `{ message }` |
| 6.16 | GET | `/admin/website/email-templates` | 🏛️ | — | `EmailTemplate[]` |
| 6.17 | PUT | `/admin/website/email-templates/{id}` | 🏛️ | `Partial<EmailTemplate>` | `EmailTemplate` |
| 6.18 | POST | `/admin/website/email-templates/{id}/test` | 🏛️ | `{ email }` | `{ message }` |

---

## 7. Secretary Module

| # | Method | Path | Role | Body / Params | Response |
|---|--------|------|------|---------------|----------|
| 7.1 | GET | `/secretary/dashboard` | 📝 | — | `{ pending_minutes, approved_minutes, upcoming_meetings, total_minutes, recent_minutes: MeetingMinutes[], upcoming: ScheduledMeeting[] }` |
| 7.2 | GET | `/secretary/minutes-review` | 📝 | — | `MeetingMinutes[]` |
| 7.3 | POST | `/secretary/minutes/{id}/submit-review` | 📝 | — | `{ message }` |
| 7.4 | GET | `/secretary/meeting-minutes` | 📝 | — | `MeetingMinutes[]` |
| 7.5 | POST | `/secretary/meeting-minutes` | 📝 | `Partial<MeetingMinutes>` | `MeetingMinutes` |
| 7.6 | PUT | `/secretary/meeting-minutes/{id}` | 📝 | `Partial<MeetingMinutes>` | `MeetingMinutes` |
| 7.7 | GET | `/secretary/meeting-scheduling` | 📝 | — | `ScheduledMeeting[]` |
| 7.8 | POST | `/secretary/meeting-scheduling` | 📝 | `Partial<ScheduledMeeting>` | `ScheduledMeeting` |
| 7.9 | POST | `/secretary/meeting-scheduling/{id}/cancel` | 📝 | — | `{ message }` |

---

## 8. Vice-Secretary Module

| # | Method | Path | Role | Body / Params | Response |
|---|--------|------|------|---------------|----------|
| 8.1 | GET | `/vice-secretary/dashboard` | 📋 | — | `{ total_events, active_events, total_documents, pending_documents, active_members, recent_messages, unread_notifications, recent_documents, event_summary, recent_activity }` |
| 8.2 | GET | `/vice-secretary/meeting-minutes` | 📋 | — | `MeetingMinutes[]` |
| 8.3 | POST | `/vice-secretary/meeting-minutes` | 📋 | `Partial<MeetingMinutes>` | `MeetingMinutes` |
| 8.4 | PUT | `/vice-secretary/meeting-minutes/{id}` | 📋 | `Partial<MeetingMinutes>` | `MeetingMinutes` |
| 8.5 | POST | `/vice-secretary/meeting-minutes/{id}/submit` | 📋 | — | `{ message }` |

---

## 9. Chairperson Module

| # | Method | Path | Role | Body / Params | Response |
|---|--------|------|------|---------------|----------|
| 9.1 | GET | `/chairperson/dashboard` | 🪑 | — | `{ pending_approvals, approved_count, rejected_count, pending_items: MeetingMinutes[], recent_approvals: {title,date,action}[] }` |
| 9.2 | GET | `/chairperson/approve-minutes` | 🪑 | — | `MeetingMinutes[]` |
| 9.3 | POST | `/chairperson/approve-minutes/{id}/{approve\|reject}` | 🪑 | `{ note? }` | `{ message }` |

---

## 10. Office Module

| # | Method | Path | Role | Body / Params | Response |
|---|--------|------|------|---------------|----------|
| 10.1 | GET | `/office/dashboard` | 🏢 | — | `{ total_members, pending_applications, pending_documents, recent_activities: {description,date}[] }` |

---

## 11. Meeting Minutes Module (Shared)

| # | Method | Path | Role | Body / Params | Response |
|---|--------|------|------|---------------|----------|
| 11.1 | GET | `/minutes` | 🔐 | `?filter=mine\|secretary_pending\|pending` | `HydratedMinute[]` |
| 11.2 | GET | `/minutes/{id}` | 🔐 | — | `HydratedMinute` |
| 11.3 | POST | `/minutes` | 🔐 | `CreateMinutePayload` | `{ data: HydratedMinute }` |
| 11.4 | PUT | `/minutes/{id}` | 🔐 | `Partial<CreateMinutePayload>` | `{ data: HydratedMinute }` |
| 11.5 | DELETE | `/minutes/{id}` | 🔐 | — | `{ data: { deleted: boolean } }` |
| 11.6 | POST | `/minutes/{id}/submit` | 🔐 | — | `{ message }` |
| 11.7 | POST | `/minutes/{id}/secretary-review` | 📝 | `{ decision: 'approve'\|'reject', notes? }` | `{ message }` |
| 11.8 | POST | `/minutes/{id}/approve` | 🪑 | — | `{ message }` |
| 11.9 | POST | `/minutes/{id}/reject` | 🪑 | `{ notes }` | `{ message }` |
| 11.10 | GET | `/minutes/executive-members` | 🔐 | — | `MinuteMember[]` |
| 11.11 | GET | `/rest/v1/members` | 🔐 | `?limit` | `MinuteMember[]` |

**CreateMinutePayload shape:**
```json
{
  "title": "",
  "meeting_date": "",
  "meeting_type": "general|executive",
  "agenda": "",
  "discussions": "",
  "decisions": "",
  "action_items": "",
  "next_meeting_date": null,
  "attendance": [{ "member_id": "", "status": "PRESENT|ABSENT_WITH_APOLOGY|ABSENT" }],
  "visible_to_members": null
}
```

---

## 12. Signatures Module (Shared)

| # | Method | Path | Role | Body | Response |
|---|--------|------|------|------|----------|
| 12.1 | GET | `/signatures/current` | 🔐 | `?role=secretary\|chairperson` | `{ url, uploaded_at } \| null` |
| 12.2 | POST | `/signatures` | 🔐 | `{ role, file_name }` (JSON) | `{ message, url }` |
| 12.3 | POST 📎 | `/signatures` | 🔐 | `file`, `role` (multipart) | `{ message, url }` |

---

## 13. Super-Admin Module

| # | Method | Path | Role | Body / Params | Response |
|---|--------|------|------|---------------|----------|
| 13.1 | GET | `/super-admin/dashboard` | 🛡️ | — | `{ total_users, online_users, total_members, system_health: SystemMetric[], recent_logins: LoginActivity[], pending_alerts }` |
| 13.2 | GET | `/super-admin/members/{id}` | 🛡️ | — | `Member` |
| 13.3 | GET | `/super-admin/troubleshooting` | 🛡️ | — | `{ issues: {id,severity,module,description,date}[], diagnostics: SystemMetric[] }` |
| 13.4 | GET | `/super-admin/audit-logs` | 🛡️ | `?page` | `Paginated<AuditLog>` |
| 13.5 | GET | `/super-admin/security` | 🛡️ | — | `{ two_factor, password_policy: {min_length, require_special, require_numbers}, session_timeout, ip_whitelist: string[] }` |
| 13.6 | PUT | `/super-admin/security` | 🛡️ | `Record<string, unknown>` | `{ message }` |
| 13.7 | GET | `/super-admin/password-management` | 🛡️ | — | `{ policies: SystemMetric[], expired_passwords, forced_resets }` |
| 13.8 | GET | `/super-admin/access-control` | 🛡️ | — | `AccessRole[]` |
| 13.9 | PUT | `/super-admin/access-control/{id}` | 🛡️ | `{ permissions: string[] }` | `{ message }` |
| 13.10 | GET | `/super-admin/online-users` | 🛡️ | — | `OnlineUser[]` |
| 13.11 | GET | `/super-admin/login-activity` | 🛡️ | `?page` | `Paginated<LoginActivity>` |
| 13.12 | GET | `/super-admin/system-monitoring` | 🛡️ | — | `{ metrics: SystemMetric[], services: {name,status,uptime}[] }` |
| 13.13 | GET | `/super-admin/bank` | 🛡️ | — | `{ connected, last_sync, accounts: {name,number,balance,status}[] }` |
| 13.14 | GET | `/super-admin/database` | 🛡️ | — | `{ size, tables, connections, slow_queries, backup_last }` |
| 13.15 | GET | `/super-admin/system` | 🛡️ | — | `{ version, uptime, environment, features: {name,enabled}[] }` |
| 13.16 | GET | `/super-admin/trace` | 🛡️ | — | `{ traces: {id,request,duration,status,date}[] }` |

> **Note:** Super-Admin also has access to all Admin routes (§5), Website routes (§6), Treasurer routes (§4), Secretary routes (§7), and Minutes routes (§11).

---

## 14. AI Assistant (Edge Function — Supabase)

> Base URL in demo: `{SUPABASE_URL}/functions/v1/ai-assistant`
> Base URL in production: `{API_BASE_URL}/functions/v1/ai-assistant`
> Auth: demo uses Supabase anon key; production uses Bearer JWT.
> `verify_jwt = false` on the edge function.

| # | Method | Path | Body | Response |
|---|--------|------|------|----------|
| 14.1 | POST | `/functions/v1/ai-assistant` | `{ message, conversationId?, userId, userRole, userName, contextType?, history? }` (demo) **or** `{ query, conversation_id, context_type, messages }` (prod) | SSE stream: `data: { content, done?, conversationId? }` chunks, ending with `data: [DONE]` |
| 14.2 | GET | `/functions/v1/ai-assistant/conversation` | `?context_type&conversation_id` | `{ conversation_id, messages: [{id, conversation_id, role, content, created_at}] }` |

**Context types:** `admin_assistant` (default), `secretary_assistant` (for secretary/vice-secretary/chairperson)

---

## 15. Group Chat (Supabase Realtime — direct DB access)

> The frontend talks to Supabase directly (anon key) for group chat.
> Tables: `chat_conversations`, `chat_participants`, `chat_messages`, `chat_reactions`, `chat_typing`.
> All realtime-enabled. RLS currently grants full CRUD to `anon, authenticated`.

| # | Operation | Table | Method | Notes |
|---|-----------|-------|--------|-------|
| 15.1 | Fetch conversations | `chat_participants` + `chat_conversations` | SELECT | By `user_id`, then load conversation details + last message + unread count |
| 15.2 | Fetch messages | `chat_messages` + `chat_reactions` | SELECT | By `conversation_id`, ordered by `created_at`, limit 100. Reactions joined. |
| 15.3 | Fetch participants | `chat_participants` | SELECT | By `conversation_id` |
| 15.4 | Send message | `chat_messages` | INSERT | Then update `chat_conversations.updated_at` |
| 15.5 | Delete message | `chat_messages` | DELETE | By `id` |
| 15.6 | Mark read | `chat_participants` | UPDATE | Set `last_read_at` by `conversation_id` + `user_id` |
| 15.7 | Set typing | `chat_typing` | UPSERT/DELETE | Insert or update `updated_at`; delete when stopped |
| 15.8 | Toggle reaction | `chat_reactions` | INSERT/DELETE | Toggle by `message_id` + `user_id` + `emoji` |
| 15.9 | Create group | `chat_conversations` + `chat_participants` | INSERT | Create conversation, then insert all participants |
| 15.10 | Add participant | `chat_participants` | INSERT | — |
| 15.11 | Remove participant | `chat_participants` | DELETE | By `conversation_id` + `user_id` |
| 15.12 | Subscribe messages | Realtime channel | — | `INSERT`/`DELETE` on `chat_messages` filtered by `conversation_id` |
| 15.13 | Subscribe reactions | Realtime channel | — | `*` on `chat_reactions` |
| 15.14 | Subscribe typing | Realtime channel | — | `*` on `chat_typing` filtered by `conversation_id` |
| 15.15 | Subscribe conversations | Realtime channel | — | `*` on `chat_messages`, `chat_conversations`, `chat_participants` |

---

## Complete Endpoint Count by Module

| Module | Endpoints |
|--------|-----------|
| Auth | 6 |
| Public Website | 6 |
| Member Portal | 27 |
| Treasurer | 38 |
| Admin | 25 |
| Website Mgmt | 18 |
| Secretary | 9 |
| Vice-Secretary | 5 |
| Chairperson | 3 |
| Office | 1 |
| Minutes (shared) | 11 |
| Signatures (shared) | 3 |
| Super-Admin | 16 |
| AI Assistant | 2 |
| Group Chat | 15 (DB ops) |
| **Total REST endpoints** | **150** |

---

## Laravel Route File Mapping

```
routes/api.php
├── /auth/*                          → AuthController
├── /public/website/*                → PublicWebsiteController
├── /member/*                        → MemberController
├── /documents/*                     → DocumentController
├── /payments/*                      → PaymentController
├── /storage/v1/object/*             → StorageController (profile images)
├── /treasurer/*                     → TreasurerController
├── /admin/*                         → AdminController
├── /admin/website/*                 → WebsiteController
├── /secretary/*                     → SecretaryController
├── /vice-secretary/*                → ViceSecretaryController
├── /chairperson/*                   → ChairpersonController
├── /office/*                        → OfficeController
├── /minutes/*                       → MinutesController
├── /signatures/*                    → SignatureController
├── /super-admin/*                   → SuperAdminController
└── /rest/v1/members                 → MemberController (REST alias)
```

### Middleware Groups

```
Route::middleware('api')->group(function () {
    Route::prefix('auth')->group(...);        // public login, protected others
    Route::prefix('public')->group(...);       // no auth
});

Route::middleware(['auth:api'])->group(function () {
    Route::prefix('member')->middleware('role:member')->group(...);
    Route::prefix('treasurer')->middleware('role:treasurer|admin')->group(...);
    Route::prefix('admin')->middleware('role:admin')->group(...);
    Route::prefix('secretary')->middleware('role:secretary')->group(...);
    Route::prefix('vice-secretary')->middleware('role:vice-secretary')->group(...);
    Route::prefix('chairperson')->middleware('role:chairperson')->group(...);
    Route::prefix('office')->middleware('role:office')->group(...);
    Route::prefix('super-admin')->middleware('role:super-admin')->group(...);
    Route::prefix('minutes')->group(...);      // shared, all authenticated
    Route::prefix('signatures')->group(...);   // shared, all authenticated
    Route::prefix('documents')->group(...);    // shared, all authenticated
    Route::prefix('payments')->group(...);     // shared, all authenticated
});
```

---

## Data Model Summary (Laravel Tables)

Based on the frontend types and API contracts, the Laravel backend needs these database tables:

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `users` | Auth + profiles | id, phone, email (synthetic), password, role, name, status, force_password_change |
| `members` | Extended member data | user_id, member_number, id_number, phone, dob, gender, occupation, join_date, status |
| `contributions` | Member contributions | id, member_id, amount, method, reference, status, date, type |
| `beneficiaries` | Member dependents | id, member_id, name, relationship, dob, phone |
| `notifications` | Member notifications | id, member_id, title, body, type, read_at, created_at |
| `documents` | Uploaded documents | id, member_id, type_code, file_url, status, notes, expires_at |
| `document_types` | Doc type catalog | code, name, allowed_member_upload |
| `events` | Calendar events | id, title, description, date, location, status |
| `news` | News articles | id, title, slug, body, image_url, status, published_at |
| `penalties` | Member penalties | id, member_id, amount, reason, status, paid_at |
| `withdrawal_requests` | Withdrawal workflow | id, member_id, amount, reason, status, approved_by, approved_at |
| `wallets` | Wallet balances | id, type (operational/contributions/penalty/donation), balance |
| `wallet_transactions` | Wallet ledger | id, wallet_id, amount, type (credit/debit), reference, description, date |
| `donations` | Donation records | id, member_id, campaign_id, amount, method, reference, date |
| `donation_campaigns` | Campaign management | id, title, description, target_amount, raised_amount, status, start_date, end_date |
| `bank_transactions` | Imported bank data | id, trans_date, value_date, details, reference, credit, debit, book_balance, matched |
| `expenses` | Expense workflow | id, amount, description, category, status, approved_by, approved_at |
| `payouts` | Member payouts | id, member_id, payout_type, amount, reason, phone, wallet_type, status |
| `memos` | Treasurer memos | id, subject, body, recipient_type, status, sent_at |
| `memo_templates` | Reusable memo templates | id, name, subject, body_template |
| `meeting_minutes` | Minutes with workflow | id, title, meeting_date, meeting_type, agenda, discussions, decisions, action_items, status, prepared_by, reviewed_by, approved_by, rejection_notes |
| `minute_attendance` | Meeting attendance | minute_id, member_id, status |
| `scheduled_meetings` | Calendar scheduling | id, title, date, time, location, agenda, status, created_by |
| `signatures` | Role-based signatures | id, role, file_url, uploaded_at |
| `website_content` | CMS content | id, type, title, slug, body, image_url, status, author_id, published_at |
| `website_settings` | Site settings | id, section, key, value (JSON) |
| `leadership_people` | Public leadership | id, name, slug, title, bio, photo_url, display_order, member_id |
| `contact_messages` | Contact form inbox | id, name, email, subject, message, read_at |
| `email_templates` | Email template mgmt | id, name, subject, body, variables |
| `media_assets` | Media library | id, filename, url, type, size, uploaded_by |
| `organization_settings` | Org config | id, key, value (JSON) |
| `audit_logs` | Audit trail | id, user_id, action, module, description, ip, created_at |
| `login_activity` | Login records | id, user_id, ip, device, browser, created_at |
| `access_roles` | Role permissions | id, role, permissions (JSON) |
| `defaulters` | Computed view | member_id, name, phone, arrears, months_defaulted |

---

## Demo vs Production Flow

```
Frontend (React)
  ├── getDemoMode() === true  → returns demo-data.ts constants (200ms delay)
  └── getDemoMode() === false → calls API_BASE_URL via fetch()
       ├── /auth/*            → Laravel returns JWT
       ├── /member/*          → Laravel + MySQL
       ├── /treasurer/*       → Laravel + MySQL
       ├── /admin/*           → Laravel + MySQL
       ├── /super-admin/*     → Laravel + MySQL
       ├── /minutes/*         → Laravel + MySQL
       ├── /signatures/*      → Laravel + MySQL
       └── Group Chat         → Supabase (direct, anon key, realtime)
       └── AI Assistant       → Supabase Edge Function (SSE stream)
```

---

## AuthUser Shape (Login Response)

```typescript
interface AuthUser {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: UserRole;  // member | admin | treasurer | secretary | vice-secretary | chairperson | office | super-admin
  avatar?: string | null;
  requires_password_change?: boolean;
  member_number?: string;
  status?: string;
}
```

---

## Paginated Response Shape

```typescript
interface Paginated<T> {
  data: T[];
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}
```

---

## Error Response Shape

```json
{
  "message": "Human-readable error",
  "error": "Optional technical error"
}
```

HTTP 401 → frontend clears session and redirects to `/login`.
HTTP 422 → validation errors (Laravel standard `{ message, errors: { field: [] } }`).
