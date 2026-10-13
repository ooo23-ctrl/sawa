# KHWWC — Controller & Service Matrix

**Date:** 2026-10-13  
**Purpose:** Map every API endpoint to its controller, service, form request, and resource

---

## 1. Controller Inventory

| Controller | Module | Endpoints | File |
|-----------|--------|-----------|------|
| AuthController | Auth | 6 | `app/Http/Controllers/Api/AuthController.php` |
| PublicWebsiteController | Public | 6 | `app/Http/Controllers/Api/PublicWebsiteController.php` |
| MemberController | Member | 17 | `app/Http/Controllers/Api/MemberController.php` |
| DocumentController | Documents | 5 | `app/Http/Controllers/Api/DocumentController.php` |
| PaymentController | Payments | 2 | `app/Http/Controllers/Api/PaymentController.php` |
| TreasurerController | Treasurer | 38 | `app/Http/Controllers/Api/TreasurerController.php` |
| AdminController | Admin | 25 | `app/Http/Controllers/Api/AdminController.php` |
| WebsiteController | Website CMS | 18 | `app/Http/Controllers/Api/WebsiteController.php` |
| SecretaryController | Secretary | 9 | `app/Http/Controllers/Api/SecretaryController.php` |
| ViceSecretaryController | Vice-Secretary | 5 | `app/Http/Controllers/Api/ViceSecretaryController.php` |
| ChairpersonController | Chairperson | 3 | `app/Http/Controllers/Api/ChairpersonController.php` |
| OfficeController | Office | 1 | `app/Http/Controllers/Api/OfficeController.php` |
| MinutesController | Minutes | 11 | `app/Http/Controllers/Api/MinutesController.php` |
| SignatureController | Signatures | 3 | `app/Http/Controllers/Api/SignatureController.php` |
| SuperAdminController | Super-Admin | 16 | `app/Http/Controllers/Api/SuperAdminController.php` |
| **Total** | | **170** | |

---

## 2. Service Inventory

| Service | Responsibility | Used By |
|---------|---------------|---------|
| AuthService | Login, JWT issue, logout, password changes, session tracking | AuthController |
| MemberService | Member profile, dashboard stats, beneficiaries CRUD | MemberController |
| ContributionService | Contribution queries, adjustments, matching | MemberController, TreasurerController, AdminController |
| WalletService | Wallet balances, transactions, ledger entries | TreasurerController |
| BankImportService | Bank statement parsing, matching, dedup, import batches | TreasurerController |
| ExpenseService | Expense CRUD, approval workflow | TreasurerController |
| PayoutService | Payout creation, eligibility, approval workflow | TreasurerController |
| DonationService | Donations, campaigns | MemberController, TreasurerController, AdminController |
| PenaltyService | Penalties, payment status | MemberController, AdminController |
| WithdrawalService | Withdrawal requests, approval workflow | MemberController, TreasurerController, AdminController |
| DocumentService | Document uploads, replacements, type management | DocumentController |
| PaymentService | M-Pesa STK push, status polling, callbacks | PaymentController |
| MinutesService | Minutes CRUD, workflow (submit, review, approve) | MinutesController, SecretaryController, ViceSecretaryController |
| MeetingService | Meeting scheduling, cancellation | SecretaryController |
| NotificationService | Notification creation, read status | MemberController, AdminController |
| AuditService | Audit log writing | All controllers (via middleware/listeners) |
| WebsiteService | Content, people, settings, media, email templates | WebsiteController, PublicWebsiteController |
| ImportService | Member/beneficiary Excel import | AdminController |
| SecurityService | Security settings, password management | SuperAdminController |
| SystemService | System health, database info, tracing | SuperAdminController |

---

## 3. Form Request Inventory

| Request Class | Endpoint | Validation Rules |
|--------------|----------|-----------------|
| LoginRequest | POST /auth/login | `phone: required|string`, `password: required|string` |
| ChangePasswordRequest | POST /auth/password | `current_password: required|string`, `new_password: required|string|min:8|confirmed` |
| ForcePasswordChangeRequest | POST /auth/force-password-change | `new_password: required|string|min:8|confirmed` |
| StoreBeneficiaryRequest | POST /member/beneficiaries | `name: required|string|max:255`, `relationship: required|string`, `phone: nullable|string`, `email: nullable|email`, `id_number: nullable|string`, `date_of_birth: nullable|date`, `percentage: required|numeric|min:0|max:100` |
| UpdateBeneficiaryRequest | PUT /member/beneficiaries/{id} | Same as Store |
| UpdateProfileRequest | PUT /member/profile | `name: required|string`, `phone: required|string`, `email: nullable|email`, `county: nullable|string`, `workplace: nullable|string` |
| UploadDocumentRequest | POST /documents | `document_type_code: required|string|exists:document_types,code`, `file: required|file|mimes:pdf,jpg,jpeg,png|max:5120`, `notes: nullable|string`, `expires_at: nullable|date` |
| ReplaceDocumentRequest | POST /documents/{id}/replace | `file: required|file|mimes:pdf,jpg,jpeg,png|max:5120`, `notes: nullable|string`, `expires_at: nullable|date` |
| StkPushRequest | POST /payments/stk-push | `phone: required|string|regex:/^254[0-9]{9}$/`, `amount: required|numeric|min:1`, `account_ref: required|string`, `paymentType: required|string`, `member_id: nullable|uuid`, `transactionDesc: nullable|string`, `penaltyIds: nullable|array`, `campaignId: nullable|uuid` |
| AdjustContributionRequest | POST /treasurer/contributions/{id}/adjust | `amount: required|numeric|min:0`, `reason: required|string|max:500` |
| CreateExpenseRequest | POST /treasurer/expenses | `description: required|string`, `amount: required|numeric|min:0`, `category: required|string`, `date: required|date` |
| CreatePayoutRequest | POST /treasurer/payouts | `member_id: required|uuid|exists:members,id`, `payout_type: required|in:wedding,death_member,death_spouse,death_child,death_parent,retirement,emergency,medical`, `amount: required|numeric|min:0`, `reason: required|string`, `phone: required|string`, `wallet_type: required|in:operational,donation,penalty` |
| CreateDonationCampaignRequest | POST /treasurer/donation-campaigns | `title: required|string|max:255`, `description: nullable|string`, `target: required|numeric|min:0`, `start_date: required|date`, `end_date: nullable|date|after:start_date` |
| UpdateDonationCampaignRequest | PATCH /treasurer/donation-campaigns/{id} | Same as Create (partial) |
| CreateMemoRequest | POST /treasurer/memos | `title: required|string`, `subject: required|string`, `body: required|string`, `template_id: nullable|uuid` |
| UpdateMemoRequest | PATCH /treasurer/memos/{id} | Same as Create (partial) |
| UpdateOrgSettingsRequest | PATCH /treasurer/settings | `organization_name: nullable|string`, `tagline: nullable|string`, `email: nullable|email`, `phone: nullable|string`, `address: nullable|string`, `payout_bereavement: nullable|numeric|min:0`, `payout_medical: nullable|numeric|min:0`, `payout_education: nullable|numeric|min:0` |
| CreateEventRequest | POST /admin/events | `title: required|string`, `description: nullable|string`, `date: required|date`, `end_date: nullable|date|after:date`, `location: nullable|string` |
| SendBulkSmsRequest | POST /admin/sms | `message: required|string|max:160`, `recipients: required|array|min:1`, `recipients.*: required|string` |
| MatchPaymentRequest | POST /admin/unmatched/{id}/match | `member_id: required|uuid|exists:members,id` |
| ApproveWithdrawalRequest | POST /treasurer/withdrawal-approvals/{id}/{action} | `note: nullable|string|max:500` |
| CreateContentRequest | POST /admin/website/content | `type: required|string`, `title: required|string`, `slug: required|string|unique:website_content,slug`, `content: nullable|string`, `excerpt: nullable|string`, `category: nullable|string`, `status: nullable|in:published,draft,archived` |
| UpdateContentRequest | PUT /admin/website/content/{id} | Same as Create (partial, unique slug excluding self) |
| CreatePersonRequest | POST /admin/website/people | `name: required|string`, `slug: required|string|unique:leadership_people,slug`, `title: nullable|string`, `position: nullable|string`, `bio: nullable|string`, `email: nullable|email`, `phone: nullable|string`, `order: nullable|integer` |
| UpdatePersonRequest | PUT /admin/website/people/{id} | Same as Create (partial) |
| UpdateSettingsRequest | PUT /admin/website/settings/{section} | `*` (dynamic key-value) |
| TestEmailRequest | POST /admin/website/email-templates/{id}/test | `email: required|email` |
| CreateMinutesRequest | POST /minutes | `title: required|string`, `meeting_date: required|date`, `meeting_type: required|in:general,executive`, `agenda: nullable|string`, `discussions: nullable|string`, `decisions: nullable|string`, `action_items: nullable|string`, `next_meeting_date: nullable|date`, `attendance: required|array`, `attendance.*.member_id: required|uuid`, `attendance.*.status: required|in:PRESENT,ABSENT_WITH_APOLOGY,ABSENT`, `visible_to_members: nullable|array` |
| UpdateMinutesRequest | PUT /minutes/{id} | Same as Create (partial) |
| SecretaryReviewRequest | POST /minutes/{id}/secretary-review | `decision: required|in:approve,reject`, `notes: nullable|string|max:1000` |
| RejectMinutesRequest | POST /minutes/{id}/reject | `notes: required|string|max:1000` |
| UploadSignatureRequest | POST /signatures | `file: required|file|mimes:jpg,jpeg,png|max:2048`, `role: required|in:secretary,chairperson` |
| CreateMeetingRequest | POST /secretary/meeting-scheduling | `title: required|string`, `date: required|date`, `time: required|date_format:H:i`, `location: nullable|string`, `type: nullable|string`, `agenda: nullable|array` |
| CreateDonationRequest | POST /member/donate | `campaign_id: required|uuid|exists:donation_campaigns,id`, `amount: required|numeric|min:1`, `method: required|string`, `phone: nullable|string` |
| PayPenaltyRequest | POST /member/penalties/{id}/pay | `method: required|string`, `phone: nullable|string` |
| ContactRequest | POST /public/website/contact | `name: required|string|max:255`, `email: required|email`, `subject: required|string|max:500`, `message: required|string` |
| UpdateRolePermissionsRequest | PUT /super-admin/access-control/{id} | `permissions: required|array` |
| UpdateSecuritySettingsRequest | PUT /super-admin/security | Dynamic |

---

## 4. API Resource Inventory

| Resource | Model | Fields Serialized |
|----------|-------|-------------------|
| UserResource | User | id, name, email, role, avatar, member_id, phone, must_change_password |
| MemberResource | Member | id, name, email, phone, member_number, role, status, joined_date, contributions_total, penalties_total, donations_total, avatar, county, workplace |
| ContributionResource | Contribution | id, member_id, member_name, amount, type, status, method, reference, period, date |
| BeneficiaryResource | Beneficiary | id, member_id, name, relationship, phone, email, percentage, id_number, date_of_birth |
| NotificationResource | Notification | id, title, message, type, read, date |
| DocumentResource | Document | id, title, type, status, size, uploaded_by, date, url |
| WalletTransactionResource | WalletTransaction | id, wallet, type, amount, description, reference, balance_after, date, status |
| WalletSummaryResource | Wallet | name, balance, transactions_count, last_activity |
| WithdrawalRequestResource | WithdrawalRequest | id, member_id, member_name, amount, reason, status, requested_date, approved_date, approved_by |
| PenaltyResource | Penalty | id, member_id, member_name, amount, reason, status, date, paid_date |
| DonationResource | Donation | id, member_id, member_name, amount, campaign, method, reference, status, date |
| DonationCampaignResource | DonationCampaign | id, title, description, target, raised, contributors, status, start_date, end_date, image |
| DefaulterResource | (computed) | id, member_name, member_number, phone, missed_periods, outstanding_amount, last_payment_date, status |
| ExpenseResource | Expense | id, description, amount, category, date, status, approved_by, receipt_url |
| PayoutResource | Payout | id, reference, member_id, member_name, member_number, phone, payout_type, relation, amount, reason, wallet_type, status, created_at, paid_at, signatories |
| EligibleMemberResource | Member | id, name, member_number, phone, eligible_amount |
| BankTransactionResource | BankTransaction | id, date, description, reference, amount, type, matched, matched_contribution |
| MemoResource | Memo | id, title, subject, body, status, prepared_by, recipients_count, created_at, sent_at, template_id |
| MemoTemplateResource | MemoTemplate | id, name, subject, body |
| EventResource | Event | id, title, description, date, end_date, location, status, attendees_count, image |
| NewsArticleResource | NewsArticle | id, title, slug, excerpt, content, category, status, author, date, image, featured |
| WebsiteContentResource | WebsiteContent | id, type, title, slug, content, status, author, date, excerpt, image, category |
| LeadershipPersonResource | LeadershipPerson | id, name, slug, title, position, bio, photo, email, phone, order |
| ContactMessageResource | ContactMessage | id, name, email, subject, message, read, date |
| MeetingMinutesResource | MeetingMinutes | id, title, meeting_date, meeting_type, status, prepared_by, reviewed_by, approved_by, content, attendees, file_url, rejection_notes |
| HydratedMinuteResource | MeetingMinutes | Full hydrated minute with attendance arrays, secretary/chairperson names, signature URLs |
| ScheduledMeetingResource | ScheduledMeeting | id, title, date, time, location, type, agenda, attendees_count, status |
| AuditLogResource | AuditLog | id, user, action, module, ip, date, details |
| LoginActivityResource | LoginActivity | id, user, email, ip, device, status, date |
| AccessRoleResource | AccessRole | id, name, description, permissions, users_count |
| OnlineUserResource | (computed) | id, name, email, role, last_activity, ip, device |
| EmailTemplateResource | EmailTemplate | id, name, subject, body, variables, last_modified |
| MediaAssetResource | MediaAsset | id, name, type, size, url, uploaded_date |
| OrganizationSettingsResource | OrganizationSettings | id, organization_name, tagline, email, phone, address, logo_url, signature_url, stamp_url, payout_bereavement, payout_medical, payout_education |

---

## 5. Policy Inventory

| Policy | Model | Methods | Authorization Logic |
|--------|-------|---------|---------------------|
| MemberPolicy | Member | view, update, viewContributions, viewBeneficiaries | Members can only view/update own profile; admins/treasurers/super-admins can view all |
| ContributionPolicy | Contribution | adjust | Only treasurer/admin/super-admin can adjust |
| BeneficiaryPolicy | Beneficiary | view, create, update, delete | Members can only manage own beneficiaries |
| DocumentPolicy | Document | view, upload, replace, delete | Members can only manage own documents; admins can view all |
| NotificationPolicy | Notification | view, markRead | Members can only view/mark own notifications |
| WithdrawalRequestPolicy | WithdrawalRequest | approve, reject | Only treasurer/admin can approve; members can view own receipts |
| PenaltyPolicy | Penalty | verify | Only admin/treasurer can verify payments; members can view own |
| ExpensePolicy | Expense | create, approve | Treasurer/admin can create; only treasurer/admin can approve |
| PayoutPolicy | Payout | create, approve | Only treasurer/admin can create and approve |
| DonationCampaignPolicy | DonationCampaign | create, update, delete | Only treasurer/admin can manage; members can view |
| MeetingMinutesPolicy | MeetingMinutes | create, update, delete, submit, secretaryReview, approve, reject | Vice-sec can create/update; secretary can review; chairperson can approve/reject |
| ScheduledMeetingPolicy | ScheduledMeeting | create, cancel | Only secretary can manage |
| MemoPolicy | Memo | create, update, delete, resend | Only treasurer can manage |
| SignaturePolicy | Signature | upload, view | Secretary can upload secretary sig; chairperson can upload chairperson sig |
| AccessRolePolicy | AccessRole | update | Only super-admin |
| AuditLogPolicy | AuditLog | view | Only super-admin |
| LoginActivityPolicy | LoginActivity | view | Only super-admin |
| ContactMessagePolicy | ContactMessage | view, markRead | Only admin/super-admin/website-manager |

---

## 6. Route Registry (routes/api.php)

```php
<?php

use Illuminate\Support\Facades\Route;

// Public (no auth)
Route::prefix('public/website')->group(function () {
    Route::get('settings', [PublicWebsiteController::class, 'getSettings']);
    Route::get('content/{type}', [PublicWebsiteController::class, 'getContent']);
    Route::get('content/{type}/{slug}', [PublicWebsiteController::class, 'getContentDetail']);
    Route::get('leadership', [PublicWebsiteController::class, 'getLeadership']);
    Route::get('people/{slug}', [PublicWebsiteController::class, 'getPerson']);
    Route::post('contact', [PublicWebsiteController::class, 'submitContact']);
});

// Auth (login public, others protected)
Route::prefix('auth')->group(function () {
    Route::post('login', [AuthController::class, 'login']);
    Route::middleware('auth:api')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('me', [AuthController::class, 'me']);
        Route::post('password', [AuthController::class, 'changePassword']);
        Route::post('force-password-change', [AuthController::class, 'forcePasswordChange']);
    });
});

// M-Pesa callback (public, verified by signature)
Route::post('payments/mpesa-callback', [PaymentController::class, 'mpesaCallback']);

// Protected routes
Route::middleware('auth:api')->group(function () {

    // Member portal
    Route::prefix('member')->middleware('role:member|admin|treasurer|secretary|vice-secretary|chairperson|office|super-admin')->group(function () {
        Route::get('dashboard', [MemberController::class, 'dashboard']);
        Route::get('profile', [MemberController::class, 'getProfile']);
        Route::put('profile', [MemberController::class, 'updateProfile']);
        Route::get('contributions', [MemberController::class, 'getContributions']);
        Route::get('beneficiaries', [MemberController::class, 'getBeneficiaries']);
        Route::post('beneficiaries', [MemberController::class, 'addBeneficiary']);
        Route::put('beneficiaries/{id}', [MemberController::class, 'updateBeneficiary']);
        Route::delete('beneficiaries/{id}', [MemberController::class, 'deleteBeneficiary']);
        Route::get('notifications', [MemberController::class, 'getNotifications']);
        Route::patch('notifications/{id}/read', [MemberController::class, 'markNotificationRead']);
        Route::get('documents', [MemberController::class, 'getDocuments']);
        Route::get('events', [MemberController::class, 'getEvents']);
        Route::get('news', [MemberController::class, 'getNews']);
        Route::get('penalties', [MemberController::class, 'getPenalties']);
        Route::post('penalties/{id}/pay', [MemberController::class, 'payPenalty']);
        Route::get('withdrawal-receipts', [MemberController::class, 'getWithdrawalReceipts']);
        Route::get('donation-campaigns', [MemberController::class, 'getDonationCampaigns']);
        Route::post('donate', [MemberController::class, 'donate']);
        Route::get('downloads/statement', [MemberController::class, 'downloadStatement']);
        Route::get('downloads/receipt/{id}', [MemberController::class, 'downloadReceipt']);
        Route::get('executive/{roleName}', [MemberController::class, 'getExecutiveDashboard']);
    });

    // Documents (shared)
    Route::prefix('documents')->group(function () {
        Route::get('me/summary', [DocumentController::class, 'getSummary']);
        Route::get('types', [DocumentController::class, 'getTypes']);
        Route::post('/', [DocumentController::class, 'upload']);
        Route::post('{id}/replace', [DocumentController::class, 'replace']);
        Route::delete('{id}', [DocumentController::class, 'delete']);
    });

    // Payments (shared)
    Route::prefix('payments')->group(function () {
        Route::post('stk-push', [PaymentController::class, 'stkPush']);
        Route::get('status/{checkoutRequestId}', [PaymentController::class, 'getStatus']);
    });

    // Minutes (shared)
    Route::prefix('minutes')->group(function () {
        Route::get('/', [MinutesController::class, 'list']);
        Route::get('{id}', [MinutesController::class, 'get']);
        Route::post('/', [MinutesController::class, 'create']);
        Route::put('{id}', [MinutesController::class, 'update']);
        Route::delete('{id}', [MinutesController::class, 'delete']);
        Route::post('{id}/submit', [MinutesController::class, 'submit']);
        Route::post('{id}/secretary-review', [MinutesController::class, 'secretaryReview']);
        Route::post('{id}/approve', [MinutesController::class, 'approve']);
        Route::post('{id}/reject', [MinutesController::class, 'reject']);
        Route::get('executive-members', [MinutesController::class, 'getExecutiveMembers']);
    });

    // Signatures (shared)
    Route::prefix('signatures')->group(function () {
        Route::get('current', [SignatureController::class, 'getCurrent']);
        Route::post('/', [SignatureController::class, 'upload']);
    });

    // REST alias
    Route::get('rest/v1/members', [MemberController::class, 'getMembersForMinutes']);

    // Treasurer
    Route::prefix('treasurer')->middleware('role:treasurer|admin|super-admin')->group(function () {
        Route::get('dashboard', [TreasurerController::class, 'dashboard']);
        Route::get('contributions', [TreasurerController::class, 'getContributions']);
        Route::post('contributions/{id}/adjust', [TreasurerController::class, 'adjustContribution']);
        Route::get('penalty-wallet', [TreasurerController::class, 'getPenaltyWallet']);
        Route::get('donation-wallet', [TreasurerController::class, 'getDonationWallet']);
        Route::get('operational-wallet', [TreasurerController::class, 'getOperationalWallet']);
        Route::get('wallets', [TreasurerController::class, 'getWallets']);
        Route::get('wallet-reports', [TreasurerController::class, 'getWalletReports']);
        Route::get('withdrawal-approvals', [TreasurerController::class, 'getWithdrawalApprovals']);
        Route::post('withdrawal-approvals/{id}/{action}', [TreasurerController::class, 'approveWithdrawal']);
        Route::get('documents', [TreasurerController::class, 'getDocuments']);
        Route::get('reports', [TreasurerController::class, 'getReports']);
        Route::get('reports/{type}/export', [TreasurerController::class, 'exportReport']);
        Route::get('bank-sync', [TreasurerController::class, 'getBankSync']);
        Route::post('bank-sync', [TreasurerController::class, 'triggerBankSync']);
        Route::get('bank-statement', [TreasurerController::class, 'getBankStatement']);
        Route::post('bank-statement-import', [TreasurerController::class, 'importBankStatement']);
        Route::post('book-balance-import', [TreasurerController::class, 'importBookBalance']);
        Route::get('book-balance', [TreasurerController::class, 'getBookBalance']);
        Route::get('expenses', [TreasurerController::class, 'getExpenses']);
        Route::post('expenses', [TreasurerController::class, 'createExpense']);
        Route::post('expenses/{id}/{action}', [TreasurerController::class, 'approveExpense']);
        Route::get('donation-campaigns', [TreasurerController::class, 'getDonationCampaigns']);
        Route::post('donation-campaigns', [TreasurerController::class, 'createDonationCampaign']);
        Route::patch('donation-campaigns/{id}', [TreasurerController::class, 'updateDonationCampaign']);
        Route::delete('donation-campaigns/{id}', [TreasurerController::class, 'deleteDonationCampaign']);
        Route::get('memos', [TreasurerController::class, 'getMemos']);
        Route::post('memos', [TreasurerController::class, 'createMemo']);
        Route::patch('memos/{id}', [TreasurerController::class, 'updateMemo']);
        Route::delete('memos/{id}', [TreasurerController::class, 'deleteMemo']);
        Route::patch('memos/{id}/resend', [TreasurerController::class, 'resendMemo']);
        Route::get('memo-templates', [TreasurerController::class, 'getMemoTemplates']);
        Route::get('settings', [TreasurerController::class, 'getOrgSettings']);
        Route::patch('settings', [TreasurerController::class, 'updateOrgSettings']);
        Route::get('payouts', [TreasurerController::class, 'getPayouts']);
        Route::post('payouts', [TreasurerController::class, 'createPayout']);
        Route::get('payouts/eligible', [TreasurerController::class, 'getEligibleMembers']);
    });

    // Admin
    Route::prefix('admin')->middleware('role:admin|super-admin')->group(function () {
        Route::get('dashboard', [AdminController::class, 'dashboard']);
        Route::get('members', [AdminController::class, 'getMembers']);
        Route::get('members/{id}', [AdminController::class, 'getMemberDetail']);
        Route::get('members/{id}/contributions', [AdminController::class, 'getMemberContributions']);
        Route::get('members/{id}/beneficiaries', [AdminController::class, 'getMemberBeneficiaries']);
        Route::get('contributions', [AdminController::class, 'getContributions']);
        Route::get('beneficiaries', [AdminController::class, 'getBeneficiaries']);
        Route::get('defaulters', [AdminController::class, 'getDefaulters']);
        Route::get('payments', [AdminController::class, 'getPayments']);
        Route::get('unmatched', [AdminController::class, 'getUnmatchedPayments']);
        Route::post('unmatched/{id}/match', [AdminController::class, 'matchPayment']);
        Route::get('notifications', [AdminController::class, 'getNotifications']);
        Route::post('sms', [AdminController::class, 'sendBulkSms']);
        Route::get('events', [AdminController::class, 'getEvents']);
        Route::post('events', [AdminController::class, 'createEvent']);
        Route::get('documents', [AdminController::class, 'getDocuments']);
        Route::get('penalty-payments', [AdminController::class, 'getPenalties']);
        Route::post('penalty-payments/{id}/verify', [AdminController::class, 'verifyPenaltyPayment']);
        Route::get('donations', [AdminController::class, 'getDonations']);
        Route::get('donation-campaigns', [AdminController::class, 'getDonationCampaigns']);
        Route::post('donation-campaigns', [AdminController::class, 'createDonationCampaign']);
        Route::get('withdrawal-approval', [AdminController::class, 'getWithdrawalApprovals']);
        Route::post('withdrawal-approval/{id}/{action}', [AdminController::class, 'approveWithdrawal']);
        Route::post('import', [AdminController::class, 'importExcel']);
        Route::post('beneficiary-import', [AdminController::class, 'importBeneficiaries']);
    });

    // Website CMS
    Route::prefix('admin/website')->middleware('role:admin|super-admin')->group(function () {
        Route::get('dashboard', [WebsiteController::class, 'dashboard']);
        Route::get('content', [WebsiteController::class, 'getContent']);
        Route::post('content', [WebsiteController::class, 'createContent']);
        Route::put('content/{id}', [WebsiteController::class, 'updateContent']);
        Route::post('content/{id}/archive', [WebsiteController::class, 'archiveContent']);
        Route::get('people', [WebsiteController::class, 'getPeople']);
        Route::post('people', [WebsiteController::class, 'createPerson']);
        Route::put('people/{id}', [WebsiteController::class, 'updatePerson']);
        Route::delete('people/{id}', [WebsiteController::class, 'deletePerson']);
        Route::get('people/leadership-members', [WebsiteController::class, 'getLeadershipMembers']);
        Route::get('contact-messages', [WebsiteController::class, 'getContactMessages']);
        Route::post('contact-messages/{id}/mark-read', [WebsiteController::class, 'markMessageRead']);
        Route::get('media', [WebsiteController::class, 'getMedia']);
        Route::get('settings/{section}', [WebsiteController::class, 'getSettings']);
        Route::put('settings/{section}', [WebsiteController::class, 'updateSettings']);
        Route::get('email-templates', [WebsiteController::class, 'getEmailTemplates']);
        Route::put('email-templates/{id}', [WebsiteController::class, 'updateEmailTemplate']);
        Route::post('email-templates/{id}/test', [WebsiteController::class, 'testEmail']);
    });

    // Secretary
    Route::prefix('secretary')->middleware('role:secretary|super-admin')->group(function () {
        Route::get('dashboard', [SecretaryController::class, 'dashboard']);
        Route::get('minutes-review', [SecretaryController::class, 'getMinutesReview']);
        Route::post('minutes/{id}/submit-review', [SecretaryController::class, 'submitForReview']);
        Route::get('meeting-minutes', [SecretaryController::class, 'getMeetingMinutes']);
        Route::post('meeting-minutes', [SecretaryController::class, 'createMinutes']);
        Route::put('meeting-minutes/{id}', [SecretaryController::class, 'updateMinutes']);
        Route::get('meeting-scheduling', [SecretaryController::class, 'getSchedule']);
        Route::post('meeting-scheduling', [SecretaryController::class, 'createMeeting']);
        Route::post('meeting-scheduling/{id}/cancel', [SecretaryController::class, 'cancelMeeting']);
    });

    // Vice-Secretary
    Route::prefix('vice-secretary')->middleware('role:vice-secretary|super-admin')->group(function () {
        Route::get('dashboard', [ViceSecretaryController::class, 'dashboard']);
        Route::get('meeting-minutes', [ViceSecretaryController::class, 'getMeetingMinutes']);
        Route::post('meeting-minutes', [ViceSecretaryController::class, 'createMinutes']);
        Route::put('meeting-minutes/{id}', [ViceSecretaryController::class, 'updateMinutes']);
        Route::post('meeting-minutes/{id}/submit', [ViceSecretaryController::class, 'submitMinutes']);
    });

    // Chairperson
    Route::prefix('chairperson')->middleware('role:chairperson|super-admin')->group(function () {
        Route::get('dashboard', [ChairpersonController::class, 'dashboard']);
        Route::get('approve-minutes', [ChairpersonController::class, 'getPendingApprovals']);
        Route::post('approve-minutes/{id}/{action}', [ChairpersonController::class, 'approveMinutes']);
    });

    // Office
    Route::prefix('office')->middleware('role:office|super-admin')->group(function () {
        Route::get('dashboard', [OfficeController::class, 'dashboard']);
    });

    // Super-Admin
    Route::prefix('super-admin')->middleware('role:super-admin')->group(function () {
        Route::get('dashboard', [SuperAdminController::class, 'dashboard']);
        Route::get('members/{id}', [SuperAdminController::class, 'getMemberDetail']);
        Route::get('troubleshooting', [SuperAdminController::class, 'getTroubleshooting']);
        Route::get('audit-logs', [SuperAdminController::class, 'getAuditLogs']);
        Route::get('security', [SuperAdminController::class, 'getSecuritySettings']);
        Route::put('security', [SuperAdminController::class, 'updateSecuritySettings']);
        Route::get('password-management', [SuperAdminController::class, 'getPasswordManagement']);
        Route::get('access-control', [SuperAdminController::class, 'getAccessControl']);
        Route::put('access-control/{id}', [SuperAdminController::class, 'updateRolePermissions']);
        Route::get('online-users', [SuperAdminController::class, 'getOnlineUsers']);
        Route::get('login-activity', [SuperAdminController::class, 'getLoginActivity']);
        Route::get('system-monitoring', [SuperAdminController::class, 'getSystemMonitoring']);
        Route::get('bank', [SuperAdminController::class, 'getBank']);
        Route::get('database', [SuperAdminController::class, 'getDatabase']);
        Route::get('system', [SuperAdminController::class, 'getSystem']);
        Route::get('trace', [SuperAdminController::class, 'getTrace']);
    });
});
```

---

## 7. Middleware Stack

```php
// app/Http/Middleware/RoleMiddleware.php
// Checks user role against allowed roles for the route
public function handle($request, Closure $next, ...$roles): mixed
{
    $user = $request->user();
    if (!$user || !in_array($user->role, $roles)) {
        return response()->json(['message' => 'Forbidden'], 403);
    }
    return $next($request);
}

// app/Http/Middleware/AuditMiddleware.php
// Writes audit logs for POST/PUT/PATCH/DELETE requests
public function handle($request, Closure $next): mixed
{
    $response = $next($request);
    if (in_array($request->method(), ['POST', 'PUT', 'PATCH', 'DELETE'])) {
        AuditService::log($request, $response);
    }
    return $response;
}

// app/Http/Middleware/RateLimitMiddleware.php
// Rate limits login attempts (5 per minute per IP)
Route::post('login', [AuthController::class, 'login'])
    ->middleware('throttle:5,1');
```
