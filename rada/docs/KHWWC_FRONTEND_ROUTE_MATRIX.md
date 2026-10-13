# KHWWC Frontend Route Matrix

**Date:** 2026-10-13
**Total Routes:** 87

All routes defined in `src/App.tsx`. Role restrictions enforced by `RequireAuth` in `src/auth/RouteGuard.tsx`.

---

## 1. Public Website (No Auth)

| # | Path | Component | Description |
|---|------|-----------|-------------|
| 1 | `/` | HomePage | Landing page |
| 2 | `/public/website/leadership` | LeadershipPage | Leadership team listing |
| 3 | `/public/website/people/:slug` | PersonDetailPage | Person bio detail |
| 4 | `/public/website/content/:type` | ContentListPage | News/events list |
| 5 | `/public/website/content/:type/:slug` | ContentDetailPage | Article detail |
| 6 | `/public/website/contact` | ContactPage | Contact form |

---

## 2. Authentication (No Auth)

| # | Path | Component | Description |
|---|------|-----------|-------------|
| 7 | `/login` | LoginPage | Email/password login |
| 8 | `/force-password-change` | ForcePasswordChangePage | Forced password reset |

---

## 3. All Authenticated Users

| # | Path | Component | Roles | Description |
|---|------|-----------|-------|-------------|
| 9 | `/chat` | ChatPage | All | AI assistant chat |
| 10 | `/api-matrix` | ApiMatrixPage | All | API endpoint browser |

---

## 4. Member Portal (role: member)

| # | Path | Component | Description |
|---|------|-----------|-------------|
| 11 | `/member` | MemberDashboard | Member dashboard |
| 12 | `/member/events` | MemberEvents | Events listing |
| 13 | `/member/documents` | MemberDocuments | Document requests |
| 14 | `/member/downloads` | MemberDownloads | Statement/ receipt downloads |
| 15 | `/member/withdrawal-receipts` | WithdrawalReceipts | Withdrawal receipts |
| 16 | `/member/news` | MemberNews | News articles |
| 17 | `/member/beneficiaries` | MemberBeneficiaries | Beneficiary management |
| 18 | `/member/notifications` | MemberNotifications | Notification center |
| 19 | `/member/profile` | MemberProfile | Profile settings |
| 20 | `/member/pay-penalty` | PayPenalty | Penalty payment |
| 21 | `/member/donate` | Donate | Donation page |
| 22 | `/member/executive/:roleName` | ExecutiveDashboard | Executive role view |

---

## 5. Treasurer (roles: treasurer, admin)

| # | Path | Component | Description |
|---|------|-----------|-------------|
| 23 | `/treasurer` | TreasurerDashboard | Financial dashboard |
| 24 | `/treasurer/contributions` | TreasurerContributions | Contribution management |
| 25 | `/treasurer/contribution-adjustments` | ContributionAdjustments | Adjust contributions |
| 26 | `/treasurer/penalty-wallet` | PenaltyWalletPage | Penalty wallet |
| 27 | `/treasurer/donation-wallet` | DonationWalletPage | Donation wallet |
| 28 | `/treasurer/operational-wallet` | OperationalWalletPage | Operational wallet |
| 29 | `/treasurer/withdrawal-approvals` | WithdrawalApprovals | Withdrawal approvals |
| 30 | `/treasurer/documents` | TreasurerDocuments | Treasurer documents |
| 31 | `/treasurer/reports` | TreasurerReports | Financial reports |
| 32 | `/treasurer/bank-sync` | BankSync | Bank sync trigger |
| 33 | `/treasurer/bank-statement` | BankStatementPage | Bank statement view |
| 34 | `/treasurer/bank-statement-import` | BankStatementImportPage | Import bank statement |
| 35 | `/treasurer/book-balance-import` | BookBalanceImportPage | Import book balance |
| 36 | `/treasurer/book-balance` | BookBalancePage | Book balance view |
| 37 | `/treasurer/wallet-reports` | WalletReportsPage | Wallet reports |
| 38 | `/treasurer/expenses` | ExpensesPage | Expense management |
| 39 | `/treasurer/donation-campaigns` | DonationCampaigns | Campaign management |
| 40 | `/treasurer/memos` | MemoHistory | Memo history |
| 41 | `/treasurer/memos/create` | CreateMemo | Create memo |
| 42 | `/treasurer/memos/:id/edit` | CreateMemo | Edit memo |
| 43 | `/treasurer/settings` | TreasurerSettings | Org settings |

---

## 6. Admin (role: admin)

| # | Path | Component | Description |
|---|------|-----------|-------------|
| 44 | `/admin` | AdminDashboard | Admin dashboard |
| 45 | `/admin/members` | AdminMembers | Member management |
| 46 | `/admin/members/:memberId` | AdminMemberDetail | Member detail |
| 47 | `/admin/contributions` | AdminContributions | Contributions |
| 48 | `/admin/import` | AdminImport | Excel import |
| 49 | `/admin/beneficiary-import` | AdminBeneficiaryImport | Beneficiary import |
| 50 | `/admin/beneficiaries` | AdminBeneficiaries | Beneficiaries |
| 51 | `/admin/payments` | AdminPayments | Payment tracking |
| 52 | `/admin/unmatched` | AdminUnmatchedPayments | Unmatched payments |
| 53 | `/admin/sms` | AdminBulkSms | Bulk SMS |
| 54 | `/admin/events` | AdminEvents | Event management |
| 55 | `/admin/documents` | AdminDocuments | Documents |
| 56 | `/admin/news` | AdminNews | News management |
| 57 | `/admin/beneficiary-requests` | AdminBeneficiaryRequests | Beneficiary requests |
| 58 | `/admin/defaulters` | AdminDefaulters | Defaulters list |
| 59 | `/admin/notifications` | AdminNotifications | Notifications |
| 60 | `/admin/settings` | AdminSettings | Admin settings |
| 61 | `/admin/banking/diagnostics` | AdminBankDiagnostics | Bank diagnostics |
| 62 | `/admin/signatures` | AdminOfficeSignatures | Signature management |
| 63 | `/admin/penalty-payments` | AdminVerifyPenaltyPayments | Verify penalty payments |
| 64 | `/admin/penalty-wallet` | AdminPenaltyWallet | Penalty wallet |
| 65 | `/admin/donations` | AdminDonations | Donations |
| 66 | `/admin/donation-campaigns` | AdminDonationCampaigns | Campaign management |
| 67 | `/admin/withdrawal-approval` | AdminWithdrawalApproval | Withdrawal approval |
| 68 | `/admin/registration-settings` | AdminRegistrationSettings | Registration settings |
| 69 | `/admin/registration-management` | AdminRegistrationManagement | Registration management |
| 70 | `/admin/registration-api-docs` | AdminRegistrationApiDocs | API docs |
| 71 | `/admin/executive-badges` | AdminExecutiveBadges | Executive badges |

### Admin — Website CMS

| # | Path | Component | Description |
|---|------|-----------|-------------|
| 72 | `/admin/website/dashboard` | WebsiteDashboard | CMS dashboard |
| 73 | `/admin/website/content` | WebsiteContentManagement | Content management |
| 74 | `/admin/website/people` | WebsitePeople | People management |
| 75 | `/admin/website/people/leadership-members` | WebsiteLeadershipMembers | Leadership members |
| 76 | `/admin/website/contact-messages` | WebsiteContactInbox | Contact inbox |
| 77 | `/admin/website/media` | WebsiteMedia | Media library |
| 78 | `/admin/website/settings/:section` | WebsiteSettings | Website settings |
| 79 | `/admin/website/email-templates` | WebsiteEmailTemplates | Email templates |

---

## 7. Secretary (role: secretary)

| # | Path | Component | Description |
|---|------|-----------|-------------|
| 80 | `/secretary` | SecretaryDashboard | Secretary dashboard |
| 81 | `/secretary/events` | SecretaryEvents | Events |
| 82 | `/secretary/minutes-review` | MinutesReview | Minutes review |
| 83 | `/secretary/meeting-minutes` | MinutesManagement | Minutes management |
| 84 | `/secretary/meeting-scheduling` | MeetingScheduling | Meeting scheduling |
| 85 | `/secretary/signature` | SecretarySignatureUpload | Signature upload |
| 86 | `/secretary/withdrawal-approvals` | SecretaryWithdrawalApprovals | Withdrawal approvals |

---

## 8. Vice Secretary (role: vice-secretary)

| # | Path | Component | Description |
|---|------|-----------|-------------|
| 87 | `/vice-secretary` | ViceSecretaryDashboard | Vice secretary dashboard |
| 88 | `/vice-secretary/minutes` | ViceSecretaryMinutes | Minutes management |

---

## 9. Chairperson (role: chairperson)

| # | Path | Component | Description |
|---|------|-----------|-------------|
| 89 | `/chairperson` | ChairpersonDashboard | Chairperson dashboard |
| 90 | `/chairperson/approve-minutes` | ApproveMinutes | Approve minutes |
| 91 | `/chairperson/signature` | ChairpersonSignatureUpload | Signature upload |
| 92 | `/chairperson/withdrawal-approvals` | ChairpersonWithdrawalApprovals | Withdrawal approvals |

---

## 10. Office (role: office)

| # | Path | Component | Description |
|---|------|-----------|-------------|
| 93 | `/office` | OfficeDashboard | Office dashboard |

---

## 11. Super Admin (role: super-admin)

### Core Super Admin

| # | Path | Component | Description |
|---|------|-----------|-------------|
| 94 | `/super-admin` | SuperAdminDashboard | Super admin dashboard |
| 95 | `/super-admin/members/:memberId` | SuperAdminMemberDetail | Member detail |
| 96 | `/super-admin/troubleshooting` | SystemTroubleshooting | System troubleshooting |
| 97 | `/super-admin/audit-logs` | AuditLogs | Audit logs |
| 98 | `/super-admin/security` | SecuritySettings | Security settings |
| 99 | `/super-admin/password-management` | PasswordManagement | Password management |
| 100 | `/super-admin/access-control` | AccessControl | Access control |
| 101 | `/super-admin/online-users` | OnlineUsers | Online users |
| 102 | `/super-admin/login-activity` | LoginActivity | Login activity |
| 103 | `/super-admin/system-monitoring` | SystemMonitoring | System monitoring |
| 104 | `/super-admin/bank` | SuperAdminBank | Bank configuration |
| 105 | `/super-admin/database` | SuperAdminDatabase | Database management |
| 106 | `/super-admin/system` | SuperAdminSystem | System info |
| 107 | `/super-admin/trace` | SuperAdminTrace | Request traces |

### Super Admin — Admin Module Reuse

| # | Path | Component | Description |
|---|------|-----------|-------------|
| 108 | `/super-admin/members` | AdminMembers | Member management |
| 109 | `/super-admin/contributions` | AdminContributions | Contributions |
| 110-128 | `/super-admin/*` | Admin* pages | Mirror of admin routes (20 routes) |
| 129 | `/super-admin/minutes` | MinutesManagement | Minutes management |

### Super Admin — Website CMS Reuse

| # | Path | Component | Description |
|---|------|-----------|-------------|
| 130-136 | `/super-admin/website/*` | Website* pages | Mirror of admin CMS routes (7 routes) |

---

## 12. Mobile Navigation

Members get a bottom navigation bar with 4 items:

| Label | Path | Icon |
|-------|------|------|
| Home | `/member` | Home |
| Documents | `/member/documents` | FileText |
| Notifications | `/member/notifications` | Bell |
| Profile | `/member/profile` | User |

---

## Route Guard Logic

```
RequireAuth:
  1. If loading → show LoadingState
  2. If no user → redirect to /login
  3. If roles specified and user.role not in roles → redirect to getHomePath(user.role)
  4. Otherwise → render children
```

Home paths by role:
- member → `/member`
- admin → `/admin`
- treasurer → `/treasurer`
- secretary → `/secretary`
- vice-secretary → `/vice-secretary`
- chairperson → `/chairperson`
- office → `/office`
- super-admin → `/super-admin`
