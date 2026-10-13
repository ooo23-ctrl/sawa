# KHWWC — Database Schema Matrix

**Date:** 2026-10-13  
**Purpose:** Complete MySQL/MariaDB migration blueprint for the Laravel backend

---

## 1. Table Overview

| # | Table | Purpose | Estimated Rows | Sensitive |
|---|-------|---------|----------------|-----------|
| 1 | `users` | Auth + base profile | Hundreds | Yes (passwords) |
| 2 | `members` | Extended member data | Hundreds | Yes (ID numbers) |
| 3 | `beneficiaries` | Member dependents | Thousands | Yes (ID numbers) |
| 4 | `contributions` | Member contributions | Thousands | Yes (financial) |
| 5 | `penalties` | Member penalties | Thousands | Yes (financial) |
| 6 | `donations` | Donation records | Thousands | Yes (financial) |
| 7 | `donation_campaigns` | Campaign management | Dozens | No |
| 8 | `withdrawal_requests` | Withdrawal workflow | Hundreds | Yes (financial) |
| 9 | `wallets` | Wallet type balances | 4-5 rows | Yes (financial) |
| 10 | `wallet_transactions` | Wallet ledger | Tens of thousands | Yes (financial) |
| 11 | `bank_transactions` | Imported bank data | Tens of thousands | Yes (financial) |
| 12 | `expenses` | Expense workflow | Hundreds | Yes (financial) |
| 13 | `payouts` | Member payouts | Hundreds | Yes (financial) |
| 14 | `payout_signatories` | Payout approval signatures | Hundreds | Yes |
| 15 | `memos` | Treasurer memos | Hundreds | No |
| 16 | `memo_templates` | Reusable memo templates | Dozens | No |
| 17 | `notifications` | Member notifications | Thousands | No |
| 18 | `documents` | Uploaded documents | Thousands | Yes (files) |
| 19 | `document_types` | Doc type catalog | ~10 | No |
| 20 | `events` | Calendar events | Dozens | No |
| 21 | `news_articles` | News articles | Hundreds | No |
| 22 | `website_content` | CMS content | Hundreds | No |
| 23 | `website_settings` | Site settings (key-value) | Dozens | No |
| 24 | `leadership_people` | Public leadership directory | ~20 | No |
| 25 | `contact_messages` | Contact form inbox | Hundreds | No |
| 26 | `email_templates` | Email templates | Dozens | No |
| 27 | `media_assets` | Media library | Hundreds | No |
| 28 | `organization_settings` | Org config (single row) | 1 | No |
| 29 | `meeting_minutes` | Minutes with workflow | Hundreds | No |
| 30 | `minute_attendance` | Meeting attendance | Thousands | No |
| 31 | `scheduled_meetings` | Meeting calendar | Dozens | No |
| 32 | `signatures` | Role-based signatures | ~3 | No |
| 33 | `audit_logs` | Audit trail | Tens of thousands | No |
| 34 | `login_activity` | Login records | Thousands | No |
| 35 | `access_roles` | Role permissions config | 8 | No |
| 36 | `registration_applicants` | Membership applications | Dozens | Yes (PII) |
| 37 | `import_batches` | Bank statement import batches | Hundreds | No |
| 38 | `import_batch_rows` | Individual import rows | Tens of thousands | No |
| 39 | `mpesa_transactions` | M-Pesa STK push records | Thousands | Yes (financial) |

---

## 2. Migration Blueprint

### Migration 0001: Create Users Table

```sql
CREATE TABLE users (
    id              CHAR(36) PRIMARY KEY,
    phone           VARCHAR(20) UNIQUE NOT NULL,
    email           VARCHAR(255) UNIQUE NOT NULL,
    name            VARCHAR(255) NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    role            ENUM('member','admin','treasurer','secretary','vice-secretary','chairperson','office','super-admin') NOT NULL DEFAULT 'member',
    avatar_url      VARCHAR(500) NULL,
    must_change_password BOOLEAN NOT NULL DEFAULT FALSE,
    status          ENUM('active','inactive','suspended') NOT NULL DEFAULT 'active',
    last_login_at   TIMESTAMP NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_phone (phone),
    INDEX idx_users_email (email),
    INDEX idx_users_role (role)
);
```

### Migration 0002: Create Members Table

```sql
CREATE TABLE members (
    id                  CHAR(36) PRIMARY KEY,
    user_id             CHAR(36) NOT NULL,
    member_number       VARCHAR(50) UNIQUE NOT NULL,
    national_id         VARCHAR(50) NULL,
    phone               VARCHAR(20) NOT NULL,
    email               VARCHAR(255) NULL,
    date_of_birth       DATE NULL,
    gender              ENUM('male','female','other') NULL,
    occupation          VARCHAR(255) NULL,
    workplace           VARCHAR(255) NULL,
    county              VARCHAR(100) NULL,
    joined_date         DATE NOT NULL,
    status              ENUM('active','inactive','suspended') NOT NULL DEFAULT 'active',
    contributions_total DECIMAL(12,2) DEFAULT 0.00,
    penalties_total     DECIMAL(12,2) DEFAULT 0.00,
    donations_total     DECIMAL(12,2) DEFAULT 0.00,
    avatar_url          VARCHAR(500) NULL,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_members_user (user_id),
    INDEX idx_members_number (member_number),
    INDEX idx_members_status (status),
    INDEX idx_members_county (county)
);
```

### Migration 0003: Create Beneficiaries Table

```sql
CREATE TABLE beneficiaries (
    id              CHAR(36) PRIMARY KEY,
    member_id       CHAR(36) NOT NULL,
    name            VARCHAR(255) NOT NULL,
    relationship    VARCHAR(100) NOT NULL,
    phone           VARCHAR(20) NULL,
    email           VARCHAR(255) NULL,
    id_number       VARCHAR(50) NULL,
    date_of_birth   DATE NULL,
    percentage      DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
    INDEX idx_benef_member (member_id)
);
```

### Migration 0004: Create Contributions Table

```sql
CREATE TABLE contributions (
    id              CHAR(36) PRIMARY KEY,
    member_id       CHAR(36) NOT NULL,
    amount          DECIMAL(12,2) NOT NULL,
    type            VARCHAR(50) NOT NULL DEFAULT 'monthly',
    status          ENUM('pending','confirmed','failed') NOT NULL DEFAULT 'pending',
    method          VARCHAR(50) NOT NULL DEFAULT 'mpesa',
    reference       VARCHAR(100) UNIQUE NOT NULL,
    period          VARCHAR(20) NOT NULL,
    mpesa_txn_id    VARCHAR(100) NULL,
    bank_txn_id     CHAR(36) NULL,
    matched_at      TIMESTAMP NULL,
    matched_by      CHAR(36) NULL,
    adjusted_at     TIMESTAMP NULL,
    adjusted_by     CHAR(36) NULL,
    adjustment_reason VARCHAR(500) NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
    INDEX idx_contrib_member (member_id),
    INDEX idx_contrib_status (status),
    INDEX idx_contrib_period (period),
    INDEX idx_contrib_reference (reference),
    INDEX idx_contrib_dates (created_at)
);
```

### Migration 0005: Create Wallets & Transactions Tables

```sql
CREATE TABLE wallets (
    id              CHAR(36) PRIMARY KEY,
    type            ENUM('operational','contributions','penalty','donation') UNIQUE NOT NULL,
    balance         DECIMAL(14,2) NOT NULL DEFAULT 0.00,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE wallet_transactions (
    id              CHAR(36) PRIMARY KEY,
    wallet_id       CHAR(36) NOT NULL,
    wallet_type     ENUM('operational','contributions','penalty','donation') NOT NULL,
    type            ENUM('credit','debit') NOT NULL,
    amount          DECIMAL(12,2) NOT NULL,
    description     TEXT NULL,
    reference       VARCHAR(100) NOT NULL,
    balance_after   DECIMAL(14,2) NOT NULL,
    status          VARCHAR(50) NOT NULL DEFAULT 'completed',
    related_txn_id  CHAR(36) NULL,
    created_by      CHAR(36) NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (wallet_id) REFERENCES wallets(id),
    INDEX idx_wt_wallet (wallet_id),
    INDEX idx_wt_type (type),
    INDEX idx_wt_dates (created_at)
);
```

### Migration 0006: Create Penalties Table

```sql
CREATE TABLE penalties (
    id              CHAR(36) PRIMARY KEY,
    member_id       CHAR(36) NOT NULL,
    amount          DECIMAL(12,2) NOT NULL,
    reason          VARCHAR(500) NOT NULL,
    status          ENUM('unpaid','paid','waived') NOT NULL DEFAULT 'unpaid',
    paid_date       DATE NULL,
    mpesa_reference VARCHAR(100) NULL,
    waived_by       CHAR(36) NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
    INDEX idx_pen_member (member_id),
    INDEX idx_pen_status (status)
);
```

### Migration 0007: Create Donations & Campaigns Tables

```sql
CREATE TABLE donation_campaigns (
    id              CHAR(36) PRIMARY KEY,
    title           VARCHAR(255) NOT NULL,
    description     TEXT NULL,
    target_amount   DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    raised_amount   DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    contributors    INT NOT NULL DEFAULT 0,
    status          ENUM('active','completed','paused') NOT NULL DEFAULT 'active',
    start_date      DATE NOT NULL,
    end_date        DATE NULL,
    image_url       VARCHAR(500) NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_dc_status (status)
);

CREATE TABLE donations (
    id              CHAR(36) PRIMARY KEY,
    member_id       CHAR(36) NULL,
    member_name     VARCHAR(255) NOT NULL,
    campaign_id     CHAR(36) NOT NULL,
    amount          DECIMAL(12,2) NOT NULL,
    method          VARCHAR(50) NOT NULL DEFAULT 'mpesa',
    reference       VARCHAR(100) UNIQUE NOT NULL,
    status          ENUM('pending','confirmed','failed') NOT NULL DEFAULT 'pending',
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE SET NULL,
    FOREIGN KEY (campaign_id) REFERENCES donation_campaigns(id) ON DELETE CASCADE,
    INDEX idx_don_member (member_id),
    INDEX idx_don_campaign (campaign_id),
    INDEX idx_don_status (status)
);
```

### Migration 0008: Create Withdrawal Requests Table

```sql
CREATE TABLE withdrawal_requests (
    id              CHAR(36) PRIMARY KEY,
    member_id       CHAR(36) NOT NULL,
    member_name     VARCHAR(255) NOT NULL,
    amount          DECIMAL(12,2) NOT NULL,
    reason          TEXT NOT NULL,
    status          ENUM('pending','approved','rejected','paid') NOT NULL DEFAULT 'pending',
    requested_date  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    approved_date   TIMESTAMP NULL,
    approved_by     CHAR(36) NULL,
    approval_note   TEXT NULL,
    paid_at         TIMESTAMP NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
    INDEX idx_wr_member (member_id),
    INDEX idx_wr_status (status)
);
```

### Migration 0009: Create Bank Transactions & Import Tables

```sql
CREATE TABLE bank_transactions (
    id              CHAR(36) PRIMARY KEY,
    trans_date      DATE NOT NULL,
    value_date      DATE NULL,
    description     TEXT NULL,
    reference_no    VARCHAR(100) NULL,
    credit          DECIMAL(12,2) DEFAULT 0.00,
    debit           DECIMAL(12,2) DEFAULT 0.00,
    book_balance    DECIMAL(14,2) DEFAULT 0.00,
    matched         BOOLEAN NOT NULL DEFAULT FALSE,
    matched_contribution_id CHAR(36) NULL,
    import_batch_id CHAR(36) NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (matched_contribution_id) REFERENCES contributions(id) ON DELETE SET NULL,
    INDEX idx_bt_date (trans_date),
    INDEX idx_bt_matched (matched),
    INDEX idx_bt_ref (reference_no)
);

CREATE TABLE import_batches (
    id              CHAR(36) PRIMARY KEY,
    source_name     VARCHAR(255) NULL,
    file_name       VARCHAR(255) NULL,
    new_members         INT DEFAULT 0,
    matched_members     INT DEFAULT 0,
    contributions_created INT DEFAULT 0,
    contributions_updated INT DEFAULT 0,
    duplicates      INT DEFAULT 0,
    unmatched       INT DEFAULT 0,
    invalid_phone   INT DEFAULT 0,
    imported        INT DEFAULT 0,
    total_amount    DECIMAL(14,2) DEFAULT 0.00,
    status          ENUM('processing','completed','failed') DEFAULT 'processing',
    created_by      CHAR(36) NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE import_batch_rows (
    id              CHAR(36) PRIMARY KEY,
    batch_id        CHAR(36) NOT NULL,
    row_number      INT NOT NULL,
    trans_date      DATE NULL,
    reference_no    VARCHAR(100) NULL,
    credit          DECIMAL(12,2) DEFAULT 0.00,
    debit           DECIMAL(12,2) DEFAULT 0.00,
    matched_member_id CHAR(36) NULL,
    contribution_id CHAR(36) NULL,
    match_status    ENUM('matched','duplicate','unmatched','invalid_phone') NOT NULL DEFAULT 'unmatched',
    failure_reason  VARCHAR(500) NULL,
    FOREIGN KEY (batch_id) REFERENCES import_batches(id) ON DELETE CASCADE,
    FOREIGN KEY (matched_member_id) REFERENCES members(id) ON DELETE SET NULL,
    INDEX idx_ibr_batch (batch_id),
    INDEX idx_ibr_status (match_status)
);
```

### Migration 0010: Create Expenses & Payouts Tables

```sql
CREATE TABLE expenses (
    id              CHAR(36) PRIMARY KEY,
    description     VARCHAR(500) NOT NULL,
    amount          DECIMAL(12,2) NOT NULL,
    category        VARCHAR(100) NOT NULL,
    date            DATE NOT NULL,
    status          ENUM('pending','approved','paid','rejected') NOT NULL DEFAULT 'pending',
    approved_by     CHAR(36) NULL,
    receipt_url     VARCHAR(500) NULL,
    created_by      CHAR(36) NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_exp_status (status),
    INDEX idx_exp_date (date)
);

CREATE TABLE payouts (
    id              CHAR(36) PRIMARY KEY,
    reference       VARCHAR(100) UNIQUE NOT NULL,
    member_id       CHAR(36) NOT NULL,
    member_name     VARCHAR(255) NOT NULL,
    member_number   VARCHAR(50) NOT NULL,
    phone           VARCHAR(20) NOT NULL,
    payout_type     ENUM('wedding','death_member','death_spouse','death_child','death_parent','retirement','emergency','medical') NOT NULL,
    relation        VARCHAR(100) NULL,
    amount          DECIMAL(12,2) NOT NULL,
    reason          TEXT NULL,
    wallet_type     ENUM('operational','donation','penalty') NOT NULL,
    status          ENUM('pending','approved','paid','rejected') NOT NULL DEFAULT 'pending',
    created_by      CHAR(36) NULL,
    paid_at         TIMESTAMP NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
    INDEX idx_pay_member (member_id),
    INDEX idx_pay_status (status),
    INDEX idx_pay_type (payout_type)
);

CREATE TABLE payout_signatories (
    id              CHAR(36) PRIMARY KEY,
    payout_id       CHAR(36) NOT NULL,
    role            VARCHAR(50) NOT NULL,
    user_id         CHAR(36) NULL,
    status          VARCHAR(50) NOT NULL DEFAULT 'pending',
    signed_at       TIMESTAMP NULL,
    FOREIGN KEY (payout_id) REFERENCES payouts(id) ON DELETE CASCADE,
    INDEX idx_ps_payout (payout_id)
);
```

### Migration 0011: Create Memos & Templates Tables

```sql
CREATE TABLE memo_templates (
    id              CHAR(36) PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    subject         VARCHAR(500) NOT NULL,
    body            TEXT NOT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE memos (
    id              CHAR(36) PRIMARY KEY,
    title           VARCHAR(255) NOT NULL,
    subject         VARCHAR(500) NOT NULL,
    body            TEXT NOT NULL,
    status          ENUM('draft','sent') NOT NULL DEFAULT 'draft',
    prepared_by     CHAR(36) NOT NULL,
    recipients_count INT DEFAULT 0,
    template_id     CHAR(36) NULL,
    sent_at         TIMESTAMP NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (prepared_by) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (template_id) REFERENCES memo_templates(id) ON DELETE SET NULL,
    INDEX idx_memo_status (status)
);
```

### Migration 0012: Create Notifications Table

```sql
CREATE TABLE notifications (
    id              CHAR(36) PRIMARY KEY,
    user_id         CHAR(36) NOT NULL,
    title           VARCHAR(255) NOT NULL,
    message         TEXT NOT NULL,
    type            ENUM('info','success','warning','error') NOT NULL DEFAULT 'info',
    read_at         TIMESTAMP NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notif_user (user_id),
    INDEX idx_notif_read (read_at)
);
```

### Migration 0013: Create Documents & Document Types Tables

```sql
CREATE TABLE document_types (
    id                      CHAR(36) PRIMARY KEY,
    code                    VARCHAR(50) UNIQUE NOT NULL,
    name                    VARCHAR(255) NOT NULL,
    allowed_member_upload   BOOLEAN NOT NULL DEFAULT TRUE,
    requires_expiry         BOOLEAN NOT NULL DEFAULT FALSE,
    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE documents (
    id              CHAR(36) PRIMARY KEY,
    member_id       CHAR(36) NOT NULL,
    document_type_code VARCHAR(50) NOT NULL,
    file_url        VARCHAR(500) NOT NULL,
    file_size       VARCHAR(50) NULL,
    status          ENUM('pending','approved','rejected','expired') NOT NULL DEFAULT 'pending',
    notes           TEXT NULL,
    rejection_reason TEXT NULL,
    expires_at      DATE NULL,
    uploaded_by     CHAR(36) NULL,
    approved_by     CHAR(36) NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
    INDEX idx_doc_member (member_id),
    INDEX idx_doc_status (status),
    INDEX idx_doc_type (document_type_code)
);
```

### Migration 0014: Create Events & News Tables

```sql
CREATE TABLE events (
    id              CHAR(36) PRIMARY KEY,
    title           VARCHAR(255) NOT NULL,
    description     TEXT NULL,
    date            TIMESTAMP NOT NULL,
    end_date        TIMESTAMP NULL,
    location        VARCHAR(255) NULL,
    status          ENUM('upcoming','ongoing','past','cancelled') NOT NULL DEFAULT 'upcoming',
    attendees_count INT DEFAULT 0,
    image_url       VARCHAR(500) NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_event_date (date),
    INDEX idx_event_status (status)
);

CREATE TABLE news_articles (
    id              CHAR(36) PRIMARY KEY,
    title           VARCHAR(255) NOT NULL,
    slug            VARCHAR(255) UNIQUE NOT NULL,
    excerpt         TEXT NULL,
    content         LONGTEXT NOT NULL,
    category        VARCHAR(100) NULL,
    status          ENUM('published','draft','archived') NOT NULL DEFAULT 'draft',
    author          VARCHAR(255) NULL,
    image_url       VARCHAR(500) NULL,
    featured        BOOLEAN NOT NULL DEFAULT FALSE,
    published_at    TIMESTAMP NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_news_slug (slug),
    INDEX idx_news_status (status),
    INDEX idx_news_category (category)
);
```

### Migration 0015: Create Website CMS Tables

```sql
CREATE TABLE website_content (
    id              CHAR(36) PRIMARY KEY,
    type            VARCHAR(50) NOT NULL,
    title           VARCHAR(255) NOT NULL,
    slug            VARCHAR(255) NOT NULL,
    content         LONGTEXT NULL,
    excerpt         TEXT NULL,
    category        VARCHAR(100) NULL,
    image_url       VARCHAR(500) NULL,
    status          ENUM('published','draft','archived') NOT NULL DEFAULT 'draft',
    author_id       CHAR(36) NULL,
    published_at    TIMESTAMP NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_wc_type (type),
    INDEX idx_wc_slug (slug),
    INDEX idx_wc_status (status)
);

CREATE TABLE website_settings (
    id              CHAR(36) PRIMARY KEY,
    section         VARCHAR(100) NOT NULL,
    key_name        VARCHAR(255) NOT NULL,
    value           LONGTEXT NULL,
    UNIQUE KEY uk_section_key (section, key_name)
);

CREATE TABLE leadership_people (
    id              CHAR(36) PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    slug            VARCHAR(255) UNIQUE NOT NULL,
    title           VARCHAR(255) NULL,
    position        VARCHAR(255) NULL,
    bio             TEXT NULL,
    photo_url       VARCHAR(500) NULL,
    email           VARCHAR(255) NULL,
    phone           VARCHAR(20) NULL,
    display_order   INT NOT NULL DEFAULT 0,
    member_id       CHAR(36) NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE SET NULL,
    INDEX idx_lp_order (display_order)
);

CREATE TABLE contact_messages (
    id              CHAR(36) PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    email           VARCHAR(255) NOT NULL,
    subject         VARCHAR(500) NOT NULL,
    message         TEXT NOT NULL,
    read_at         TIMESTAMP NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_cm_read (read_at)
);

CREATE TABLE email_templates (
    id              CHAR(36) PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    subject         VARCHAR(500) NOT NULL,
    body            LONGTEXT NOT NULL,
    variables       JSON NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE media_assets (
    id              CHAR(36) PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    filename        VARCHAR(500) NOT NULL,
    url             VARCHAR(500) NOT NULL,
    type            VARCHAR(100) NULL,
    size            VARCHAR(50) NULL,
    uploaded_by     CHAR(36) NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE organization_settings (
    id              CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    organization_name VARCHAR(255) NOT NULL,
    tagline         VARCHAR(500) NULL,
    email           VARCHAR(255) NULL,
    phone           VARCHAR(50) NULL,
    address         VARCHAR(500) NULL,
    logo_url        VARCHAR(500) NULL,
    signature_url   VARCHAR(500) NULL,
    stamp_url       VARCHAR(500) NULL,
    payout_bereavement DECIMAL(12,2) DEFAULT 0.00,
    payout_medical  DECIMAL(12,2) DEFAULT 0.00,
    payout_education DECIMAL(12,2) DEFAULT 0.00,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Migration 0016: Create Meeting Minutes Tables

```sql
CREATE TABLE meeting_minutes (
    id              CHAR(36) PRIMARY KEY,
    title           VARCHAR(255) NOT NULL,
    meeting_date    DATE NOT NULL,
    meeting_type    ENUM('general','executive') NOT NULL DEFAULT 'general',
    agenda          TEXT NULL,
    discussions     TEXT NULL,
    decisions       TEXT NULL,
    action_items    TEXT NULL,
    next_meeting_date DATE NULL,
    status          ENUM('draft','submitted_to_secretary','pending_chairperson_approval','rejected_by_secretary','approved','rejected') NOT NULL DEFAULT 'draft',
    prepared_by     CHAR(36) NOT NULL,
    reviewed_by     CHAR(36) NULL,
    approved_by     CHAR(36) NULL,
    rejection_notes TEXT NULL,
    content         TEXT NULL,
    attendees_count INT DEFAULT 0,
    file_url        VARCHAR(500) NULL,
    visible_to_members JSON NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (prepared_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_mm_status (status),
    INDEX idx_mm_date (meeting_date)
);

CREATE TABLE minute_attendance (
    id              CHAR(36) PRIMARY KEY,
    minute_id       CHAR(36) NOT NULL,
    member_id       CHAR(36) NOT NULL,
    status          ENUM('PRESENT','ABSENT_WITH_APOLOGY','ABSENT') NOT NULL,
    FOREIGN KEY (minute_id) REFERENCES meeting_minutes(id) ON DELETE CASCADE,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
    INDEX idx_ma_minute (minute_id)
);

CREATE TABLE scheduled_meetings (
    id              CHAR(36) PRIMARY KEY,
    title           VARCHAR(255) NOT NULL,
    date            DATE NOT NULL,
    time            TIME NOT NULL,
    location        VARCHAR(255) NULL,
    type            VARCHAR(100) NULL,
    agenda          JSON NULL,
    attendees_count INT DEFAULT 0,
    status          ENUM('scheduled','completed','cancelled') NOT NULL DEFAULT 'scheduled',
    created_by      CHAR(36) NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_sm_date (date),
    INDEX idx_sm_status (status)
);

CREATE TABLE signatures (
    id              CHAR(36) PRIMARY KEY,
    role            ENUM('secretary','chairperson') NOT NULL,
    file_url        VARCHAR(500) NOT NULL,
    file_name       VARCHAR(255) NULL,
    uploaded_by     CHAR(36) NULL,
    uploaded_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_sig_role (role)
);
```

### Migration 0017: Create Audit & Security Tables

```sql
CREATE TABLE audit_logs (
    id              CHAR(36) PRIMARY KEY,
    user_id         CHAR(36) NULL,
    user_name       VARCHAR(255) NULL,
    action          VARCHAR(255) NOT NULL,
    module          VARCHAR(100) NOT NULL,
    ip_address      VARCHAR(45) NULL,
    details         TEXT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_audit_user (user_id),
    INDEX idx_audit_module (module),
    INDEX idx_audit_date (created_at)
);

CREATE TABLE login_activity (
    id              CHAR(36) PRIMARY KEY,
    user_id         CHAR(36) NULL,
    user_name       VARCHAR(255) NULL,
    email           VARCHAR(255) NULL,
    ip_address      VARCHAR(45) NULL,
    device          VARCHAR(255) NULL,
    status          ENUM('success','failed') NOT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_la_user (user_id),
    INDEX idx_la_date (created_at)
);

CREATE TABLE access_roles (
    id              CHAR(36) PRIMARY KEY,
    name            VARCHAR(100) UNIQUE NOT NULL,
    description     TEXT NULL,
    permissions     JSON NOT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE registration_applicants (
    id              CHAR(36) PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    email           VARCHAR(255) NOT NULL,
    phone           VARCHAR(20) NOT NULL,
    county          VARCHAR(100) NULL,
    workplace       VARCHAR(255) NULL,
    status          ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_ra_status (status)
);
```

### Migration 0018: Create M-Pesa Transactions Table

```sql
CREATE TABLE mpesa_transactions (
    id                  CHAR(36) PRIMARY KEY,
    checkout_request_id VARCHAR(100) UNIQUE NOT NULL,
    merchant_request_id VARCHAR(100) NULL,
    phone               VARCHAR(20) NOT NULL,
    amount              DECIMAL(12,2) NOT NULL,
    account_ref         VARCHAR(100) NULL,
    transaction_desc    VARCHAR(255) NULL,
    member_id           CHAR(36) NULL,
    payment_type        VARCHAR(50) NOT NULL,
    penalty_ids         JSON NULL,
    campaign_id         CHAR(36) NULL,
    status              ENUM('pending','completed','failed') NOT NULL DEFAULT 'pending',
    mpesa_receipt_no    VARCHAR(100) NULL,
    result_code         INT NULL,
    result_desc         VARCHAR(500) NULL,
    callback_received   BOOLEAN NOT NULL DEFAULT FALSE,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE SET NULL,
    INDEX idx_mpesa_checkout (checkout_request_id),
    INDEX idx_mpesa_status (status),
    INDEX idx_mpesa_member (member_id)
);
```

---

## 3. Default Seed Data

```sql
-- Default wallets
INSERT INTO wallets (id, type, balance) VALUES
  (UUID(), 'operational', 0.00),
  (UUID(), 'contributions', 0.00),
  (UUID(), 'penalty', 0.00),
  (UUID(), 'donation', 0.00);

-- Default organization settings
INSERT INTO organization_settings (id, organization_name, tagline, email, phone, address) VALUES
  (UUID(), 'Kirinyaga Healthcare Workers Welfare', 'Supporting healthcare workers', 'info@khwwc.co.ke', '+254700100200', 'Kerugoya, Kirinyaga');

-- Default access roles
INSERT INTO access_roles (id, name, description, permissions) VALUES
  (UUID(), 'member', 'Standard member', '["member.dashboard","member.profile","member.contributions","member.beneficiaries","member.documents","member.notifications","member.events","member.news","member.penalties","member.donations","member.withdrawals","member.downloads","member.payments"]'),
  (UUID(), 'admin', 'Administrator', '["admin.*","member.*"]'),
  (UUID(), 'treasurer', 'Treasurer', '["treasurer.*","member.*"]'),
  (UUID(), 'secretary', 'Secretary', '["secretary.*","minutes.*","signatures.*"]'),
  (UUID(), 'vice-secretary', 'Vice Secretary', '["vice-secretary.*","minutes.*"]'),
  (UUID(), 'chairperson', 'Chairperson', '["chairperson.*","minutes.approve","minutes.reject","signatures.*"]'),
  (UUID(), 'office', 'Office Staff', '["office.*"]'),
  (UUID(), 'super-admin', 'Super Administrator', '["*"]');

-- Default document types
INSERT INTO document_types (id, code, name, allowed_member_upload, requires_expiry) VALUES
  (UUID(), 'national_id', 'National ID Card', TRUE, FALSE),
  (UUID(), 'passport', 'Passport', TRUE, TRUE),
  (UUID(), 'nhif', 'NHIF Card', TRUE, TRUE),
  (UUID(), 'kra_pin', 'KRA PIN Certificate', TRUE, FALSE),
  (UUID(), 'employment_letter', 'Employment Letter', TRUE, FALSE);
```

---

## 4. Key Constraints & Relationships

```
users 1───1 members
members 1───* beneficiaries
members 1───* contributions
members 1───* penalties
members 1───* donations
members 1───* withdrawal_requests
members 1───* documents
members 1───* payouts
members 1───* notifications (via user_id)
contributions *───1 bank_transactions (optional match)
import_batches 1───* import_batch_rows
meeting_minutes 1───* minute_attendance
meeting_minutes *───1 users (prepared_by)
payouts 1───* payout_signatories
wallets 1───* wallet_transactions
donation_campaigns 1───* donations
```

---

## 5. Index Strategy

- All foreign keys have indexes (automatic in MySQL)
- `reference` columns have unique indexes (idempotency)
- `status` columns on all transactional tables (frequent filtering)
- `created_at` on all tables (date-range queries, sorting)
- `phone` and `email` on `users` (login lookups)
- `member_number` on `members` (unique business identifier)
- `slug` on `news_articles`, `website_content`, `leadership_people` (URL routing)
