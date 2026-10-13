# KHWWC — Frontend to Backend Mapping

**Date:** 2026-10-13  
**Purpose:** Map every frontend page and action to its API endpoint

---

## 1. Public Website Pages

| Page | Route | API Calls | Actions | Status |
|------|-------|-----------|---------|--------|
| HomePage | `/` | `publicApi.getSettings()`, `publicApi.getContent('news')`, `publicApi.getContent('events')`, `publicApi.getLeadership()` | View homepage content | Mock-wired |
| LeadershipPage | `/leadership` | `publicApi.getLeadership()` | View leadership grid | Mock-wired |
| PersonDetailPage | `/leadership/:slug` | `publicApi.getPerson(slug)` | View person bio | Mock-wired |
| ContentListPage | `/:type` (news/events/about) | `publicApi.getContent(type, page)` | Paginated content list | Mock-wired; useQuery in conditional |
| ContentDetailPage | `/:type/:slug` | `publicApi.getContentDetail(type, slug)` | View article detail | Mock-wired |
| ContactPage | `/contact` | `publicApi.submitContact(data)` | Submit contact form | Mock-wired |

## 2. Auth Pages

| Page | Route | API Calls | Actions | Status |
|------|-------|-----------|---------|--------|
| LoginPage | `/login` | `authApi.login(creds)` / `mockAuth.login()` | Login with phone+password | Has demo/prod branching |
| ForcePasswordChangePage | `/force-password-change` | `authApi.forcePasswordChange(data)` | Force password change | Hardcodes old password as 'old' |

## 3. Member Portal Pages

| Page | Route | API Calls | Actions | Status |
|------|-------|-----------|---------|--------|
| MemberDashboard | `/member` | `memberApi.dashboard()` | View stats, recent contributions, upcoming events | Mock-wired; "CONTRIBUTUTION" typo |
| MemberProfile | `/member/profile` | `memberApi.getProfile()`, `memberApi.updateProfile()`, `memberApi.uploadProfilePhoto()` | View/edit profile, upload photo | setState-during-render bug |
| MemberBeneficiaries | `/member/beneficiaries` | `memberApi.getBeneficiaries()`, `addBeneficiary()`, `updateBeneficiary()`, `deleteBeneficiary()` | CRUD beneficiaries | Mock-wired; no onError |
| MemberDocuments | `/member/documents` | `memberApi.getDocumentTypes()`, `getDocumentSummary()`, `uploadDocument()`, `replaceDocument()`, `deleteDocument()` | Upload, replace, delete docs | Mock-wired; no onError |
| MemberDownloads | `/member/downloads` | `memberApi.getContributions(1)` | Export statement, membership card, receipt | Fetches page 1 only; hardcoded member; CSV only |
| MemberNotifications | `/member/notifications` | `memberApi.getNotifications()`, `markNotificationRead(id)` | View, mark read | Mock-wired; no mark-all |
| MemberEvents | `/member/events` | `memberApi.getEvents()` | View upcoming/past events | Mock-wired; no pagination |
| MemberNews | `/member/news` | `memberApi.getNews(page)` | Paginated news list | Mock-wired; no detail view |
| PayPenalty | `/member/penalties` | `memberApi.getPenalties()`, `payPenalty(id, data)`, `stkPush()`, `paymentStatus()` | View, pay via M-Pesa | Mock-wired; "penalty(es)" typo |
| Donate | `/member/donate` | `memberApi.getDonationCampaigns()`, `donate(data)`, `stkPush()`, `paymentStatus()` | View campaigns, donate via M-Pesa | Mock-wired |
| WithdrawalReceipts | `/member/withdrawals` | `memberApi.getWithdrawalReceipts()` | View receipts, print, CSV | XSS in print function |
| ExecutiveDashboard | `/member/executive/:role` | `memberApi.getExecutiveDashboard(roleName)` | View role-specific stats | No retry on error |
| ChatPage | `/chat` | `group-chat.ts` functions / `demo-chat.ts` functions | Group chat, create group, reactions, typing | Has demo/prod branching; demo data leak in prod |

## 4. Treasurer Pages

| Page | Route | API Calls | Actions | Status |
|------|-------|-----------|---------|--------|
| TreasurerDashboard | `/treasurer` | `treasurerApi.dashboard()` | View financial overview | Hardcoded stats (512 members, ratios) |
| TreasurerContributions | `/treasurer/contributions` | `treasurerApi.getContributions(params)` | Paginated contributions list | Mock-wired |
| ContributionAdjustments | `/treasurer/contributions/adjustments` | `treasurerApi.adjustContribution(id, data)` | Adjust contribution amount | No confirmation dialog |
| BankStatementImport | `/treasurer/bank-import` | `importsApi.bankStatement(rows, meta)` | Upload Excel, parse, import | Real API call (only non-mock page) |
| BankSync | `/treasurer/bank-sync` | `treasurerApi.getBankSync()`, `triggerBankSync()` | View sync status, trigger sync | No ErrorState |
| WithdrawalApprovals | `/treasurer/withdrawals` | `treasurerApi.getWithdrawalApprovals()`, `approveWithdrawal(id, action, note)` | Approve/reject withdrawals | Mock-wired |
| DonationCampaigns | `/treasurer/donation-campaigns` | `treasurerApi.getDonationCampaigns()`, `createDonationCampaign()`, `updateDonationCampaign()`, `deleteDonationCampaign()` | CRUD campaigns | Mock-wired |
| CreateMemo | `/treasurer/memos/create` | `treasurerApi.getMemoTemplates()`, `getMemos()`, `createMemo()`, `updateMemo()` | Create/edit memo | Hardcoded recipients; recipients_count=512 |
| MemoHistory | `/treasurer/memos` | `treasurerApi.getMemos()`, `deleteMemo()`, `resendMemo()` | View, delete, resend memos | No confirmation for resend |
| ImportHistory | `/treasurer/imports` | `mockTreasurer.getImportHistory()`, `getImportBatchDetail()` | View import batches | Not configured in prod; no ErrorState |
| TreasurerDocuments | `/treasurer/documents` | `treasurerApi.getDocuments()` | View documents | Download buttons are no-op |
| TreasurerReports | `/treasurer/reports` | `treasurerApi.getReports()` | View reports list | Download buttons are no-op; no ErrorState |
| TreasurerSettings | `/treasurer/settings` | `treasurerApi.getOrgSettings()`, `updateOrgSettings()` | View/edit org settings | setState during render; upload areas decorative |
| WalletPages (3) | `/treasurer/wallets/*` | `treasurerApi.getPenaltyWallet()`, `getDonationWallet()`, `getOperationalWallet()` | View wallet transactions | No ErrorState; no pagination UI |
| TreasurerPages (5) | `/treasurer/bank-statement`, `/treasurer/book-balance`, etc. | `treasurerApi.getBankStatement()`, `getBookBalance()`, `getWalletReports()`, `getExpenses()`, `getPayouts()`, `getEligibleMembers()`, `createExpense()`, `createPayout()`, `approveExpense()` | Various financial pages | Mock-wired |

## 5. Admin Pages

| Page | Route | API Calls | Actions | Status |
|------|-------|-----------|---------|--------|
| AdminDashboard | `/admin` | `adminApi.dashboard()` | View admin overview | Hardcoded stats |
| AdminMembers | `/admin/members` | `adminApi.getMembers(params)`, `getMemberDetail(id)`, `getMemberContributions(id)`, `getMemberBeneficiaries(id)` | View members, search, filter | No error state on list |
| BankUnmatched | `/admin/bank-unmatched` | `mockAdmin.getBankUnmatched()`, `reconcileBankUnmatched()` | View unmatched, reconcile | Not configured in prod; hardcoded members |
| AdminPages (multiple) | `/admin/*` | Various `adminApi` and `websiteApi` calls | Content mgmt, events, settings, etc. | Many no-op forms; AdminNews calls wrong API |

## 6. Role Pages

| Page | Route | API Calls | Actions | Status |
|------|-------|-----------|---------|--------|
| SecretaryDashboard | `/secretary` | `secretaryApi.dashboard()` | View secretary overview | Mock-wired |
| SecretaryMinutesReview | `/secretary/minutes-review` | `secretaryApi.getMinutesReview()`, `submitForReview(id)` | Review minutes | Endpoint mismatch bug |
| SecretaryMeetingMinutes | `/secretary/meeting-minutes` | `secretaryApi.getMeetingMinutes()`, `createMinutes()`, `updateMinutes()` | CRUD minutes | Mock-wired |
| SecretarySchedule | `/secretary/schedule` | `secretaryApi.getSchedule()`, `createMeeting()`, `cancelMeeting(id)` | Schedule meetings | Mock-wired |
| ViceSecretaryDashboard | `/vice-secretary` | `viceSecretaryApi.dashboard()` | View overview | Mock-wired |
| ViceSecretaryMinutes | `/vice-secretary/minutes` | `viceSecretaryApi.getMeetingMinutes()`, `createMinutes()`, `updateMinutes()`, `submitMinutes(id)` | Create/submit minutes | Mock-wired |
| ChairpersonDashboard | `/chairperson` | `chairpersonApi.dashboard()` | View approval overview | Mock-wired |
| ChairpersonApprovals | `/chairperson/approve-minutes` | `chairpersonApi.getPendingApprovals()`, `approveMinutes(id, action, note)` | Approve/reject minutes | Mock-wired |
| OfficeDashboard | `/office` | `officeApi.dashboard()` | View office overview | Mock-wired |
| Minutes (shared) | `/minutes` | `minutesApi.list()`, `get()`, `create()`, `update()`, `delete()`, `submit()`, `secretaryReview()`, `approve()`, `reject()`, `getExecutiveMembers()` | Full minutes workflow | Mock-wired |
| Signatures (shared) | `/signatures` | `minutesApi.getSignature()`, `uploadSignature()` | Upload/view signatures | Mock-wired |

## 7. Super-Admin Pages

| Page | Route | API Calls | Actions | Status |
|------|-------|-----------|---------|--------|
| SuperAdminDashboard | `/super-admin` | `superAdminApi.dashboard()` | View system overview | Mock-wired |
| SuperAdminMembers | `/super-admin/members/:id` | `superAdminApi.getMemberDetail(id)` | View member detail | Mock-wired |
| SuperAdminTroubleshooting | `/super-admin/troubleshooting` | `superAdminApi.getTroubleshooting()` | View issues | Mock-wired |
| SuperAdminAuditLogs | `/super-admin/audit-logs` | `superAdminApi.getAuditLogs(page)` | View audit trail | Mock-wired |
| SuperAdminSecurity | `/super-admin/security` | `superAdminApi.getSecuritySettings()`, `updateSecuritySettings()` | View/edit security | Mock-wired |
| SuperAdminAccessControl | `/super-admin/access-control` | `superAdminApi.getAccessControl()`, `updateRolePermissions(id, perms)` | View/edit roles | Mock-wired |
| SuperAdminMonitoring | `/super-admin/monitoring` | `superAdminApi.getSystemMonitoring()`, `getOnlineUsers()`, `getLoginActivity()` | Monitor system | Mock-wired |
| SuperAdminSystem | `/super-admin/system` | `superAdminApi.getSystem()`, `getDatabase()`, `getBank()`, `getTrace()` | System diagnostics | Mock-wired; hardcoded version/uptime |

## 8. Website CMS Pages

| Page | Route | API Calls | Actions | Status |
|------|-------|-----------|---------|--------|
| WebsiteDashboard | `/admin/website` | `websiteApi.dashboard()` | View CMS overview | Mock-wired |
| WebsiteContent | `/admin/website/content` | `websiteApi.getContent()`, `createContent()`, `updateContent()`, `archiveContent()` | CRUD content | Mock-wired |
| WebsitePeople | `/admin/website/people` | `websiteApi.getPeople()`, `createPerson()`, `updatePerson()`, `deletePerson()`, `getLeadershipMembers()` | CRUD leadership | Mock-wired |
| WebsiteMessages | `/admin/website/messages` | `websiteApi.getContactMessages()`, `markMessageRead()` | View contact messages | Mock-wired |
| WebsiteMedia | `/admin/website/media` | `websiteApi.getMedia()` | View media library | Mock-wired |
| WebsiteSettings | `/admin/website/settings/:section` | `websiteApi.getSettings(section)`, `updateSettings(section, data)` | View/edit settings | Mock-wired |
| WebsiteEmailTemplates | `/admin/website/email` | `websiteApi.getEmailTemplates()`, `updateEmailTemplate()`, `testEmail()` | Manage email templates | Mock-wired |

## 9. AI Assistant

| Component | API Calls | Actions | Status |
|-----------|-----------|---------|--------|
| ChatWidget | `chat.ts` — `fetchConversations()`, `fetchMessages()`, `streamAssistantResponse()` | AI chat with streaming | Has demo/prod branching; demo uses Supabase anon key |

---

## Summary Statistics

| Category | Count |
|----------|-------|
| Total pages | ~48 |
| Pages with demo/prod branching | 2 (LoginPage, ChatPage) |
| Pages hardwired to mock | 44 |
| Pages with real API calls | 1 (BankStatementImport) |
| Pages with no ErrorState | ~8 |
| Pages with no-op/decorative buttons | ~5 |
| Pages with React hooks violations | 3 |
| Pages with hardcoded data in production | ~6 |
| Pages with missing onError handlers | ~15 |
| Total API operations mapped | 187 |
