# KHWWC — Complete Laravel API Matrix (Definitive)

> **Base URL:** `{API_BASE_URL}` (default `https://api.khwwc.co.ke/api`)
>
> **Auth:** `Authorization: Bearer {jwt_token}` on every protected endpoint.
>
> **Content-Type:** `application/json` + `Accept: application/json` on all requests unless marked 📎 (multipart) or 📥 (binary download).
>
> **401** → frontend clears token + redirects to `/login`.
>
> **422** → Laravel validation errors: `{ message, errors: { field: ["message"] } }`.
>
> **Paginated responses:** `{ data: T[], current_page, per_page, total, last_page }`.
>
> **Derived from:** actual `src/api/*.ts` call sites — every endpoint below is wired in the frontend.

---

## Legend

| Symbol | Meaning |
|--------|---------|
| 🔓 | Public (no auth) |
| 🔐 | Authenticated (any role) |
| 👤 | Member |
| 🏛️ | Admin |
| 💰 | Treasurer (also accessible by Admin) |
| 📝 | Secretary |
| 📋 | Vice-Secretary |
| 🪑 | Chairperson |
| 🏢 | Office |
| 🛡️ | Super-Admin |
| 📎 | Multipart form-data |
| 📥 | Binary download |

---

## 1. Authentication Module (6 endpoints)

| # | Method | Path | Role | Body / Params | Response | Frontend Source |
|---|--------|------|------|---------------|----------|-----------------|
| 1.1 | POST | `/auth/login` | 🔓 | `{ email, password }` | `{ token, user: AuthUser }` | `authApi.login` |
| 1.2 | POST | `/auth/logout` | 🔐 | — | `void` | `authApi.logout` |
| 1.3 | GET | `/auth/me` | 🔐 | — | `AuthUser` | `authApi.me` |
| 1.4 | POST | `/auth/password` | 🔐 | `{ current_password, new_password, new_password_confirmation }` | `{ message }` | `authApi.changePassword` |
| 1.5 | POST | `/auth/force-password-change` | 🔐 | `{ new_password, new_password_confirmation }` | `{ message }` | `authApi.forcePasswordChange` |
| 1.6 | POST | `/auth/v1/password` | 👤 | `{ new_password }` | `{ message }` | `memberApi.changePassword` |

### AuthUser shape

```typescript
interface AuthUser {
  id: string;
  name: string;
  email: string;            // synthetic: {phone}@khwwc.local
  role: 'member' | 'admin' | 'treasurer' | 'secretary'
      | 'vice-secretary' | 'chairperson' | 'office' | 'super-admin';
  avatar?: string;
  member_id?: string;
  phone?: string;
  must_change_password?: boolean;
}
```

---

## 2. Public Website Module (6 endpoints)

| # | Method | Path | Role | Body / Params | Response | Frontend Source |
|---|--------|------|------|---------------|----------|-----------------|
| 2.1 | GET | `/public/website/settings` | 🔓 | — | `WebsiteSettings` | `publicApi.getSettings` |
| 2.2 | GET | `/public/website/content/{type}` | 🔓 | `?page` | `Paginated<WebsiteContent>` | `publicApi.getContent` |
| 2.3 | GET | `/public/website/content/{type}/{slug}` | 🔓 | — | `WebsiteContent` | `publicApi.getContentDetail` |
| 2.4 | GET | `/public/website/leadership` | 🔓 | — | `LeadershipPerson[]` | `publicApi.getLeadership` |
| 2.5 | GET | `/public/website/people/{slug}` | 🔓 | — | `LeadershipPerson` | `publicApi.getPerson` |
| 2.6 | POST | `/public/website/contact` | 🔓 | `{ name, email, subject, message }` | `{ message }` | `publicApi.submitContact` |

---

## 3. Member Portal Module (29 endpoints)

### 3a. Dashboard & Profile

| # | Method | Path | Role | Body / Params | Response | Frontend Source |
|---|--------|------|------|---------------|----------|-----------------|
| 3.1 | GET | `/member/dashboard` | 👤 | — | `{ contributions_total, contributions_count, penalties_total, donations_total, wallet_balance, upcoming_events: EventItem[], recent_contributions: Contribution[], unread_notifications, status }` | `memberApi.dashboard` |
| 3.2 | GET | `/member/profile` | 👤 | — | `Member` | `memberApi.getProfile` |
| 3.3 | PUT | `/member/profile` | 👤 | `Partial<Member>` | `Member` | `memberApi.updateProfile` |
| 3.4 | POST 📎 | `/storage/v1/object/profile-images/{userId}/profile.{ext}` | 👤 | `file` | `{ url }` | `memberApi.uploadProfilePhoto` |

### 3b. Contributions

| # | Method | Path | Role | Body / Params | Response | Frontend Source |
|---|--------|------|------|---------------|----------|-----------------|
| 3.5 | GET | `/member/contributions` | 👤 | `?page` | `Paginated<Contribution>` | `memberApi.getContributions` |

### 3c. Beneficiaries

| # | Method | Path | Role | Body / Params | Response | Frontend Source |
|---|--------|------|------|---------------|----------|-----------------|
| 3.6 | GET | `/member/beneficiaries` | 👤 | — | `Beneficiary[]` | `memberApi.getBeneficiaries` |
| 3.7 | POST | `/member/beneficiaries` | 👤 | `Partial<Beneficiary>` | `Beneficiary` | `memberApi.addBeneficiary` |
| 3.8 | PUT | `/member/beneficiaries/{id}` | 👤 | `Partial<Beneficiary>` | `Beneficiary` | `memberApi.updateBeneficiary` |
| 3.9 | DELETE | `/member/beneficiaries/{id}` | 👤 | — | `void` | `memberApi.deleteBeneficiary` |

### 3d. Notifications

| # | Method | Path | Role | Body / Params | Response | Frontend Source |
|---|--------|------|------|---------------|----------|-----------------|
| 3.10 | GET | `/member/notifications` | 👤 | — | `Notification[]` | `memberApi.getNotifications` |
| 3.11 | PATCH | `/member/notifications/{id}/read` | 👤 | — | `void` | `memberApi.markNotificationRead` |

### 3e. Documents (shared paths — `/documents/*`)

| # | Method | Path | Role | Body / Params | Response | Frontend Source |
|---|--------|------|------|---------------|----------|-----------------|
| 3.12 | GET | `/member/documents` | 👤 | — | `Document[]` | `memberApi.getDocuments` |
| 3.13 | GET | `/documents/me/summary` | 👤 | — | `{ total, uploaded, pending, approved, rejected, expired, completion_pct }` | `memberApi.getDocumentSummary` |
| 3.14 | GET | `/documents/types` | 👤 | — | `{ code, name, allowed_member_upload }[]` | `memberApi.getDocumentTypes` |
| 3.15 | POST 📎 | `/documents` | 👤 | `document_type_code`, `file`, `notes?`, `expires_at?` | `Document` | `memberApi.uploadDocument` |
| 3.16 | POST 📎 | `/documents/{id}/replace` | 👤 | `file`, `notes?`, `expires_at?` | `Document` | `memberApi.replaceDocument` |
| 3.17 | DELETE | `/documents/{id}` | 👤 | `?hard_delete=0` | `void` | `memberApi.deleteDocument` |

### 3f. Events & News

| # | Method | Path | Role | Body / Params | Response | Frontend Source |
|---|--------|------|------|---------------|----------|-----------------|
| 3.18 | GET | `/member/events` | 👤 | — | `EventItem[]` | `memberApi.getEvents` |
| 3.19 | GET | `/member/news` | 👤 | `?page` | `Paginated<NewsArticle>` | `memberApi.getNews` |

### 3g. Penalties

| # | Method | Path | Role | Body / Params | Response | Frontend Source |
|---|--------|------|------|---------------|----------|-----------------|
| 3.20 | GET | `/member/penalties` | 👤 | — | `Penalty[]` | `memberApi.getPenalties` |
| 3.21 | POST | `/member/penalties/{id}/pay` | 👤 | `{ method, phone? }` | `{ message, reference }` | `memberApi.payPenalty` |

### 3h. Withdrawals & Donations

| # | Method | Path | Role | Body / Params | Response | Frontend Source |
|---|--------|------|------|---------------|----------|-----------------|
| 3.22 | GET | `/member/withdrawal-receipts` | 👤 | — | `WithdrawalRequest[]` | `memberApi.getWithdrawalReceipts` |
| 3.23 | GET | `/member/donation-campaigns` | 👤 | — | `DonationCampaign[]` | `memberApi.getDonationCampaigns` |
| 3.24 | POST | `/member/donate` | 👤 | `{ campaign_id, amount, method, phone? }` | `{ message, reference }` | `memberApi.donate` |

### 3i. Executive Dashboard

| # | Method | Path | Role | Body / Params | Response | Frontend Source |
|---|--------|------|------|---------------|----------|-----------------|
| 3.25 | GET | `/member/executive/{roleName}` | 👤 | — | `{ role, title, stats: {label,value}[], actions: {label,route}[] }` | `memberApi.getExecutiveDashboard` |

### 3j. Downloads (PDF)

| # | Method | Path | Role | Body / Params | Response | Frontend Source |
|---|--------|------|------|---------------|----------|-----------------|
| 3.26 | GET 📥 | `/member/downloads/statement` | 👤 | `?from&to` | PDF binary | `memberApi.downloadStatement` |
| 3.27 | GET 📥 | `/member/downloads/receipt/{id}` | 👤 | — | PDF binary | `memberApi.downloadReceipt` |

### 3k. Payments (M-Pesa STK Push)

| # | Method | Path | Role | Body / Params | Response | Frontend Source |
|---|--------|------|------|---------------|----------|-----------------|
| 3.28 | POST | `/payments/stk-push` | 👤 | `{ phone, amount, account_ref, member_id?, paymentType, transactionDesc?, penaltyIds?, campaignId? }` | `{ checkoutRequestId, message }` | `memberApi.stkPush` |
| 3.29 | GET | `/payments/status/{checkoutRequestId}` | 👤 | — | `{ status, message? }` | `memberApi.paymentStatus` |

---

## 4. Treasurer Module (38 endpoints)

### 4a. Dashboard

| # | Method | Path | Role | Body / Params | Response | Frontend Source |
|---|--------|------|------|---------------|----------|-----------------|
| 4.1 | GET | `/treasurer/dashboard` | 💰 | — | `{ operational_balance, contributions_balance, penalty_balance, donation_balance, book_balance, bank_balance, reconciliation_diff, pending_withdrawals, pending_expenses, monthly_contributions: {month,amount}[] }` | `treasurerApi.dashboard` |

### 4b. Contributions

| # | Method | Path | Role | Body / Params | Response | Frontend Source |
|---|--------|------|------|---------------|----------|-----------------|
| 4.2 | GET | `/treasurer/contributions` | 💰 | `?page&status&from&to` | `Paginated<Contribution>` | `treasurerApi.getContributions` |
| 4.3 | POST | `/treasurer/contributions/{id}/adjust` | 💰 | `{ amount, reason }` | `{ message }` | `treasurerApi.adjustContribution` |

### 4c. Wallets

| # | Method | Path | Role | Body / Params | Response | Frontend Source |
|---|--------|------|------|---------------|----------|-----------------|
| 4.4 | GET | `/treasurer/penalty-wallet` | 💰 | `?page` | `Paginated<WalletTransaction>` | `treasurerApi.getPenaltyWallet` |
| 4.5 | GET | `/treasurer/donation-wallet` | 💰 | `?page` | `Paginated<WalletTransaction>` | `treasurerApi.getDonationWallet` |
| 4.6 | GET | `/treasurer/operational-wallet` | 💰 | `?page` | `Paginated<WalletTransaction>` | `treasurerApi.getOperationalWallet` |
| 4.7 | GET | `/treasurer/wallets` | 💰 | — | `WalletSummary[]` | `treasurerApi.getWallets` |
| 4.8 | GET | `/treasurer/wallet-reports` | 💰 | — | `{ wallet, transactions, balance, period }[]` | `treasurerApi.getWalletReports` |

### 4d. Withdrawal Approvals

| # | Method | Path | Role | Body / Params | Response | Frontend Source |
|---|--------|------|------|---------------|----------|-----------------|
| 4.9 | GET | `/treasurer/withdrawal-approvals` | 💰 | — | `WithdrawalRequest[]` | `treasurerApi.getWithdrawalApprovals` |
| 4.10 | POST | `/treasurer/withdrawal-approvals/{id}/{approve\|reject}` | 💰 | `{ note? }` | `{ message }` | `treasurerApi.approveWithdrawal` |

### 4e. Documents & Reports

| # | Method | Path | Role | Body / Params | Response | Frontend Source |
|---|--------|------|------|---------------|----------|-----------------|
| 4.11 | GET | `/treasurer/documents` | 💰 | — | `Document[]` | `treasurerApi.getDocuments` |
| 4.12 | GET | `/treasurer/reports` | 💰 | — | `{ name, type, date, size }[]` | `treasurerApi.getReports` |
| 4.13 | GET 📥 | `/treasurer/reports/{type}/export` | 💰 | `?from&to` | PDF binary | `treasurerApi.exportReport` |

### 4f. Bank Sync & Statements

| # | Method | Path | Role | Body / Params | Response | Frontend Source |
|---|--------|------|------|---------------|----------|-----------------|
| 4.14 | GET | `/treasurer/bank-sync` | 💰 | — | `{ last_sync, status, new_transactions }` | `treasurerApi.getBankSync` |
| 4.15 | POST | `/treasurer/bank-sync` | 💰 | — | `{ message, imported }` | `treasurerApi.triggerBankSync` |
| 4.16 | GET | `/treasurer/bank-statement` | 💰 | `?page` | `Paginated<BankTransaction>` | `treasurerApi.getBankStatement` |
| 4.17 | GET | `/treasurer/book-balance` | 💰 | — | `{ balance, last_updated, entries: WalletTransaction[] }` | `treasurerApi.getBookBalance` |

### 4g. Bank Statement Import

| # | Method | Path | Role | Body / Params | Response | Frontend Source |
|---|--------|------|------|---------------|----------|-----------------|
| 4.18 | POST 📎 | `/treasurer/bank-statement-import` | 💰 | `file` (single Excel) | `{ message, imported }` | `treasurerApi.importBankStatement` |
| 4.19 | POST | `/treasurer/bank-statement-import` | 💰 | `{ rows: [[trans_date, value_date, details, ref, credit, debit, book_balance]…], source_name?, file_name? }` | `ImportBatchResponse` | `importsApi.bankStatement` |
| 4.20 | POST 📎 | `/treasurer/book-balance-import` | 💰 | `file` | `{ message, imported }` | `treasurerApi.importBookBalance` |

**ImportBatchResponse:**

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

> Frontend chunks rows in batches of 200 and sends multiple sequential requests.

### 4h. Expenses

| # | Method | Path | Role | Body / Params | Response | Frontend Source |
|---|--------|------|------|---------------|----------|-----------------|
| 4.21 | GET | `/treasurer/expenses` | 💰 | `?page` | `Paginated<Expense>` | `treasurerApi.getExpenses` |
| 4.22 | POST | `/treasurer/expenses` | 💰 | `Partial<Expense>` | `Expense` | `treasurerApi.createExpense` |
| 4.23 | POST | `/treasurer/expenses/{id}/{approve\|reject}` | 💰 | — | `{ message }` | `treasurerApi.approveExpense` |

### 4i. Donation Campaigns

| # | Method | Path | Role | Body / Params | Response | Frontend Source |
|---|--------|------|------|---------------|----------|-----------------|
| 4.24 | GET | `/treasurer/donation-campaigns` | 💰 | — | `DonationCampaign[]` | `treasurerApi.getDonationCampaigns` |
| 4.25 | POST | `/treasurer/donation-campaigns` | 💰 | `Partial<DonationCampaign>` | `DonationCampaign` | `treasurerApi.createDonationCampaign` |
| 4.26 | PATCH | `/treasurer/donation-campaigns/{id}` | 💰 | `Partial<DonationCampaign>` | `DonationCampaign` | `treasurerApi.updateDonationCampaign` |
| 4.27 | DELETE | `/treasurer/donation-campaigns/{id}` | 💰 | — | `{ message }` | `treasurerApi.deleteDonationCampaign` |

### 4j. Memos

| # | Method | Path | Role | Body / Params | Response | Frontend Source |
|---|--------|------|------|---------------|----------|-----------------|
| 4.28 | GET | `/treasurer/memos` | 💰 | — | `Memo[]` | `treasurerApi.getMemos` |
| 4.29 | POST | `/treasurer/memos` | 💰 | `Partial<Memo>` | `Memo` | `treasurerApi.createMemo` |
| 4.30 | PATCH | `/treasurer/memos/{id}` | 💰 | `Partial<Memo>` | `Memo` | `treasurerApi.updateMemo` |
| 4.31 | DELETE | `/treasurer/memos/{id}` | 💰 | — | `{ message }` | `treasurerApi.deleteMemo` |
| 4.32 | PATCH | `/treasurer/memos/{id}/resend` | 💰 | `{}` | `{ message }` | `treasurerApi.resendMemo` |
| 4.33 | GET | `/treasurer/memo-templates` | 💰 | — | `MemoTemplate[]` | `treasurerApi.getMemoTemplates` |

### 4k. Settings

| # | Method | Path | Role | Body / Params | Response | Frontend Source |
|---|--------|------|------|---------------|----------|-----------------|
| 4.34 | GET | `/treasurer/settings` | 💰 | — | `OrganizationSettings` | `treasurerApi.getOrgSettings` |
| 4.35 | PATCH | `/treasurer/settings` | 💰 | `Partial<OrganizationSettings>` | `{ message }` | `treasurerApi.updateOrgSettings` |

### 4l. Payouts

| # | Method | Path | Role | Body / Params | Response | Frontend Source |
|---|--------|------|------|---------------|----------|-----------------|
| 4.36 | GET | `/treasurer/payouts` | 💰 | — | `Payout[]` | `treasurerApi.getPayouts` |
| 4.37 | POST | `/treasurer/payouts` | 💰 | `{ member_id, payout_type, amount, reason, phone, wallet_type }` | `Payout` | `treasurerApi.createPayout` |
| 4.38 | GET | `/treasurer/payouts/eligible` | 💰 | `?payout_type` | `EligibleMember[]` | `treasurerApi.getEligibleMembers` |

**PayoutType enum:** `wedding | death_member | death_spouse | death_child | death_parent | retirement | emergency | medical`

---

## 5. Admin Module (25 endpoints)

### 5a. Dashboard

| # | Method | Path | Role | Body / Params | Response | Frontend Source |
|---|--------|------|------|---------------|----------|-----------------|
| 5.1 | GET | `/admin/dashboard` | 🏛️ | — | `{ total_members, active_members, total_contributions, pending_approvals, defaulters_count, recent_signups: Member[], contributions_trend: {month,amount}[] }` | `adminApi.dashboard` |

### 5b. Members

| # | Method | Path | Role | Body / Params | Response | Frontend Source |
|---|--------|------|------|---------------|----------|-----------------|
| 5.2 | GET | `/admin/members` | 🏛️ | `?page&search&status` | `Paginated<Member>` | `adminApi.getMembers` |
| 5.3 | GET | `/admin/members/{id}` | 🏛️ | — | `Member` | `adminApi.getMemberDetail` |
| 5.4 | GET | `/admin/members/{id}/contributions` | 🏛️ | — | `Contribution[]` | `adminApi.getMemberContributions` |
| 5.5 | GET | `/admin/members/{id}/beneficiaries` | 🏛️ | — | `Beneficiary[]` | `adminApi.getMemberBeneficiaries` |

### 5c. Contributions & Beneficiaries

| # | Method | Path | Role | Body / Params | Response | Frontend Source |
|---|--------|------|------|---------------|----------|-----------------|
| 5.6 | GET | `/admin/contributions` | 🏛️ | `?page&status` | `Paginated<Contribution>` | `adminApi.getContributions` |
| 5.7 | GET | `/admin/beneficiaries` | 🏛️ | `?page` | `Paginated<Beneficiary>` | `adminApi.getBeneficiaries` |

### 5d. Defaulters & Payments

| # | Method | Path | Role | Body / Params | Response | Frontend Source |
|---|--------|------|------|---------------|----------|-----------------|
| 5.8 | GET | `/admin/defaulters` | 🏛️ | — | `Defaulter[]` | `adminApi.getDefaulters` |
| 5.9 | GET | `/admin/payments` | 🏛️ | `?page` | `Paginated<Contribution>` | `adminApi.getPayments` |
| 5.10 | GET | `/admin/unmatched` | 🏛️ | — | `Contribution[]` | `adminApi.getUnmatchedPayments` |
| 5.11 | POST | `/admin/unmatched/{id}/match` | 🏛️ | `{ member_id }` | `{ message }` | `adminApi.matchPayment` |

### 5e. Notifications & SMS

| # | Method | Path | Role | Body / Params | Response | Frontend Source |
|---|--------|------|------|---------------|----------|-----------------|
| 5.12 | GET | `/admin/notifications` | 🏛️ | — | `Notification[]` | `adminApi.getNotifications` |
| 5.13 | POST | `/admin/sms` | 🏛️ | `{ message, recipients: string[] }` | `{ message }` | `adminApi.sendBulkSms` |

### 5f. Events

| # | Method | Path | Role | Body / Params | Response | Frontend Source |
|---|--------|------|------|---------------|----------|-----------------|
| 5.14 | GET | `/admin/events` | 🏛️ | — | `EventItem[]` | `adminApi.getEvents` |
| 5.15 | POST | `/admin/events` | 🏛️ | `Partial<EventItem>` | `EventItem` | `adminApi.createEvent` |

### 5g. Documents & Penalties

| # | Method | Path | Role | Body / Params | Response | Frontend Source |
|---|--------|------|------|---------------|----------|-----------------|
| 5.16 | GET | `/admin/documents` | 🏛️ | — | `Document[]` | `adminApi.getDocuments` |
| 5.17 | GET | `/admin/penalty-payments` | 🏛️ | — | `Penalty[]` | `adminApi.getPenalties` |
| 5.18 | POST | `/admin/penalty-payments/{id}/verify` | 🏛️ | — | `{ message }` | `adminApi.verifyPenaltyPayment` |

### 5h. Donations & Campaigns

| # | Method | Path | Role | Body / Params | Response | Frontend Source |
|---|--------|------|------|---------------|----------|-----------------|
| 5.19 | GET | `/admin/donations` | 🏛️ | — | `Donation[]` | `adminApi.getDonations` |
| 5.20 | GET | `/admin/donation-campaigns` | 🏛️ | — | `DonationCampaign[]` | `adminApi.getDonationCampaigns` |
| 5.21 | POST | `/admin/donation-campaigns` | 🏛️ | `Partial<DonationCampaign>` | `DonationCampaign` | `adminApi.createDonationCampaign` |

### 5i. Withdrawal Approvals

| # | Method | Path | Role | Body / Params | Response | Frontend Source |
|---|--------|------|------|---------------|----------|-----------------|
| 5.22 | GET | `/admin/withdrawal-approval` | 🏛️ | — | `WithdrawalRequest[]` | `adminApi.getWithdrawalApprovals` |
| 5.23 | POST | `/admin/withdrawal-approval/{id}/{approve\|reject}` | 🏛️ | — | `{ message }` | `adminApi.approveWithdrawal` |

### 5j. Imports

| # | Method | Path | Role | Body / Params | Response | Frontend Source |
|---|--------|------|------|---------------|----------|-----------------|
| 5.24 | POST 📎 | `/admin/import` | 🏛️ | `file` (Excel) | `{ message, imported }` | `adminApi.importExcel` |
| 5.25 | POST 📎 | `/admin/beneficiary-import` | 🏛️ | `file` (Excel) | `{ message, imported }` | `adminApi.importBeneficiaries` |

---

## 6. Website CMS Module (18 endpoints)

### 6a. Dashboard

| # | Method | Path | Role | Body / Params | Response | Frontend Source |
|---|--------|------|------|---------------|----------|-----------------|
| 6.1 | GET | `/admin/website/dashboard` | 🏛️ | — | `{ total_content, published_content, draft_content, total_people, unread_messages, media_count, recent_content: WebsiteContent[], recent_messages: ContactMessage[] }` | `websiteApi.dashboard` |

### 6b. Content Management

| # | Method | Path | Role | Body / Params | Response | Frontend Source |
|---|--------|------|------|---------------|----------|-----------------|
| 6.2 | GET | `/admin/website/content` | 🏛️ | `?page` | `Paginated<WebsiteContent>` | `websiteApi.getContent` |
| 6.3 | POST | `/admin/website/content` | 🏛️ | `Partial<WebsiteContent>` | `WebsiteContent` | `websiteApi.createContent` |
| 6.4 | PUT | `/admin/website/content/{id}` | 🏛️ | `Partial<WebsiteContent>` | `WebsiteContent` | `websiteApi.updateContent` |
| 6.5 | POST | `/admin/website/content/{id}/archive` | 🏛️ | — | `void` | `websiteApi.archiveContent` |

### 6c. People / Leadership

| # | Method | Path | Role | Body / Params | Response | Frontend Source |
|---|--------|------|------|---------------|----------|-----------------|
| 6.6 | GET | `/admin/website/people` | 🏛️ | — | `LeadershipPerson[]` | `websiteApi.getPeople` |
| 6.7 | POST | `/admin/website/people` | 🏛️ | `Partial<LeadershipPerson>` | `LeadershipPerson` | `websiteApi.createPerson` |
| 6.8 | PUT | `/admin/website/people/{id}` | 🏛️ | `Partial<LeadershipPerson>` | `LeadershipPerson` | `websiteApi.updatePerson` |
| 6.9 | DELETE | `/admin/website/people/{id}` | 🏛️ | — | `void` | `websiteApi.deletePerson` |
| 6.10 | GET | `/admin/website/people/leadership-members` | 🏛️ | — | `Member[]` | `websiteApi.getLeadershipMembers` |

### 6d. Contact Messages

| # | Method | Path | Role | Body / Params | Response | Frontend Source |
|---|--------|------|------|---------------|----------|-----------------|
| 6.11 | GET | `/admin/website/contact-messages` | 🏛️ | `?page` | `Paginated<ContactMessage>` | `websiteApi.getContactMessages` |
| 6.12 | POST | `/admin/website/contact-messages/{id}/mark-read` | 🏛️ | — | `void` | `websiteApi.markMessageRead` |

### 6e. Media

| # | Method | Path | Role | Body / Params | Response | Frontend Source |
|---|--------|------|------|---------------|----------|-----------------|
| 6.13 | GET | `/admin/website/media` | 🏛️ | — | `MediaAsset[]` | `websiteApi.getMedia` |

### 6f. Settings

| # | Method | Path | Role | Body / Params | Response | Frontend Source |
|---|--------|------|------|---------------|----------|-----------------|
| 6.14 | GET | `/admin/website/settings/{section}` | 🏛️ | — | `Record<string, unknown>` | `websiteApi.getSettings` |
| 6.15 | PUT | `/admin/website/settings/{section}` | 🏛️ | `Record<string, unknown>` | `{ message }` | `websiteApi.updateSettings` |

### 6g. Email Templates

| # | Method | Path | Role | Body / Params | Response | Frontend Source |
|---|--------|------|------|---------------|----------|-----------------|
| 6.16 | GET | `/admin/website/email-templates` | 🏛️ | — | `EmailTemplate[]` | `websiteApi.getEmailTemplates` |
| 6.17 | PUT | `/admin/website/email-templates/{id}` | 🏛️ | `Partial<EmailTemplate>` | `EmailTemplate` | `websiteApi.updateEmailTemplate` |
| 6.18 | POST | `/admin/website/email-templates/{id}/test` | 🏛️ | `{ email }` | `{ message }` | `websiteApi.testEmail` |

---

## 7. Secretary Module (9 endpoints)

| # | Method | Path | Role | Body / Params | Response | Frontend Source |
|---|--------|------|------|---------------|----------|-----------------|
| 7.1 | GET | `/secretary/dashboard` | 📝 | — | `{ pending_minutes, approved_minutes, upcoming_meetings, total_minutes, recent_minutes: MeetingMinutes[], upcoming: ScheduledMeeting[] }` | `secretaryApi.dashboard` |
| 7.2 | GET | `/secretary/minutes-review` | 📝 | — | `MeetingMinutes[]` | `secretaryApi.getMinutesReview` |
| 7.3 | POST | `/secretary/minutes/{id}/submit-review` | 📝 | — | `{ message }` | `secretaryApi.submitForReview` |
| 7.4 | GET | `/secretary/meeting-minutes` | 📝 | — | `MeetingMinutes[]` | `secretaryApi.getMeetingMinutes` |
| 7.5 | POST | `/secretary/meeting-minutes` | 📝 | `Partial<MeetingMinutes>` | `MeetingMinutes` | `secretaryApi.createMinutes` |
| 7.6 | PUT | `/secretary/meeting-minutes/{id}` | 📝 | `Partial<MeetingMinutes>` | `MeetingMinutes` | `secretaryApi.updateMinutes` |
| 7.7 | GET | `/secretary/meeting-scheduling` | 📝 | — | `ScheduledMeeting[]` | `secretaryApi.getSchedule` |
| 7.8 | POST | `/secretary/meeting-scheduling` | 📝 | `Partial<ScheduledMeeting>` | `ScheduledMeeting` | `secretaryApi.createMeeting` |
| 7.9 | POST | `/secretary/meeting-scheduling/{id}/cancel` | 📝 | — | `{ message }` | `secretaryApi.cancelMeeting` |

---

## 8. Vice-Secretary Module (5 endpoints)

| # | Method | Path | Role | Body / Params | Response | Frontend Source |
|---|--------|------|------|---------------|----------|-----------------|
| 8.1 | GET | `/vice-secretary/dashboard` | 📋 | — | `{ total_events, active_events, total_documents, pending_documents, active_members, recent_messages, unread_notifications, recent_documents, event_summary, recent_activity }` | `viceSecretaryApi.dashboard` |
| 8.2 | GET | `/vice-secretary/meeting-minutes` | 📋 | — | `MeetingMinutes[]` | `viceSecretaryApi.getMeetingMinutes` |
| 8.3 | POST | `/vice-secretary/meeting-minutes` | 📋 | `Partial<MeetingMinutes>` | `MeetingMinutes` | `viceSecretaryApi.createMinutes` |
| 8.4 | PUT | `/vice-secretary/meeting-minutes/{id}` | 📋 | `Partial<MeetingMinutes>` | `MeetingMinutes` | `viceSecretaryApi.updateMinutes` |
| 8.5 | POST | `/vice-secretary/meeting-minutes/{id}/submit` | 📋 | — | `{ message }` | `viceSecretaryApi.submitMinutes` |

---

## 9. Chairperson Module (3 endpoints)

| # | Method | Path | Role | Body / Params | Response | Frontend Source |
|---|--------|------|------|---------------|----------|-----------------|
| 9.1 | GET | `/chairperson/dashboard` | 🪑 | — | `{ pending_approvals, approved_count, rejected_count, pending_items: MeetingMinutes[], recent_approvals: {title,date,action}[] }` | `chairpersonApi.dashboard` |
| 9.2 | GET | `/chairperson/approve-minutes` | 🪑 | — | `MeetingMinutes[]` | `chairpersonApi.getPendingApprovals` |
| 9.3 | POST | `/chairperson/approve-minutes/{id}/{approve\|reject}` | 🪑 | `{ note? }` | `{ message }` | `chairpersonApi.approveMinutes` |

---

## 10. Office Module (1 endpoint)

| # | Method | Path | Role | Body / Params | Response | Frontend Source |
|---|--------|------|------|---------------|----------|-----------------|
| 10.1 | GET | `/office/dashboard` | 🏢 | — | `{ total_members, pending_applications, pending_documents, recent_activities: {description,date}[] }` | `officeApi.dashboard` |

---

## 11. Meeting Minutes Module — Shared (11 endpoints)

| # | Method | Path | Role | Body / Params | Response | Frontend Source |
|---|--------|------|------|---------------|----------|-----------------|
| 11.1 | GET | `/minutes` | 🔐 | `?filter=mine\|secretary_pending\|pending` | `HydratedMinute[]` | `minutesApi.list` |
| 11.2 | GET | `/minutes/{id}` | 🔐 | — | `HydratedMinute` | `minutesApi.get` |
| 11.3 | POST | `/minutes` | 🔐 | `CreateMinutePayload` | `{ data: HydratedMinute }` | `minutesApi.create` |
| 11.4 | PUT | `/minutes/{id}` | 🔐 | `Partial<CreateMinutePayload>` | `{ data: HydratedMinute }` | `minutesApi.update` |
| 11.5 | DELETE | `/minutes/{id}` | 🔐 | — | `{ data: { deleted: boolean } }` | `minutesApi.delete` |
| 11.6 | POST | `/minutes/{id}/submit` | 🔐 | — | `{ message }` | `minutesApi.submit` |
| 11.7 | POST | `/minutes/{id}/secretary-review` | 📝 | `{ decision: 'approve'\|'reject', notes? }` | `{ message }` | `minutesApi.secretaryReview` |
| 11.8 | POST | `/minutes/{id}/approve` | 🪑 | — | `{ message }` | `minutesApi.approve` |
| 11.9 | POST | `/minutes/{id}/reject` | 🪑 | `{ notes }` | `{ message }` | `minutesApi.reject` |
| 11.10 | GET | `/minutes/executive-members` | 🔐 | — | `MinuteMember[]` | `minutesApi.getExecutiveMembers` |
| 11.11 | GET | `/rest/v1/members` | 🔐 | `?limit` | `MinuteMember[]` | `minutesApi.getMembers` |

### CreateMinutePayload

```typescript
{
  title: string;
  meeting_date: string;
  meeting_type: 'general' | 'executive';
  agenda?: string;
  discussions?: string;
  decisions?: string;
  action_items?: string;
  next_meeting_date?: string | null;
  attendance: { member_id: string; status: 'PRESENT' | 'ABSENT_WITH_APOLOGY' | 'ABSENT' }[];
  visible_to_members?: string[] | null;
}
```

### HydratedMinute

```typescript
{
  id, title, meeting_date, meeting_type, agenda, discussions,
  decisions, action_items, next_meeting_date, status,
  prepared_by, reviewed_by, approved_by, rejection_notes,
  attendees: { id, name }[],
  absent_with_apology: { id, name }[],
  absent_without_apology: { id, name }[],
  secretary_name, secretary_signature_url,
  chairperson_name, chairperson_signature_url,
  created_at, updated_at
}
```

### Minutes Workflow

```
Vice-Secretary → creates minutes (draft) → submits
     ↓
Secretary → reviews → approves (forwards) or rejects (returns)
     ↓
Chairperson → approves (final) or rejects (returns to secretary)
```

---

## 12. Signatures Module — Shared (3 endpoints)

| # | Method | Path | Role | Body | Response | Frontend Source |
|---|--------|------|------|------|----------|-----------------|
| 12.1 | GET | `/signatures/current` | 🔐 | `?role=secretary\|chairperson` | `{ url, uploaded_at, name } \| null` | `minutesApi.getSignature` |
| 12.2 | POST 📎 | `/signatures` | 🔐 | `file`, `role` (multipart) | `{ message, url }` | `minutesApi.uploadSignature` |
| 12.3 | POST | `/signatures` | 🔐 | `{ role, file_name }` (JSON) | `{ message, url }` | `signatureApi.upload` |

---

## 13. Super-Admin Module (16 endpoints)

| # | Method | Path | Role | Body / Params | Response | Frontend Source |
|---|--------|------|------|---------------|----------|-----------------|
| 13.1 | GET | `/super-admin/dashboard` | 🛡️ | — | `{ total_users, online_users, total_members, system_health: SystemMetric[], recent_logins: LoginActivity[], pending_alerts }` | `superAdminApi.dashboard` |
| 13.2 | GET | `/super-admin/members/{id}` | 🛡️ | — | `Member` | `superAdminApi.getMemberDetail` |
| 13.3 | GET | `/super-admin/troubleshooting` | 🛡️ | — | `{ issues: {id,severity,module,description,date}[], diagnostics: SystemMetric[] }` | `superAdminApi.getTroubleshooting` |
| 13.4 | GET | `/super-admin/audit-logs` | 🛡️ | `?page` | `Paginated<AuditLog>` | `superAdminApi.getAuditLogs` |
| 13.5 | GET | `/super-admin/security` | 🛡️ | — | `{ two_factor, password_policy: {min_length, require_special, require_numbers}, session_timeout, ip_whitelist: string[] }` | `superAdminApi.getSecuritySettings` |
| 13.6 | PUT | `/super-admin/security` | 🛡️ | `Record<string, unknown>` | `{ message }` | `superAdminApi.updateSecuritySettings` |
| 13.7 | GET | `/super-admin/password-management` | 🛡️ | — | `{ policies: SystemMetric[], expired_passwords, forced_resets }` | `superAdminApi.getPasswordManagement` |
| 13.8 | GET | `/super-admin/access-control` | 🛡️ | — | `AccessRole[]` | `superAdminApi.getAccessControl` |
| 13.9 | PUT | `/super-admin/access-control/{id}` | 🛡️ | `{ permissions: string[] }` | `{ message }` | `superAdminApi.updateRolePermissions` |
| 13.10 | GET | `/super-admin/online-users` | 🛡️ | — | `OnlineUser[]` | `superAdminApi.getOnlineUsers` |
| 13.11 | GET | `/super-admin/login-activity` | 🛡️ | `?page` | `Paginated<LoginActivity>` | `superAdminApi.getLoginActivity` |
| 13.12 | GET | `/super-admin/system-monitoring` | 🛡️ | — | `{ metrics: SystemMetric[], services: {name,status,uptime}[] }` | `superAdminApi.getSystemMonitoring` |
| 13.13 | GET | `/super-admin/bank` | 🛡️ | — | `{ connected, last_sync, accounts: {name,number,balance,status}[] }` | `superAdminApi.getBank` |
| 13.14 | GET | `/super-admin/database` | 🛡️ | — | `{ size, tables, connections, slow_queries, backup_last }` | `superAdminApi.getDatabase` |
| 13.15 | GET | `/super-admin/system` | 🛡️ | — | `{ version, uptime, environment, features: {name,enabled}[] }` | `superAdminApi.getSystem` |
| 13.16 | GET | `/super-admin/trace` | 🛡️ | — | `{ traces: {id,request,duration,status,date}[] }` | `superAdminApi.getTrace` |

> Super-Admin also has access to all Admin routes (§5), Website CMS routes (§6), Treasurer routes (§4), Secretary routes (§7), and Minutes routes (§11).

---

## 14. AI Assistant — Supabase Edge Function (2 endpoints)

> **Demo base URL:** `{SUPABASE_URL}/functions/v1/ai-assistant`
> **Production base URL:** `{API_BASE_URL}/functions/v1/ai-assistant`
> Auth: demo uses Supabase anon key; production uses Bearer JWT.
> `verify_jwt = false` on the edge function.

| # | Method | Path | Body | Response | Frontend Source |
|---|--------|------|------|----------|-----------------|
| 14.1 | POST | `/functions/v1/ai-assistant` | Demo: `{ message, conversationId?, userId, userRole, userName, contextType?, history? }` — Prod: `{ query, conversation_id, context_type, messages }` | SSE stream: `data: { content, done?, conversationId? }` chunks, ending with `data: [DONE]` | `streamAssistantResponse` |
| 14.2 | GET | `/functions/v1/ai-assistant/conversation` | `?context_type&conversation_id` | `{ conversation_id, messages: [{id, conversation_id, role, content, created_at}] }` | `fetchConversations` / `fetchMessages` |

**Context types:** `admin_assistant` (default), `secretary_assistant` (for secretary/vice-secretary/chairperson)

---

## 15. Group Chat — Supabase Direct DB Access (15 operations)

> The frontend talks to Supabase directly (anon key) for group chat.
> Tables: `chat_conversations`, `chat_participants`, `chat_messages`, `chat_reactions`, `chat_typing`.
> All realtime-enabled.

| # | Operation | Table | Method | Details | Frontend Source |
|---|-----------|-------|--------|---------|-----------------|
| 15.1 | Fetch conversations | `chat_participants` + `chat_conversations` | SELECT | By `user_id`, load details + last message + unread count | `fetchUserConversations` |
| 15.2 | Fetch messages | `chat_messages` + `chat_reactions` | SELECT | By `conversation_id`, ordered `created_at`, limit 100, reactions joined | `fetchMessages` |
| 15.3 | Fetch participants | `chat_participants` | SELECT | By `conversation_id` | `fetchParticipants` |
| 15.4 | Send message | `chat_messages` | INSERT | Then update `chat_conversations.updated_at` | `sendMessage` |
| 15.5 | Delete message | `chat_messages` | DELETE | By `id` | `deleteMessage` |
| 15.6 | Mark read | `chat_participants` | UPDATE | Set `last_read_at` by `conversation_id` + `user_id` | `markConversationRead` |
| 15.7 | Set typing | `chat_typing` | UPSERT/DELETE | Insert/update `updated_at`; delete when stopped | `setTyping` |
| 15.8 | Toggle reaction | `chat_reactions` | INSERT/DELETE | Toggle by `message_id` + `user_id` + `emoji` | `toggleReaction` |
| 15.9 | Create group | `chat_conversations` + `chat_participants` | INSERT | Create conversation, insert all participants | `createGroupConversation` |
| 15.10 | Add participant | `chat_participants` | INSERT | — | `addParticipant` |
| 15.11 | Remove participant | `chat_participants` | DELETE | By `conversation_id` + `user_id` | `removeParticipant` |
| 15.12 | Subscribe messages | Realtime channel | — | `INSERT`/`DELETE` on `chat_messages` filtered by `conversation_id` | `subscribeToMessages` |
| 15.13 | Subscribe reactions | Realtime channel | — | `*` on `chat_reactions` | `subscribeToReactions` |
| 15.14 | Subscribe typing | Realtime channel | — | `*` on `chat_typing` filtered by `conversation_id` | `subscribeToTyping` |
| 15.15 | Subscribe conversations | Realtime channel | — | `*` on `chat_messages`, `chat_conversations`, `chat_participants` | `subscribeToConversations` |

---

## Endpoint Count Summary

| Module | Endpoints |
|--------|-----------|
| Auth | 6 |
| Public Website | 6 |
| Member Portal (incl. documents, payments, storage) | 29 |
| Treasurer | 38 |
| Admin | 25 |
| Website CMS | 18 |
| Secretary | 9 |
| Vice-Secretary | 5 |
| Chairperson | 3 |
| Office | 1 |
| Minutes (shared) | 11 |
| Signatures (shared) | 3 |
| Super-Admin | 16 |
| **Total REST endpoints** | **170** |
| AI Assistant (edge function) | 2 |
| Group Chat (Supabase DB ops) | 15 |
| **Grand total** | **187** |

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

```php
Route::middleware('api')->group(function () {
    Route::prefix('auth')->group(...);           // public login, protected others
    Route::prefix('public')->group(...);          // no auth
});

Route::middleware(['auth:api'])->group(function () {
    Route::prefix('member')->middleware('role:member')->group(...);
    Route::prefix('treasurer')->middleware('role:treasurer|admin')->group(...);
    Route::prefix('admin')->middleware('role:admin|super-admin')->group(...);
    Route::prefix('secretary')->middleware('role:secretary')->group(...);
    Route::prefix('vice-secretary')->middleware('role:vice-secretary')->group(...);
    Route::prefix('chairperson')->middleware('role:chairperson')->group(...);
    Route::prefix('office')->middleware('role:office')->group(...);
    Route::prefix('super-admin')->middleware('role:super-admin')->group(...);
    Route::prefix('minutes')->group(...);         // shared, all authenticated
    Route::prefix('signatures')->group(...);      // shared, all authenticated
    Route::prefix('documents')->group(...);       // shared, all authenticated
    Route::prefix('payments')->group(...);        // shared, all authenticated
    Route::prefix('storage')->group(...);         // shared, all authenticated
    Route::prefix('rest/v1')->group(...);         // shared, all authenticated
});
```

---

## Database Tables Required by Laravel Backend

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `users` | Auth + profiles | id, phone, email (synthetic), password, role, name, status, force_password_change |
| `members` | Extended member data | user_id, member_number, id_number, phone, dob, gender, occupation, join_date, county, workplace, status |
| `contributions` | Member contributions | id, member_id, amount, method, reference, status, period, date, type |
| `beneficiaries` | Member dependents | id, member_id, name, relationship, phone, email, percentage, id_number, date_of_birth |
| `notifications` | Member notifications | id, member_id, title, message/body, type, read_at, created_at |
| `documents` | Uploaded documents | id, member_id, type_code, file_url, status, notes, expires_at, size |
| `document_types` | Doc type catalog | code, name, allowed_member_upload |
| `events` | Calendar events | id, title, description, date, end_date, location, status, attendees_count |
| `news` | News articles | id, title, slug, excerpt, content/body, category, image_url, status, author, published_at, featured |
| `penalties` | Member penalties | id, member_id, amount, reason, status, date, paid_date |
| `withdrawal_requests` | Withdrawal workflow | id, member_id, amount, reason, status, requested_date, approved_by, approved_date |
| `wallets` | Wallet balances | id, type (operational/contributions/penalty/donation), balance |
| `wallet_transactions` | Wallet ledger | id, wallet_id, amount, type (credit/debit), reference, description, balance_after, date, status |
| `donations` | Donation records | id, member_id, campaign_id, amount, method, reference, status, date |
| `donation_campaigns` | Campaign management | id, title, description, target_amount, raised_amount, contributors, status, start_date, end_date, image |
| `bank_transactions` | Imported bank data | id, trans_date, value_date, transaction_details, reference_no, credit, debit, book_balance, matched |
| `expenses` | Expense workflow | id, amount, description, category, date, status, approved_by, receipt_url |
| `payouts` | Member payouts | id, reference, member_id, payout_type, relation, amount, reason, phone, wallet_type, status, signatories |
| `memos` | Treasurer memos | id, title, subject, body, status, prepared_by, recipients_count, sent_at, template_id |
| `memo_templates` | Reusable memo templates | id, name, subject, body_template |
| `meeting_minutes` | Minutes with workflow | id, title, meeting_date, meeting_type, agenda, discussions, decisions, action_items, next_meeting_date, status, prepared_by, reviewed_by, approved_by, rejection_notes, visible_to_members |
| `minute_attendance` | Meeting attendance | minute_id, member_id, status |
| `scheduled_meetings` | Calendar scheduling | id, title, date, time, location, type, agenda, attendees_count, status, created_by |
| `signatures` | Role-based signatures | id, role, file_url, uploaded_at, file_name |
| `website_content` | CMS content | id, type, title, slug, content/body, excerpt, category, image_url, status, author_id, published_at |
| `website_settings` | Site settings | id, section, key, value (JSON) |
| `leadership_people` | Public leadership | id, name, slug, title, position, bio, photo_url, display_order, member_id, email, phone |
| `contact_messages` | Contact form inbox | id, name, email, subject, message, read_at, date |
| `email_templates` | Email template mgmt | id, name, subject, body, variables, last_modified |
| `media_assets` | Media library | id, name, filename, url, type, size, uploaded_by, uploaded_date |
| `organization_settings` | Org config | id, organization_name, tagline, email, phone, address, logo_url, signature_url, stamp_url, payout_bereavement, payout_medical, payout_education |
| `audit_logs` | Audit trail | id, user, action, module, ip, date, details |
| `login_activity` | Login records | id, user, email, ip, device, status, date |
| `access_roles` | Role permissions | id, name, description, permissions (JSON), users_count |
| `defaulters` | Computed view | id, member_name, member_number, phone, missed_periods, outstanding_amount, last_payment_date, status |
| `system_metrics` | System health | label, value, status, detail |
| `online_users` | Active sessions | id, name, email, role, last_activity, ip, device |

---

## Demo vs Production Architecture

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
       ├── /documents/*       → Laravel + MySQL
       ├── /payments/*        → Laravel + M-Pesa API
       └── Group Chat         → Supabase (direct, anon key, realtime)
       └── AI Assistant       → Supabase Edge Function (SSE stream)
```

---

## Error Response Shape

```json
{
  "message": "Human-readable error",
  "error": "Optional technical error",
  "errors": { "field": ["Validation message"] }
}
```

| Status | Meaning | Frontend behavior |
|--------|---------|-------------------|
| 200 | Success | Parse JSON or binary |
| 201 | Created | Parse JSON |
| 401 | Unauthorized | Clear token, clear query cache, redirect to `/login` |
| 403 | Forbidden | Show error message |
| 404 | Not found | Show error message |
| 422 | Validation | Show field-level errors |
| 500 | Server error | Show generic error message |

---

## Shared Type Reference

### Paginated\<T\>

```typescript
interface Paginated<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}
```

### Member

```typescript
interface Member {
  id, name, email, phone, member_number, role, status,
  joined_date, contributions_total, penalties_total,
  donations_total, avatar?, county, workplace
}
```

### Contribution

```typescript
interface Contribution {
  id, member_id, member_name, amount, type,
  status: 'pending' | 'confirmed' | 'failed',
  method, reference, period, date
}
```

### WalletTransaction

```typescript
interface WalletTransaction {
  id, wallet, type: 'credit' | 'debit', amount,
  description, reference, balance_after, date, status
}
```

### OrganizationSettings

```typescript
interface OrganizationSettings {
  id, organization_name, tagline, email, phone, address,
  logo_url?, signature_url?, stamp_url?,
  payout_bereavement, payout_medical, payout_education
}
```

### Payout

```typescript
interface Payout {
  id, reference, member_id, member_name, member_number, phone,
  payout_type: PayoutType, relation, amount, reason,
  wallet_type: 'operational' | 'donation' | 'penalty',
  status: 'pending' | 'approved' | 'paid' | 'rejected',
  created_at, paid_at?, signatories?: { role, status }[]
}
```

### WithdrawalRequest

```typescript
interface WithdrawalRequest {
  id, member_id, member_name, amount, reason,
  status: 'pending' | 'approved' | 'rejected' | 'paid',
  requested_date, approved_date?, approved_by?
}
```

### MeetingMinutes

```typescript
interface MeetingMinutes {
  id, title, meeting_date, meeting_type?,
  status: 'draft' | 'pending_review' | 'approved' | 'rejected'
      | 'submitted_to_secretary' | 'pending_chairperson_approval'
      | 'rejected_by_secretary',
  prepared_by, reviewed_by?, approved_by?,
  content, attendees, file_url?, rejection_notes?
}
```
