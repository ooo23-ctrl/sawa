# KHWWC — Laravel Backend Implementation Prompt for GitHub Copilot Agent

> **Purpose:** Give this file to the Copilot Agent in VS Code. It contains every
> endpoint, validation rule, database table, policy, and service contract needed
> to build the complete Laravel 11+ backend for the KHWWC welfare application.
>
> **Frontend repo:** The React frontend is already built and wired to these exact
> endpoints. The API contract below is the source of truth — do not deviate from
> paths, methods, request fields, or response shapes.

---

## 0. Environment & Stack

| Component | Requirement |
|-----------|-------------|
| PHP | 8.2+ (8.4 preferred) |
| Laravel | 11.x or 12.x (verify with `composer show laravel/framework`) |
| Database | MySQL 8.0+ or MariaDB 10.6+ |
| Auth | `php-open-source-saver/jwt-auth` (JWT, Bearer token) |
| PDF | `barryvdh/laravel-dompdf` |
| Excel | `maatwebsite/excel` or `phpoffice/phpspreadsheet` |
| Queue | Redis (preferred) or database driver |
| M-Pesa | Daraja API (sandbox for development) |
| SMS | Africa's Talking (sandbox for development) |

### Installation Commands

```bash
composer create-project laravel/laravel khwwc-api "11.*"
cd khwwc-api
composer require php-open-source-saver/jwt-auth
composer require barryvdh/laravel-dompdf
composer require phpoffice/phpspreadsheet
php artisan vendor:publish --provider="Tymon\JWTAuth\Providers\LaravelServiceProvider"
php artisan jwt:secret
```

### .env Keys

```env
APP_NAME=KHWWC
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=khwwc
DB_USERNAME=root
DB_PASSWORD=

JWT_SECRET=<generated>
JWT_TTL=1440
JWT_REFRESH_TTL=10080

# M-Pesa Daraja Sandbox
MPESA_ENV=sandbox
MPESA_CONSUMER_KEY=
MPESA_CONSUMER_SECRET=
MPESA_SHORTCODE=174379
MPESA_PASSKEY=
MPESA_CALLBACK_URL=http://localhost:8000/api/payments/mpesa-callback

# SMS (Africa's Talking)
AT_USERNAME=sandbox
AT_API_KEY=

# Frontend URL for CORS
FRONTEND_URL=http://localhost:5173
```

### CORS & Sanctum

```php
// config/cors.php
'paths' => ['api/*'],
'allowed_methods' => ['*'],
'allowed_origins' => ['http://localhost:5173', 'https://khwwc.co.ke'],
'allowed_headers' => ['*'],
'supports_credentials' => false,
```

---

## 1. Database Schema — Complete Migration Set

Run these as Laravel migrations. All tables use UUID primary keys (`char(36)`).
Use `$table->uuid('id')->primary()` in Laravel migration syntax.

### 1.1 users

```php
Schema::create('users', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->string('phone', 20)->unique();
    $table->string('email')->unique();
    $table->string('name');
    $table->string('password');
    $table->enum('role', ['member','admin','treasurer','secretary',
        'vice-secretary','chairperson','office','super-admin'])->default('member');
    $table->string('avatar_url', 500)->nullable();
    $table->boolean('must_change_password')->default(false);
    $table->enum('status', ['active','inactive','suspended'])->default('active');
    $table->timestamp('last_login_at')->nullable();
    $table->timestamps();
    $table->index('phone');
    $table->index('email');
    $table->index('role');
});
```

### 1.2 members

```php
Schema::create('members', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->uuid('user_id');
    $table->string('member_number', 50)->unique();
    $table->string('national_id', 50)->nullable();
    $table->string('phone', 20);
    $table->string('email')->nullable();
    $table->date('date_of_birth')->nullable();
    $table->enum('gender', ['male','female','other'])->nullable();
    $table->string('occupation', 255)->nullable();
    $table->string('workplace', 255)->nullable();
    $table->string('county', 100)->nullable();
    $table->date('joined_date');
    $table->enum('status', ['active','inactive','suspended'])->default('active');
    $table->decimal('contributions_total', 12, 2)->default(0);
    $table->decimal('penalties_total', 12, 2)->default(0);
    $table->decimal('donations_total', 12, 2)->default(0);
    $table->string('avatar_url', 500)->nullable();
    $table->timestamps();
    $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
    $table->index('user_id');
    $table->index('member_number');
    $table->index('status');
    $table->index('county');
});
```

### 1.3 beneficiaries

```php
Schema::create('beneficiaries', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->uuid('member_id');
    $table->string('name');
    $table->string('relationship', 100);
    $table->string('phone', 20)->nullable();
    $table->string('email')->nullable();
    $table->string('id_number', 50)->nullable();
    $table->date('date_of_birth')->nullable();
    $table->decimal('percentage', 5, 2)->default(0);
    $table->timestamps();
    $table->foreign('member_id')->references('id')->on('members')->onDelete('cascade');
    $table->index('member_id');
});
```

### 1.4 contributions

```php
Schema::create('contributions', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->uuid('member_id');
    $table->decimal('amount', 12, 2);
    $table->string('type', 50)->default('monthly');
    $table->enum('status', ['pending','confirmed','failed'])->default('pending');
    $table->string('method', 50)->default('mpesa');
    $table->string('reference', 100)->unique();
    $table->string('period', 20);
    $table->string('mpesa_txn_id', 100)->nullable();
    $table->uuid('bank_txn_id')->nullable();
    $table->timestamp('matched_at')->nullable();
    $table->uuid('matched_by')->nullable();
    $table->timestamp('adjusted_at')->nullable();
    $table->uuid('adjusted_by')->nullable();
    $table->string('adjustment_reason', 500)->nullable();
    $table->timestamps();
    $table->foreign('member_id')->references('id')->on('members')->onDelete('cascade');
    $table->index('member_id');
    $table->index('status');
    $table->index('period');
    $table->index('reference');
    $table->index('created_at');
});
```

### 1.5 wallets & wallet_transactions

```php
Schema::create('wallets', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->enum('type', ['operational','contributions','penalty','donation'])->unique();
    $table->decimal('balance', 14, 2)->default(0);
    $table->timestamps();
});

Schema::create('wallet_transactions', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->uuid('wallet_id');
    $table->enum('wallet_type', ['operational','contributions','penalty','donation']);
    $table->enum('type', ['credit','debit']);
    $table->decimal('amount', 12, 2);
    $table->text('description')->nullable();
    $table->string('reference', 100);
    $table->decimal('balance_after', 14, 2);
    $table->string('status', 50)->default('completed');
    $table->uuid('related_txn_id')->nullable();
    $table->uuid('created_by')->nullable();
    $table->timestamp('created_at')->useCurrent();
    $table->foreign('wallet_id')->references('id')->on('wallets');
    $table->index('wallet_id');
    $table->index('type');
    $table->index('created_at');
});
```

### 1.6 penalties

```php
Schema::create('penalties', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->uuid('member_id');
    $table->decimal('amount', 12, 2);
    $table->string('reason', 500);
    $table->enum('status', ['unpaid','paid','waived'])->default('unpaid');
    $table->date('paid_date')->nullable();
    $table->string('mpesa_reference', 100)->nullable();
    $table->uuid('waived_by')->nullable();
    $table->timestamps();
    $table->foreign('member_id')->references('id')->on('members')->onDelete('cascade');
    $table->index('member_id');
    $table->index('status');
});
```

### 1.7 donation_campaigns & donations

```php
Schema::create('donation_campaigns', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->string('title');
    $table->text('description')->nullable();
    $table->decimal('target_amount', 12, 2)->default(0);
    $table->decimal('raised_amount', 12, 2)->default(0);
    $table->integer('contributors')->default(0);
    $table->enum('status', ['active','completed','paused'])->default('active');
    $table->date('start_date');
    $table->date('end_date')->nullable();
    $table->string('image_url', 500)->nullable();
    $table->timestamps();
    $table->index('status');
});

Schema::create('donations', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->uuid('member_id')->nullable();
    $table->string('member_name');
    $table->uuid('campaign_id');
    $table->decimal('amount', 12, 2);
    $table->string('method', 50)->default('mpesa');
    $table->string('reference', 100)->unique();
    $table->enum('status', ['pending','confirmed','failed'])->default('pending');
    $table->timestamps();
    $table->foreign('member_id')->references('id')->on('members')->onDelete('set null');
    $table->foreign('campaign_id')->references('id')->on('donation_campaigns')->onDelete('cascade');
    $table->index('member_id');
    $table->index('campaign_id');
    $table->index('status');
});
```

### 1.8 withdrawal_requests

```php
Schema::create('withdrawal_requests', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->uuid('member_id');
    $table->string('member_name');
    $table->decimal('amount', 12, 2);
    $table->text('reason');
    $table->enum('status', ['pending','approved','rejected','paid'])->default('pending');
    $table->timestamp('requested_date')->useCurrent();
    $table->timestamp('approved_date')->nullable();
    $table->uuid('approved_by')->nullable();
    $table->text('approval_note')->nullable();
    $table->timestamp('paid_at')->nullable();
    $table->timestamps();
    $table->foreign('member_id')->references('id')->on('members')->onDelete('cascade');
    $table->index('member_id');
    $table->index('status');
});
```

### 1.9 bank_transactions, import_batches, import_batch_rows

```php
Schema::create('bank_transactions', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->date('trans_date');
    $table->date('value_date')->nullable();
    $table->text('description')->nullable();
    $table->string('reference_no', 100)->nullable();
    $table->decimal('credit', 12, 2)->default(0);
    $table->decimal('debit', 12, 2)->default(0);
    $table->decimal('book_balance', 14, 2)->default(0);
    $table->boolean('matched')->default(false);
    $table->uuid('matched_contribution_id')->nullable();
    $table->uuid('import_batch_id')->nullable();
    $table->timestamps();
    $table->foreign('matched_contribution_id')->references('id')->on('contributions')->onDelete('set null');
    $table->index('trans_date');
    $table->index('matched');
    $table->index('reference_no');
});

Schema::create('import_batches', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->string('source_name', 255)->nullable();
    $table->string('file_name', 255)->nullable();
    $table->integer('new_members')->default(0);
    $table->integer('matched_members')->default(0);
    $table->integer('contributions_created')->default(0);
    $table->integer('contributions_updated')->default(0);
    $table->integer('duplicates')->default(0);
    $table->integer('unmatched')->default(0);
    $table->integer('invalid_phone')->default(0);
    $table->integer('imported')->default(0);
    $table->decimal('total_amount', 14, 2)->default(0);
    $table->enum('status', ['processing','completed','failed'])->default('processing');
    $table->uuid('created_by')->nullable();
    $table->timestamps();
    $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
});

Schema::create('import_batch_rows', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->uuid('batch_id');
    $table->integer('row_number');
    $table->date('trans_date')->nullable();
    $table->string('reference_no', 100)->nullable();
    $table->decimal('credit', 12, 2)->default(0);
    $table->decimal('debit', 12, 2)->default(0);
    $table->uuid('matched_member_id')->nullable();
    $table->uuid('contribution_id')->nullable();
    $table->enum('match_status', ['matched','duplicate','unmatched','invalid_phone'])->default('unmatched');
    $table->string('failure_reason', 500)->nullable();
    $table->foreign('batch_id')->references('id')->on('import_batches')->onDelete('cascade');
    $table->foreign('matched_member_id')->references('id')->on('members')->onDelete('set null');
    $table->index('batch_id');
    $table->index('match_status');
});
```

### 1.10 expenses, payouts, payout_signatories

```php
Schema::create('expenses', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->string('description', 500);
    $table->decimal('amount', 12, 2);
    $table->string('category', 100);
    $table->date('date');
    $table->enum('status', ['pending','approved','paid','rejected'])->default('pending');
    $table->uuid('approved_by')->nullable();
    $table->string('receipt_url', 500)->nullable();
    $table->uuid('created_by')->nullable();
    $table->timestamps();
    $table->index('status');
    $table->index('date');
});

Schema::create('payouts', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->string('reference', 100)->unique();
    $table->uuid('member_id');
    $table->string('member_name');
    $table->string('member_number', 50);
    $table->string('phone', 20);
    $table->enum('payout_type', ['wedding','death_member','death_spouse',
        'death_child','death_parent','retirement','emergency','medical']);
    $table->string('relation', 100)->nullable();
    $table->decimal('amount', 12, 2);
    $table->text('reason')->nullable();
    $table->enum('wallet_type', ['operational','donation','penalty']);
    $table->enum('status', ['pending','approved','paid','rejected'])->default('pending');
    $table->uuid('created_by')->nullable();
    $table->timestamp('paid_at')->nullable();
    $table->timestamps();
    $table->foreign('member_id')->references('id')->on('members')->onDelete('cascade');
    $table->index('member_id');
    $table->index('status');
    $table->index('payout_type');
});

Schema::create('payout_signatories', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->uuid('payout_id');
    $table->string('role', 50);
    $table->uuid('user_id')->nullable();
    $table->string('status', 50)->default('pending');
    $table->timestamp('signed_at')->nullable();
    $table->foreign('payout_id')->references('id')->on('payouts')->onDelete('cascade');
    $table->index('payout_id');
});
```

### 1.11 memos, memo_templates

```php
Schema::create('memo_templates', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->string('name');
    $table->string('subject', 500);
    $table->text('body');
    $table->timestamps();
});

Schema::create('memos', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->string('title');
    $table->string('subject', 500);
    $table->text('body');
    $table->enum('status', ['draft','sent'])->default('draft');
    $table->uuid('prepared_by');
    $table->integer('recipients_count')->default(0);
    $table->uuid('template_id')->nullable();
    $table->timestamp('sent_at')->nullable();
    $table->timestamps();
    $table->foreign('prepared_by')->references('id')->on('users')->onDelete('cascade');
    $table->foreign('template_id')->references('id')->on('memo_templates')->onDelete('set null');
    $table->index('status');
});
```

### 1.12 notifications

```php
Schema::create('notifications', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->uuid('user_id');
    $table->string('title');
    $table->text('message');
    $table->enum('type', ['info','success','warning','error'])->default('info');
    $table->timestamp('read_at')->nullable();
    $table->timestamps();
    $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
    $table->index('user_id');
    $table->index('read_at');
});
```

### 1.13 document_types, documents

```php
Schema::create('document_types', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->string('code', 50)->unique();
    $table->string('name');
    $table->boolean('allowed_member_upload')->default(true);
    $table->boolean('requires_expiry')->default(false);
    $table->timestamp('created_at')->useCurrent();
});

Schema::create('documents', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->uuid('member_id');
    $table->string('document_type_code', 50);
    $table->string('file_url', 500);
    $table->string('file_size', 50)->nullable();
    $table->enum('status', ['pending','approved','rejected','expired'])->default('pending');
    $table->text('notes')->nullable();
    $table->text('rejection_reason')->nullable();
    $table->date('expires_at')->nullable();
    $table->uuid('uploaded_by')->nullable();
    $table->uuid('approved_by')->nullable();
    $table->timestamps();
    $table->foreign('member_id')->references('id')->on('members')->onDelete('cascade');
    $table->index('member_id');
    $table->index('status');
    $table->index('document_type_code');
});
```

### 1.14 events, news_articles

```php
Schema::create('events', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->string('title');
    $table->text('description')->nullable();
    $table->timestamp('date');
    $table->timestamp('end_date')->nullable();
    $table->string('location', 255)->nullable();
    $table->enum('status', ['upcoming','ongoing','past','cancelled'])->default('upcoming');
    $table->integer('attendees_count')->default(0);
    $table->string('image_url', 500)->nullable();
    $table->timestamps();
    $table->index('date');
    $table->index('status');
});

Schema::create('news_articles', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->string('title');
    $table->string('slug')->unique();
    $table->text('excerpt')->nullable();
    $table->longText('content');
    $table->string('category', 100)->nullable();
    $table->enum('status', ['published','draft','archived'])->default('draft');
    $table->string('author', 255)->nullable();
    $table->string('image_url', 500)->nullable();
    $table->boolean('featured')->default(false);
    $table->timestamp('published_at')->nullable();
    $table->timestamps();
    $table->index('slug');
    $table->index('status');
    $table->index('category');
});
```

### 1.15 website_content, website_settings, leadership_people, contact_messages, email_templates, media_assets, organization_settings

```php
Schema::create('website_content', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->string('type', 50);
    $table->string('title');
    $table->string('slug');
    $table->longText('content')->nullable();
    $table->text('excerpt')->nullable();
    $table->string('category', 100)->nullable();
    $table->string('image_url', 500)->nullable();
    $table->enum('status', ['published','draft','archived'])->default('draft');
    $table->uuid('author_id')->nullable();
    $table->timestamp('published_at')->nullable();
    $table->timestamps();
    $table->index('type');
    $table->index('slug');
    $table->index('status');
});

Schema::create('website_settings', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->string('section', 100);
    $table->string('key_name', 255);
    $table->longText('value')->nullable();
    $table->unique(['section', 'key_name']);
});

Schema::create('leadership_people', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->string('name');
    $table->string('slug')->unique();
    $table->string('title', 255)->nullable();
    $table->string('position', 255)->nullable();
    $table->text('bio')->nullable();
    $table->string('photo_url', 500)->nullable();
    $table->string('email', 255)->nullable();
    $table->string('phone', 20)->nullable();
    $table->integer('display_order')->default(0);
    $table->uuid('member_id')->nullable();
    $table->timestamps();
    $table->foreign('member_id')->references('id')->on('members')->onDelete('set null');
    $table->index('display_order');
});

Schema::create('contact_messages', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->string('name');
    $table->string('email');
    $table->string('subject', 500);
    $table->text('message');
    $table->timestamp('read_at')->nullable();
    $table->timestamps();
    $table->index('read_at');
});

Schema::create('email_templates', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->string('name');
    $table->string('subject', 500);
    $table->longText('body');
    $table->json('variables')->nullable();
    $table->timestamps();
});

Schema::create('media_assets', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->string('name');
    $table->string('filename', 500);
    $table->string('url', 500);
    $table->string('type', 100)->nullable();
    $table->string('size', 50)->nullable();
    $table->uuid('uploaded_by')->nullable();
    $table->timestamps();
    $table->foreign('uploaded_by')->references('id')->on('users')->onDelete('set null');
});

Schema::create('organization_settings', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->string('organization_name');
    $table->string('tagline', 500)->nullable();
    $table->string('email', 255)->nullable();
    $table->string('phone', 50)->nullable();
    $table->string('address', 500)->nullable();
    $table->string('logo_url', 500)->nullable();
    $table->string('signature_url', 500)->nullable();
    $table->string('stamp_url', 500)->nullable();
    $table->decimal('payout_bereavement', 12, 2)->default(0);
    $table->decimal('payout_medical', 12, 2)->default(0);
    $table->decimal('payout_education', 12, 2)->default(0);
    $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();
});
```

### 1.16 meeting_minutes, minute_attendance, scheduled_meetings, signatures

```php
Schema::create('meeting_minutes', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->string('title');
    $table->date('meeting_date');
    $table->enum('meeting_type', ['general','executive'])->default('general');
    $table->text('agenda')->nullable();
    $table->text('discussions')->nullable();
    $table->text('decisions')->nullable();
    $table->text('action_items')->nullable();
    $table->date('next_meeting_date')->nullable();
    $table->enum('status', ['draft','submitted_to_secretary','pending_chairperson_approval',
        'rejected_by_secretary','approved','rejected'])->default('draft');
    $table->uuid('prepared_by');
    $table->uuid('reviewed_by')->nullable();
    $table->uuid('approved_by')->nullable();
    $table->text('rejection_notes')->nullable();
    $table->text('content')->nullable();
    $table->integer('attendees_count')->default(0);
    $table->string('file_url', 500)->nullable();
    $table->json('visible_to_members')->nullable();
    $table->timestamps();
    $table->foreign('prepared_by')->references('id')->on('users')->onDelete('cascade');
    $table->index('status');
    $table->index('meeting_date');
});

Schema::create('minute_attendance', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->uuid('minute_id');
    $table->uuid('member_id');
    $table->enum('status', ['PRESENT','ABSENT_WITH_APOLOGY','ABSENT']);
    $table->foreign('minute_id')->references('id')->on('meeting_minutes')->onDelete('cascade');
    $table->foreign('member_id')->references('id')->on('members')->onDelete('cascade');
    $table->index('minute_id');
});

Schema::create('scheduled_meetings', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->string('title');
    $table->date('date');
    $table->time('time');
    $table->string('location', 255)->nullable();
    $table->string('type', 100)->nullable();
    $table->json('agenda')->nullable();
    $table->integer('attendees_count')->default(0);
    $table->enum('status', ['scheduled','completed','cancelled'])->default('scheduled');
    $table->uuid('created_by')->nullable();
    $table->timestamps();
    $table->index('date');
    $table->index('status');
});

Schema::create('signatures', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->enum('role', ['secretary','chairperson']);
    $table->string('file_url', 500);
    $table->string('file_name', 255)->nullable();
    $table->uuid('uploaded_by')->nullable();
    $table->timestamp('uploaded_at')->useCurrent();
    $table->index('role');
});
```

### 1.17 audit_logs, login_activity, access_roles, registration_applicants

```php
Schema::create('audit_logs', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->uuid('user_id')->nullable();
    $table->string('user_name', 255)->nullable();
    $table->string('action', 255);
    $table->string('module', 100);
    $table->string('ip_address', 45)->nullable();
    $table->text('details')->nullable();
    $table->timestamp('created_at')->useCurrent();
    $table->index('user_id');
    $table->index('module');
    $table->index('created_at');
});

Schema::create('login_activity', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->uuid('user_id')->nullable();
    $table->string('user_name', 255)->nullable();
    $table->string('email', 255)->nullable();
    $table->string('ip_address', 45)->nullable();
    $table->string('device', 255)->nullable();
    $table->enum('status', ['success','failed']);
    $table->timestamp('created_at')->useCurrent();
    $table->index('user_id');
    $table->index('created_at');
});

Schema::create('access_roles', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->string('name', 100)->unique();
    $table->text('description')->nullable();
    $table->json('permissions');
    $table->timestamps();
});

Schema::create('registration_applicants', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->string('name');
    $table->string('email');
    $table->string('phone', 20);
    $table->string('county', 100)->nullable();
    $table->string('workplace', 255)->nullable();
    $table->enum('status', ['pending','approved','rejected'])->default('pending');
    $table->timestamps();
    $table->index('status');
});
```

### 1.18 mpesa_transactions

```php
Schema::create('mpesa_transactions', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->string('checkout_request_id', 100)->unique();
    $table->string('merchant_request_id', 100)->nullable();
    $table->string('phone', 20);
    $table->decimal('amount', 12, 2);
    $table->string('account_ref', 100)->nullable();
    $table->string('transaction_desc', 255)->nullable();
    $table->uuid('member_id')->nullable();
    $table->string('payment_type', 50);
    $table->json('penalty_ids')->nullable();
    $table->uuid('campaign_id')->nullable();
    $table->enum('status', ['pending','completed','failed'])->default('pending');
    $table->string('mpesa_receipt_no', 100)->nullable();
    $table->integer('result_code')->nullable();
    $table->string('result_desc', 500)->nullable();
    $table->boolean('callback_received')->default(false);
    $table->timestamps();
    $table->foreign('member_id')->references('id')->on('members')->onDelete('set null');
    $table->index('checkout_request_id');
    $table->index('status');
    $table->index('member_id');
});
```

---

## 2. Seeders

```php
// database/seeders/DatabaseSeeder.php

// 1. Default wallets
Wallet::insert([
    ['type' => 'operational', 'balance' => 0],
    ['type' => 'contributions', 'balance' => 0],
    ['type' => 'penalty', 'balance' => 0],
    ['type' => 'donation', 'balance' => 0],
]);

// 2. Organization settings
OrganizationSetting::insert([
    'organization_name' => 'Kirinyaga Healthcare Workers Welfare',
    'tagline' => 'Supporting healthcare workers',
    'email' => 'info@khwwc.co.ke',
    'phone' => '+254700100200',
    'address' => 'Kerugoya, Kirinyaga County',
    'payout_bereavement' => 50000,
    'payout_medical' => 30000,
    'payout_education' => 20000,
]);

// 3. Access roles with permissions
AccessRole::insert([
    ['name' => 'member', 'description' => 'Standard member',
     'permissions' => json_encode(['member.dashboard','member.profile','member.contributions',
       'member.beneficiaries','member.documents','member.notifications','member.events',
       'member.news','member.penalties','member.donations','member.withdrawals',
       'member.downloads','member.payments'])],
    ['name' => 'admin', 'description' => 'Administrator',
     'permissions' => json_encode(['admin.*','member.*'])],
    ['name' => 'treasurer', 'description' => 'Treasurer',
     'permissions' => json_encode(['treasurer.*','member.*'])],
    ['name' => 'secretary', 'description' => 'Secretary',
     'permissions' => json_encode(['secretary.*','minutes.*','signatures.*'])],
    ['name' => 'vice-secretary', 'description' => 'Vice Secretary',
     'permissions' => json_encode(['vice-secretary.*','minutes.*'])],
    ['name' => 'chairperson', 'description' => 'Chairperson',
     'permissions' => json_encode(['chairperson.*','minutes.approve','minutes.reject','signatures.*'])],
    ['name' => 'office', 'description' => 'Office Staff',
     'permissions' => json_encode(['office.*'])],
    ['name' => 'super-admin', 'description' => 'Super Administrator',
     'permissions' => json_encode(['*'])],
]);

// 4. Document types
DocumentType::insert([
    ['code' => 'national_id', 'name' => 'National ID Card', 'allowed_member_upload' => true, 'requires_expiry' => false],
    ['code' => 'passport', 'name' => 'Passport', 'allowed_member_upload' => true, 'requires_expiry' => true],
    ['code' => 'nhif', 'name' => 'NHIF Card', 'allowed_member_upload' => true, 'requires_expiry' => true],
    ['code' => 'kra_pin', 'name' => 'KRA PIN Certificate', 'allowed_member_upload' => true, 'requires_expiry' => false],
    ['code' => 'employment_letter', 'name' => 'Employment Letter', 'allowed_member_upload' => true, 'requires_expiry' => false],
]);

// 5. Test users (password: 'password' for all)
// Phone-based: 254700000001=member, 002=admin, 003=treasurer, 004=secretary,
//   005=vice-secretary, 006=chairperson, 007=office, 008=super-admin
User::insert([
    ['phone' => '254700000001', 'email' => '254700000001@khwwc.local', 'name' => 'John Kamau',
     'password' => Hash::make('password'), 'role' => 'member'],
    ['phone' => '254700000002', 'email' => '254700000002@khwwc.local', 'name' => 'Admin User',
     'password' => Hash::make('password'), 'role' => 'admin'],
    ['phone' => '254700000003', 'email' => '254700000003@khwwc.local', 'name' => 'Treasurer User',
     'password' => Hash::make('password'), 'role' => 'treasurer'],
    ['phone' => '254700000004', 'email' => '254700000004@khwwc.local', 'name' => 'Secretary User',
     'password' => Hash::make('password'), 'role' => 'secretary'],
    ['phone' => '254700000005', 'email' => '254700000005@khwwc.local', 'name' => 'Vice Secretary',
     'password' => Hash::make('password'), 'role' => 'vice-secretary'],
    ['phone' => '254700000006', 'email' => '254700000006@khwwc.local', 'name' => 'Chairperson',
     'password' => Hash::make('password'), 'role' => 'chairperson'],
    ['phone' => '254700000007', 'email' => '254700000007@khwwc.local', 'name' => 'Office Staff',
     'password' => Hash::make('password'), 'role' => 'office'],
    ['phone' => '254700000008', 'email' => '254700000008@khwwc.local', 'name' => 'Super Admin',
     'password' => Hash::make('password'), 'role' => 'super-admin'],
]);
```

---

## 3. Complete Route Registry (routes/api.php)

```php
<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PublicWebsiteController;
use App\Http\Controllers\Api\MemberController;
use App\Http\Controllers\Api\DocumentController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\TreasurerController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\WebsiteController;
use App\Http\Controllers\Api\SecretaryController;
use App\Http\Controllers\Api\ViceSecretaryController;
use App\Http\Controllers\Api\ChairpersonController;
use App\Http\Controllers\Api\OfficeController;
use App\Http\Controllers\Api\MinutesController;
use App\Http\Controllers\Api\SignatureController;
use App\Http\Controllers\Api\SuperAdminController;

// ─── Public (no auth) ───────────────────────────────────────────
Route::prefix('auth')->group(function () {
    Route::post('login', [AuthController::class, 'login']);
});

Route::prefix('public/website')->group(function () {
    Route::get('settings', [PublicWebsiteController::class, 'getSettings']);
    Route::get('content/{type}', [PublicWebsiteController::class, 'getContent']);
    Route::get('content/{type}/{slug}', [PublicWebsiteController::class, 'getContentDetail']);
    Route::get('leadership', [PublicWebsiteController::class, 'getLeadership']);
    Route::get('people/{slug}', [PublicWebsiteController::class, 'getPerson']);
    Route::post('contact', [PublicWebsiteController::class, 'submitContact']);
});

// ─── Authenticated ──────────────────────────────────────────────
Route::middleware(['auth:api'])->group(function () {

    // Auth
    Route::prefix('auth')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('me', [AuthController::class, 'me']);
        Route::post('password', [AuthController::class, 'changePassword']);
        Route::post('force-password-change', [AuthController::class, 'forcePasswordChange']);
        Route::post('v1/password', [AuthController::class, 'memberChangePassword']);
    });

    // Member (role: member)
    Route::prefix('member')->middleware('role:member')->group(function () {
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
        Route::get('executive/{roleName}', [MemberController::class, 'getExecutiveDashboard']);
        Route::get('downloads/statement', [MemberController::class, 'downloadStatement']);
        Route::get('downloads/receipt/{id}', [MemberController::class, 'downloadReceipt']);
    });

    // Documents (shared, member-accessible)
    Route::prefix('documents')->group(function () {
        Route::get('me/summary', [DocumentController::class, 'getSummary']);
        Route::get('types', [DocumentController::class, 'getTypes']);
        Route::post('/', [DocumentController::class, 'upload']);
        Route::post('{id}/replace', [DocumentController::class, 'replace']);
        Route::delete('{id}', [DocumentController::class, 'delete']);
    });

    // Payments (shared, member-accessible)
    Route::prefix('payments')->group(function () {
        Route::post('stk-push', [PaymentController::class, 'stkPush']);
        Route::get('status/{checkoutRequestId}', [PaymentController::class, 'paymentStatus']);
        Route::post('mpesa-callback', [PaymentController::class, 'mpesaCallback'])
            ->withoutMiddleware(['auth:api']);
    });

    // Treasurer (role: treasurer|admin)
    Route::prefix('treasurer')->middleware('role:treasurer,admin')->group(function () {
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
        Route::get('book-balance', [TreasurerController::class, 'getBookBalance']);
        Route::post('bank-statement-import', [TreasurerController::class, 'importBankStatement']);
        Route::post('book-balance-import', [TreasurerController::class, 'importBookBalance']);
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
        Route::get('settings', [TreasurerController::class, 'getSettings']);
        Route::patch('settings', [TreasurerController::class, 'updateSettings']);
        Route::get('payouts', [TreasurerController::class, 'getPayouts']);
        Route::post('payouts', [TreasurerController::class, 'createPayout']);
        Route::get('payouts/eligible', [TreasurerController::class, 'getEligibleMembers']);
    });

    // Admin (role: admin|super-admin)
    Route::prefix('admin')->middleware('role:admin,super-admin')->group(function () {
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
        Route::get('news', [AdminController::class, 'getNews']);
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

        // Website CMS (under admin)
        Route::prefix('website')->group(function () {
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
    });

    // Secretary (role: secretary)
    Route::prefix('secretary')->middleware('role:secretary')->group(function () {
        Route::get('dashboard', [SecretaryController::class, 'dashboard']);
        Route::get('minutes-review', [SecretaryController::class, 'getMinutesReview']);
        Route::post('minutes/{id}/submit-review', [SecretaryController::class, 'submitForReview']);
        Route::post('minutes/{id}/review', [SecretaryController::class, 'secretaryReview']);
        Route::get('meeting-minutes', [SecretaryController::class, 'getMeetingMinutes']);
        Route::post('meeting-minutes', [SecretaryController::class, 'createMinutes']);
        Route::put('meeting-minutes/{id}', [SecretaryController::class, 'updateMinutes']);
        Route::delete('meeting-minutes/{id}', [SecretaryController::class, 'deleteMinutes']);
        Route::get('meeting-scheduling', [SecretaryController::class, 'getSchedule']);
        Route::post('meeting-scheduling', [SecretaryController::class, 'createMeeting']);
        Route::post('meeting-scheduling/{id}/cancel', [SecretaryController::class, 'cancelMeeting']);
        Route::get('events', [SecretaryController::class, 'getEvents']);
        Route::get('withdrawals', [SecretaryController::class, 'getWithdrawalApprovals']);
        Route::post('withdrawals/{id}/{action}', [SecretaryController::class, 'approveWithdrawal']);
    });

    // Vice-Secretary (role: vice-secretary)
    Route::prefix('vice-secretary')->middleware('role:vice-secretary')->group(function () {
        Route::get('dashboard', [ViceSecretaryController::class, 'dashboard']);
        Route::get('meeting-minutes', [ViceSecretaryController::class, 'getMeetingMinutes']);
        Route::post('meeting-minutes', [ViceSecretaryController::class, 'createMinutes']);
        Route::put('meeting-minutes/{id}', [ViceSecretaryController::class, 'updateMinutes']);
        Route::post('meeting-minutes/{id}/submit', [ViceSecretaryController::class, 'submitMinutes']);
    });

    // Chairperson (role: chairperson)
    Route::prefix('chairperson')->middleware('role:chairperson')->group(function () {
        Route::get('dashboard', [ChairpersonController::class, 'dashboard']);
        Route::get('approve-minutes', [ChairpersonController::class, 'getPendingApprovals']);
        Route::post('approve-minutes/{id}/{action}', [ChairpersonController::class, 'approveMinutes']);
        Route::get('withdrawals', [ChairpersonController::class, 'getWithdrawalApprovals']);
        Route::post('withdrawals/{id}/{action}', [ChairpersonController::class, 'approveWithdrawal']);
    });

    // Office (role: office)
    Route::prefix('office')->middleware('role:office')->group(function () {
        Route::get('dashboard', [OfficeController::class, 'dashboard']);
    });

    // Minutes (shared, all authenticated)
    Route::prefix('minutes')->group(function () {
        Route::get('/', [MinutesController::class, 'list']);
        Route::get('{id}', [MinutesController::class, 'get']);
        Route::post('/', [MinutesController::class, 'create']);
        Route::put('{id}', [MinutesController::class, 'update']);
        Route::delete('{id}', [MinutesController::class, 'delete']);
        Route::post('{id}/submit', [MinutesController::class, 'submit']);
        Route::post('{id}/secretary-review', [MinutesController::class, 'secretaryReview'])
            ->middleware('role:secretary');
        Route::post('{id}/approve', [MinutesController::class, 'approve'])
            ->middleware('role:chairperson');
        Route::post('{id}/reject', [MinutesController::class, 'reject'])
            ->middleware('role:chairperson');
        Route::get('executive-members', [MinutesController::class, 'getExecutiveMembers']);
    });

    // Signatures (shared, secretary + chairperson)
    Route::prefix('signatures')->middleware('role:secretary,chairperson')->group(function () {
        Route::get('current', [SignatureController::class, 'getCurrent']);
        Route::post('/', [SignatureController::class, 'upload']);
    });

    // Super-Admin (role: super-admin)
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

    // REST alias for minutes member lookup
    Route::get('rest/v1/members', [MemberController::class, 'getMembersForMinutes']);
});
```

---

## 4. Middleware — Role Check

```php
// app/Http/Middleware/CheckRole.php
class CheckRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }
        $allowed = in_array($user->role, $roles);
        if (!$allowed && !in_array('super-admin', $roles)) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }
        return $next($request);
    }
}

// Register in bootstrap/app.php (Laravel 11+) or Kernel (Laravel 10)
// 'role' => \App\Http\Middleware\CheckRole::class
```

---

## 5. Auth Controller — Detailed Contract

### 5.1 POST /auth/login

**Request:**
```json
{ "email": "254700000001@khwwc.local", "password": "password" }
```

> The frontend converts phone to synthetic email `{normalized}@khwwc.local`
> before sending. The backend should accept either phone or email — if the
> value contains `@`, look up by email; otherwise normalize the phone and
> look up by phone.

**Response 200:**
```json
{
  "token": "eyJ...",
  "user": {
    "id": "uuid",
    "name": "John Kamau",
    "email": "254700000001@khwwc.local",
    "role": "member",
    "avatar": null,
    "member_id": "uuid",
    "phone": "254700000001",
    "must_change_password": false
  }
}
```

**Response 401:** `{ "message": "Invalid credentials" }`

### 5.2 POST /auth/logout
Invalidate the JWT. Response: `{ "message": "Logged out" }`

### 5.3 GET /auth/me
Return the AuthUser shape from the current token.

### 5.4 POST /auth/password
```json
{ "current_password": "old", "new_password": "newpass", "new_password_confirmation": "newpass" }
```
Validate: current matches, new min 8 chars, confirmation matches.
Response: `{ "message": "Password changed" }`

### 5.5 POST /auth/force-password-change
```json
{ "new_password": "newpass", "new_password_confirmation": "newpass" }
```
Sets `must_change_password = false`. Response: `{ "message": "Password updated" }`

### 5.6 POST /auth/v1/password (member alt endpoint)
```json
{ "new_password": "newpass" }
```
Response: `{ "message": "Password changed" }`

---

## 6. API Resource Serialization

Every model response must match the TypeScript interface exactly. Use API Resources:

```php
// app/Http/Resources/MemberResource.php
class MemberResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->user->name,
            'email' => $this->email ?? $this->user->email,
            'phone' => $this->phone,
            'member_number' => $this->member_number,
            'role' => $this->user->role,
            'status' => $this->status,
            'joined_date' => $this->joined_date->toDateString(),
            'contributions_total' => (float) $this->contributions_total,
            'penalties_total' => (float) $this->penalties_total,
            'donations_total' => (float) $this->donations_total,
            'avatar' => $this->avatar_url,
            'county' => $this->county,
            'workplace' => $this->workplace,
        ];
    }
}
```

### Paginated responses

```php
// Use Laravel's built-in pagination — it already returns:
// { data: [], current_page, per_page, total, last_page }
return ContributionResource::collection(Contribution::paginate(15));
```

---

## 7. Service Layer — Key Business Logic

### 7.1 AuthService

```php
class AuthService
{
    public function login(string $emailOrPhone, string $password): array
    {
        $user = str_contains($emailOrPhone, '@')
            ? User::where('email', $emailOrPhone)->first()
            : User::where('phone', $emailOrPhone)->first();

        if (!$user || !Hash::check($password, $user->password)) {
            throw new ValidationException('Invalid credentials');
        }
        if ($user->status !== 'active') {
            throw new ValidationException('Account suspended');
        }

        $token = JWTAuth::from($user);
        $user->update(['last_login_at' => now()]);

        LoginActivity::create([
            'user_id' => $user->id,
            'user_name' => $user->name,
            'email' => $user->email,
            'ip_address' => request()->ip(),
            'device' => request()->userAgent(),
            'status' => 'success',
        ]);

        return ['token' => $token, 'user' => $this->formatUser($user)];
    }

    private function formatUser(User $user): array
    {
        $member = $user->member;
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'avatar' => $user->avatar_url,
            'member_id' => $member?->id,
            'phone' => $user->phone,
            'must_change_password' => $user->must_change_password,
        ];
    }
}
```

### 7.2 ContributionAdjustmentService (Financial Safety)

```php
class ContributionAdjustmentService
{
    public function adjust(string $contributionId, float $newAmount, string $reason, User $user): array
    {
        return DB::transaction(function () use ($contributionId, $newAmount, $reason, $user) {
            $contribution = Contribution::lockForUpdate()->findOrFail($contributionId);
            $oldAmount = (float) $contribution->amount;

            $contribution->update([
                'amount' => $newAmount,
                'adjusted_at' => now(),
                'adjusted_by' => $user->id,
                'adjustment_reason' => $reason,
            ]);

            // Recalculate member totals
            $member = Member::lockForUpdate()->find($contribution->member_id);
            $member->update([
                'contributions_total' => $member->contributions_total - $oldAmount + $newAmount,
            ]);

            // Record wallet transaction for the delta
            $delta = $newAmount - $oldAmount;
            if ($delta !== 0.0) {
                $this->recordWalletTransaction('contributions', $delta, "Adjustment: {$reason}", $user);
            }

            AuditLog::create([
                'user_id' => $user->id,
                'user_name' => $user->name,
                'action' => 'contribution_adjusted',
                'module' => 'treasurer',
                'ip_address' => request()->ip(),
                'details' => json_encode([
                    'contribution_id' => $contributionId,
                    'old_amount' => $oldAmount,
                    'new_amount' => $newAmount,
                    'reason' => $reason,
                ]),
            ]);

            return ['message' => 'Contribution adjusted'];
        });
    }
}
```

### 7.3 BankStatementImportService

```php
class BankStatementImportService
{
    public function importBatch(array $rows, ?string $sourceName, ?string $fileName, User $user): array
    {
        return DB::transaction(function () use ($rows, $sourceName, $fileName, $user) {
            $batch = ImportBatch::create([
                'source_name' => $sourceName,
                'file_name' => $fileName,
                'created_by' => $user->id,
                'status' => 'processing',
            ]);

            $stats = ['new_members' => 0, 'matched_members' => 0, 'contributions_created' => 0,
                      'contributions_updated' => 0, 'duplicates' => 0, 'unmatched' => 0,
                      'invalid_phone' => 0, 'imported' => 0, 'amount' => 0, 'failures' => []];

            foreach ($rows as $index => $row) {
                // $row = [trans_date, value_date, details, ref, credit, debit, book_balance]
                $rowNumber = $index + 1;
                $reference = $row[3] ?? null;
                $credit = (float) ($row[4] ?? 0);

                // Duplicate detection by reference
                if ($reference && BankTransaction::where('reference_no', $reference)->exists()) {
                    $stats['duplicates']++;
                    $this->createRow($batch->id, $rowNumber, $row, 'duplicate');
                    continue;
                }

                // Try to match by phone in description
                $member = $this->findMemberByDescription($row[2] ?? '');
                if (!$member) {
                    $stats['unmatched']++;
                    $this->createRow($batch->id, $rowNumber, $row, 'unmatched');
                } else {
                    $stats['matched_members']++;
                    // Create contribution
                    $contribution = Contribution::create([
                        'member_id' => $member->id,
                        'amount' => $credit,
                        'type' => 'monthly',
                        'status' => 'confirmed',
                        'method' => 'bank',
                        'reference' => $reference ?? uniqid('bk_'),
                        'period' => now()->format('Y-m'),
                        'matched_at' => now(),
                    ]);
                    $stats['contributions_created']++;
                    $stats['imported']++;
                    $stats['amount'] += $credit;
                    $this->createRow($batch->id, $rowNumber, $row, 'matched', $member->id, $contribution->id);
                }

                // Create bank transaction record
                BankTransaction::create([
                    'trans_date' => $row[0],
                    'value_date' => $row[1] ?? null,
                    'description' => $row[2] ?? null,
                    'reference_no' => $reference,
                    'credit' => $credit,
                    'debit' => (float) ($row[5] ?? 0),
                    'book_balance' => (float) ($row[6] ?? 0),
                    'matched' => (bool) $member,
                    'matched_contribution_id' => $member ? $contribution->id ?? null : null,
                    'import_batch_id' => $batch->id,
                ]);
            }

            $batch->update(array_merge($stats, ['status' => 'completed']));

            return [
                'batch_id' => $batch->id,
                'new_members' => $stats['new_members'],
                'matched_members' => $stats['matched_members'],
                'contributions_created' => $stats['contributions_created'],
                'contributions_updated' => $stats['contributions_updated'],
                'duplicates' => $stats['duplicates'],
                'unmatched' => $stats['unmatched'],
                'invalid_phone' => $stats['invalid_phone'],
                'imported' => $stats['imported'],
                'amount' => $stats['amount'],
                'failures' => $stats['failures'],
            ];
        });
    }
}
```

### 7.4 MpesaService

```php
class MpesaService
{
    // STK Push — initiate, do NOT mark as successful
    public function stkPush(string $phone, float $amount, string $accountRef,
        string $desc, ?string $memberId, string $paymentType,
        ?array $penaltyIds = null, ?string $campaignId = null): array
    {
        $checkoutRequestId = uniqid('stk_');

        // Save as PENDING — never mark successful until callback
        MpesaTransaction::create([
            'checkout_request_id' => $checkoutRequestId,
            'phone' => $phone,
            'amount' => $amount,
            'account_ref' => $accountRef,
            'transaction_desc' => $desc,
            'member_id' => $memberId,
            'payment_type' => $paymentType,
            'penalty_ids' => $penaltyIds ? json_encode($penaltyIds) : null,
            'campaign_id' => $campaignId,
            'status' => 'pending',
        ]);

        // Call Daraja API (sandbox) — store checkout_request_id from response
        // $response = Http::withToken($this->getAccessToken())->post(...);
        // For development: return without calling real API

        return [
            'checkoutRequestId' => $checkoutRequestId,
            'message' => 'STK push initiated. Enter M-Pesa PIN on your phone.',
        ];
    }

    // Callback — only here do we mark confirmed/failed
    public function handleCallback(array $callback): void
    {
        $checkoutRequestId = $callback['Body']['stkCallback']['CheckoutRequestID'] ?? null;
        $resultCode = $callback['Body']['stkCallback']['ResultCode'] ?? null;

        $txn = MpesaTransaction::where('checkout_request_id', $checkoutRequestId)->first();
        if (!$txn) return;

        if ($resultCode === 0) {
            $txn->update([
                'status' => 'completed',
                'callback_received' => true,
                'result_code' => $resultCode,
            ]);
            $this->processSuccessfulPayment($txn);
        } else {
            $txn->update([
                'status' => 'failed',
                'callback_received' => true,
                'result_code' => $resultCode,
                'result_desc' => $callback['Body']['stkCallback']['ResultDesc'] ?? null,
            ]);
        }
    }

    private function processSuccessfulPayment(MpesaTransaction $txn): void
    {
        DB::transaction(function () use ($txn) {
            // Create contribution or donation or penalty payment
            // Update wallet balance atomically
            // Update member totals
            // Create audit log
        });
    }
}
```

---

## 8. Minutes Workflow State Machine

```
Vice-Secretary creates minutes (status: draft)
    → Vice-Secretary submits (POST /vice-secretary/meeting-minutes/{id}/submit)
    → status: submitted_to_secretary

Secretary reviews (GET /secretary/minutes-review)
    → Approve (POST /secretary/minutes/{id}/review { decision: 'approve' })
        → status: pending_chairperson_approval
    → Reject (POST /secretary/minutes/{id}/review { decision: 'reject', notes: '...' })
        → status: rejected_by_secretary

Chairperson reviews (GET /chairperson/approve-minutes)
    → Approve (POST /chairperson/approve-minutes/{id}/approve)
        → status: approved
    → Reject (POST /chairperson/approve-minutes/{id}/reject { notes: '...' })
        → status: rejected
```

### MinutesController — key methods

```php
class MinutesController extends Controller
{
    public function list(Request $request)
    {
        $filter = $request->query('filter', 'mine');
        $query = MeetingMinutes::query();

        switch ($filter) {
            case 'mine':
                $query->where('prepared_by', auth()->id());
                break;
            case 'secretary_pending':
                $query->where('status', 'submitted_to_secretary');
                break;
            case 'pending':
                $query->whereIn('status', ['submitted_to_secretary', 'pending_chairperson_approval']);
                break;
        }

        return HydratedMinuteResource::collection($query->orderBy('meeting_date', 'desc')->get());
    }

    public function secretaryReview(Request $request, string $id)
    {
        $validated = $request->validate([
            'decision' => 'required|in:approve,reject',
            'notes' => 'nullable|string',
        ]);

        $minute = MeetingMinutes::findOrFail($id);
        abort_if($minute->status !== 'submitted_to_secretary', 422, 'Minutes not pending review');

        $minute->update([
            'status' => $validated['decision'] === 'approve'
                ? 'pending_chairperson_approval'
                : 'rejected_by_secretary',
            'reviewed_by' => auth()->id(),
            'rejection_notes' => $validated['decision'] === 'reject' ? $validated['notes'] : null,
        ]);

        return response()->json(['message' => $validated['decision'] === 'approve'
            ? 'Minutes forwarded to Chairperson' : 'Minutes returned to author']);
    }
}
```

---

## 9. Policies — Server-Side Authorization

```php
// app/Policies/MemberPolicy.php
class MemberPolicy
{
    public function viewSelf(User $user): bool { return true; }

    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['admin', 'super-admin', 'treasurer']);
    }

    public function view(User $user, Member $member): bool
    {
        if ($user->role === 'member') {
            return $user->member?->id === $member->id;
        }
        return in_array($user->role, ['admin', 'super-admin', 'treasurer']);
    }
}

// app/Policies/ContributionPolicy.php
class ContributionPolicy
{
    public function adjust(User $user): bool
    {
        return in_array($user->role, ['treasurer', 'admin', 'super-admin']);
    }

    public function viewOwn(User $user, Contribution $contribution): bool
    {
        return $user->member?->id === $contribution->member_id
            || in_array($user->role, ['admin', 'treasurer', 'super-admin']);
    }
}

// app/Policies/MinutesPolicy.php
class MinutesPolicy
{
    public function create(User $user): bool
    {
        return in_array($user->role, ['secretary', 'vice-secretary', 'super-admin']);
    }

    public function secretaryReview(User $user): bool
    {
        return in_array($user->role, ['secretary', 'super-admin']);
    }

    public function approve(User $user): bool
    {
        return in_array($user->role, ['chairperson', 'super-admin']);
    }
}
```

---

## 10. Form Request Validation Examples

```php
// app/Http/Requests/LoginRequest.php
class LoginRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'email' => 'required|string', // email or phone
            'password' => 'required|string|min:6',
        ];
    }
}

// app/Http/Requests/StoreContributionAdjustmentRequest.php
class StoreContributionAdjustmentRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'amount' => 'required|numeric|min:0',
            'reason' => 'required|string|max:500',
        ];
    }
}

// app/Http/Requests/StoreBeneficiaryRequest.php
class StoreBeneficiaryRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'relationship' => 'required|string|max:100',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email',
            'id_number' => 'nullable|string|max:50',
            'date_of_birth' => 'nullable|date',
            'percentage' => 'required|numeric|min:0|max:100',
        ];
    }
}

// app/Http/Requests/StkPushRequest.php
class StkPushRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'phone' => 'required|string|regex:/^254\d{9}$/',
            'amount' => 'required|numeric|min:1',
            'account_ref' => 'required|string|max:100',
            'member_id' => 'nullable|uuid',
            'paymentType' => 'required|string',
            'transactionDesc' => 'nullable|string|max:255',
            'penaltyIds' => 'nullable|array',
            'campaignId' => 'nullable|uuid',
        ];
    }
}

// app/Http/Requests/CreateMinuteRequest.php
class CreateMinuteRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'meeting_date' => 'required|date',
            'meeting_type' => 'required|in:general,executive',
            'agenda' => 'nullable|string',
            'discussions' => 'nullable|string',
            'decisions' => 'nullable|string',
            'action_items' => 'nullable|string',
            'next_meeting_date' => 'nullable|date',
            'attendance' => 'required|array',
            'attendance.*.member_id' => 'required|uuid',
            'attendance.*.status' => 'required|in:PRESENT,ABSENT_WITH_APOLOGY,ABSENT',
            'visible_to_members' => 'nullable|array',
        ];
    }
}
```

---

## 11. Error Response Contract

```php
// 401 — Unauthenticated
{ "message": "Unauthenticated." }

// 403 — Forbidden
{ "message": "Forbidden." }

// 404 — Not Found
{ "message": "Resource not found" }

// 422 — Validation
{
  "message": "The given data was invalid.",
  "errors": {
    "amount": ["The amount must be a number."],
    "reason": ["The reason field is required."]
  }
}

// 500 — Server Error
{ "message": "An error occurred. Please try again." }
```

---

## 12. Financial Integrity Rules

1. **Never mark a payment successful because STK was initiated.** Only the
   M-Pesa callback can set `status = 'completed'`.

2. **Idempotency:** The `reference` column is UNIQUE on contributions,
   donations, and bank_transactions. Duplicate inserts will fail with a
   constraint violation — catch and return as a 422.

3. **Atomic wallet updates:** All wallet balance changes must use
   `DB::transaction()` with `lockForUpdate()` on the wallet row.

4. **Immutable audit history:** Audit logs are append-only. Never UPDATE or
   DELETE audit_log rows.

5. **Authorized corrections only:** Contribution adjustments require
   `role: treasurer|admin|super-admin` and must record `adjusted_by`,
   `adjusted_at`, and `adjustment_reason`.

6. **Reconciliation:** Bank balance vs book balance difference is computed
   as `SUM(bank_transactions.book_balance) - SUM(wallets.balance)`. Never
   store the reconciliation diff — always derive it.

7. **No live payments in development:** The MpesaService should check
   `config('services.mpesa.env') === 'sandbox'` and only call the Daraja
   sandbox URL.

---

## 13. Test Requirements

Every endpoint needs at minimum:

- A success test (200/201 with correct response shape)
- An auth test (401 without token)
- A role test (403 with wrong role)
- A validation test (422 with invalid input)

For financial endpoints additionally:

- Idempotency test (duplicate reference rejected)
- Transaction rollback test (partial failure doesn't corrupt state)

```php
// tests/Feature/Auth/LoginTest.php
class LoginTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_login_with_email(): void
    {
        $user = User::factory()->create([
            'email' => '254700000001@khwwc.local',
            'password' => Hash::make('password'),
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => '254700000001@khwwc.local',
            'password' => 'password',
        ]);

        $response->assertOk()
            ->assertJsonStructure(['token', 'user' => ['id', 'name', 'email', 'role']]);
    }

    public function test_invalid_credentials_return_401(): void
    {
        $this->postJson('/api/auth/login', [
            'email' => 'wrong@khwwc.local',
            'password' => 'wrong',
        ])->assertUnauthorized();
    }
}
```

---

## 14. Controller-to-Service Mapping

| Controller | Service | Key Methods |
|-----------|---------|-------------|
| AuthController | AuthService | login, logout, me, changePassword |
| MemberController | MemberService | dashboard, getProfile, updateProfile, CRUD beneficiaries |
| DocumentController | DocumentService | upload, replace, delete, getSummary, getTypes |
| PaymentController | MpesaService | stkPush, paymentStatus, mpesaCallback |
| TreasurerController | ContributionService, WalletService, BankImportService, ExpenseService, PayoutService | dashboard, adjustContribution, wallet ops, bank import, expenses, payouts |
| AdminController | AdminService | dashboard, members, defaulters, unmatched, penalties |
| WebsiteController | WebsiteService | content CRUD, people CRUD, contact messages, settings, email templates |
| SecretaryController | MinutesService | dashboard, minutes CRUD, review, scheduling |
| ChairpersonController | MinutesService | dashboard, approve/reject |
| MinutesController | MinutesService | list, get, create, update, delete, submit, review, approve, reject |
| SignatureController | SignatureService | getCurrent, upload |
| SuperAdminController | SystemService | dashboard, audit logs, security, access control, monitoring |

---

## 15. Copilot Execution Checklist

1. [ ] Create Laravel project with `composer create-project`
2. [ ] Install JWT, DOMPDF, PhpSpreadsheet packages
3. [ ] Run `php artisan jwt:secret`
4. [ ] Create all 18 migrations (§1)
5. [ ] Create all models with `$keyType = 'string'`, `incrementing = false`, proper `$fillable`, `$casts`, and relationships
6. [ ] Create all form requests (§10)
7. [ ] Create all API resources (§6)
8. [ ] Create all services (§7)
9. [ ] Create all policies (§9)
10. [ ] Create CheckRole middleware (§4)
11. [ ] Create all controllers with proper method signatures matching routes (§3)
12. [ ] Wire routes/api.php (§3)
13. [ ] Create seeders (§2)
14. [ ] Run `php artisan migrate --seed`
15. [ ] Write feature tests for auth, members, contributions, minutes workflow, bank import
16. [ ] Run `php artisan test`
17. [ ] Verify `php artisan route:list` shows all 170 endpoints
18. [ ] Test login with seeded phone numbers
19. [ ] Test role-based access (member can't access /admin/*, etc.)
20. [ ] Test contribution adjustment creates audit log + wallet transaction
21. [ ] Test bank statement import with duplicate detection
22. [ ] Test minutes workflow: create → submit → secretary review → chairperson approve
23. [ ] Configure CORS for frontend URL
24. [ ] Set `VITE_API_BASE_URL` in frontend `.env` to `http://localhost:8000/api`

---

## 16. Frontend Integration Notes

The frontend API client (`src/api/client.ts`) sends:
- `Authorization: Bearer {token}` header
- `Content-Type: application/json` for most requests
- `Content-Type: multipart/form-data` for file uploads (profile photos, documents, signatures)
- 401 response → clears `sessionStorage['khwwc_jwt_token']` and redirects to `/login`
- 422 response → displays `error.errors[field]` messages on form fields

The frontend stores:
- JWT in `sessionStorage['khwwc_jwt_token']`
- User object in `sessionStorage['khwwc_user']`

The frontend expects paginated responses in the format:
```json
{ "data": [], "current_page": 1, "per_page": 15, "total": 100, "last_page": 7 }
```

This is Laravel's default `paginate()` output shape — no custom transformation needed.
