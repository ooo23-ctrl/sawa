# KHWWC — Security Audit

**Date:** 2026-10-13  
**Purpose:** Security review of frontend and backend blueprint

---

## 1. Frontend Security Issues

### 1.1 Critical

| ID | Issue | Component | Risk | Fix |
|----|-------|-----------|------|-----|
| SEC-F-01 | XSS via print function | `WithdrawalReceipts.tsx` | `window.open` + `document.write` builds HTML with unescaped `member_name`, `reason` — attacker-controlled data could inject script | Escape all user data before inserting into HTML, or use DOM API instead of `document.write` |
| SEC-F-02 | No server logout | `AuthContext.tsx` | `logout()` only clears localStorage — JWT remains valid server-side | Call `authApi.logout()` to invalidate token server-side |
| SEC-F-03 | No session revalidation | `AuthContext.tsx` | On reload, user is hydrated from sessionStorage without checking if token is still valid | Call `authApi.me()` on mount to verify token; redirect to login if 401 |

### 1.2 High

| ID | Issue | Component | Risk | Fix |
|----|-------|-----------|------|-----|
| SEC-F-04 | Client-only authorization | `RouteGuard.tsx` | Role checks are client-side only — can be bypassed by modifying local state | Backend must enforce role checks on every endpoint (non-negotiable) |
| SEC-F-05 | Demo JWT in production | `mock.ts` | If demo mode accidentally enabled in production, `demo-jwt-token-{timestamp}` is used | Add production check: if `NODE_ENV=production`, force `demoMode=false` |
| SEC-F-06 | Demo data leak in prod | `ChatPage.tsx` | `NewGroupModal` references `demoChatData.allMembers` even in production mode | Use real member list from API in production |
| SEC-F-07 | `window.open` without `noopener` | `MemberDocuments.tsx` | Opened window can access `window.opener` | Add `noopener,noreferrer` to `window.open` features |

### 1.3 Medium

| ID | Issue | Component | Risk | Fix |
|----|-------|-----------|------|-----|
| SEC-F-08 | Password min-length inconsistent | Multiple pages | Some require 6, others 8 | Standardize to 8 minimum |
| SEC-F-09 | Hardcoded old password | `ForcePasswordChangePage` | Old password hardcoded as `'old'` | Should not send old password for forced change (backend already knows) |
| SEC-F-10 | Social links are stubs | `PublicLayout.tsx` | `href="#"` links could be redirected | Remove or set real URLs |
| SEC-F-11 | Token in sessionStorage | `client.ts` | Accessible to XSS attacks | Consider httpOnly cookies; at minimum ensure CSP headers are set |

---

## 2. Backend Security Requirements

### 2.1 Authentication

- **JWT issuance:** Use `php-open-source-saver/jwt-auth` package
- **Token storage:** JWT in Authorization header, never in URL
- **Token expiry:** Set short-lived access tokens (15-60 min) + refresh tokens
- **Token invalidation:** `logout` must blacklist/invalidate the JWT
- **Login rate limiting:** 5 attempts per minute per IP (`throttle:5,1`)
- **Password hashing:** Use Laravel's `bcrypt` or `argon2` (default)
- **Password policy:** Minimum 8 characters, require letters + numbers
- **Force password change:** Flag on user record, checked on every authenticated request

### 2.2 Authorization (Non-Negotiable)

- Every protected endpoint must check user role via middleware
- Every data-access endpoint must verify ownership (`auth()->id() === resource->user_id`)
- Financial endpoints require `treasurer|admin|super-admin` role
- Minutes workflow enforces status-based transitions (see Role Permission Matrix)
- Super-admin endpoints require `super-admin` role exclusively
- Never trust client-side role checks

### 2.3 Input Validation

- All form requests use Laravel Form Request validation
- All user input is sanitized (Laravel handles via validators)
- File uploads: validate mime type, max size (5MB documents, 2MB images)
- SQL injection: use Eloquent ORM or parameterized queries exclusively
- Mass assignment: use `$fillable` on all models

### 2.4 Financial Security

- All financial mutations wrapped in database transactions
- Contribution adjustments create audit records (not silent overwrites)
- Bank statement imports detect duplicates by reference number
- M-Pesa payments verified via callback (not assumed from STK push)
- Payouts require authorization before disbursement
- Wallet balances derived from ledger entries (not stored separately without reconciliation)
- Expense approvals are atomic (status transition + audit log in one transaction)

### 2.5 File Upload Security

- Validate file mime type server-side (never trust client header)
- Store files outside web root or in private storage
- Generate random filenames (don't use user-supplied names)
- Scan uploaded files for malware (optional: ClamAV integration)
- Profile images: resize/compress on upload
- Documents: restrict to PDF, JPG, PNG

### 2.6 API Security

- CORS configured to allow only the frontend origin
- Rate limiting on all endpoints (60/min for authenticated, 5/min for login)
- HTTPS enforced in production
- API versioning via URL prefix (`/api/v1/` or keep `/api/`)
- No sensitive data in responses (passwords, tokens, bank credentials)
- Error messages don't leak internal details (stack traces, SQL errors)
- Request size limits configured
- Pagination enforced (no unbounded queries)

### 2.7 Audit Logging

- All POST/PUT/PATCH/DELETE operations logged
- Log fields: user_id, user_name, action, module, ip_address, details, timestamp
- Audit logs are append-only (no updates/deletes)
- Financial operations include before/after values
- Login attempts (success and failure) logged

### 2.8 Sensitive Data Handling

| Data | Storage | Access | Notes |
|------|---------|--------|-------|
| Passwords | Hashed (bcrypt) | Never returned in API responses | |
| JWT tokens | In memory/sessionStorage | Never logged | |
| National ID numbers | Encrypted at rest | Only admin/treasurer/super-admin | |
| Phone numbers | Plain text | Member's own + admin/treasurer | |
| Bank credentials | In env vars only | Never exposed via API | |
| M-Pesa credentials | In env vars only | Never exposed via API | |
| Audit logs | Plain text | Super-admin only | |

---

## 3. Supabase Security Issues

### 3.1 Group Chat Tables — RLS Not Enforced

| Table | Current | Required |
|-------|---------|----------|
| `chat_conversations` | No RLS | RLS: participants can only see conversations they're in |
| `chat_participants` | No RLS | RLS: users can only see participants of their conversations |
| `chat_messages` | No RLS | RLS: users can only see messages in conversations they participate in |
| `chat_reactions` | No RLS | RLS: users can only react to messages in their conversations |
| `chat_typing` | No RLS | RLS: users can only set typing in their conversations |

**Required RLS policies for each table:**

```sql
-- Example for chat_messages
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own_messages" ON chat_messages FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM chat_participants
      WHERE chat_participants.conversation_id = chat_messages.conversation_id
      AND chat_participants.user_id = auth.uid()
    )
  );

CREATE POLICY "insert_own_messages" ON chat_messages FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_participants
      WHERE chat_participants.conversation_id = chat_messages.conversation_id
      AND chat_participants.user_id = auth.uid()
    )
  );

CREATE POLICY "delete_own_messages" ON chat_messages FOR DELETE
  TO authenticated USING (user_id = auth.uid());
```

### 3.2 AI Assistant — Auth Verification

The edge function currently accepts any request with the anon key. In production mode, it must verify the Bearer JWT:

```typescript
// In ai-assistant/index.ts
const authHeader = req.headers.get('Authorization');
if (!authHeader?.startsWith('Bearer ')) {
  return new Response('Unauthorized', { status: 401, headers: corsHeaders });
}
// Verify JWT against Supabase auth
```

### 3.3 Profile Photo Storage

Currently uses Supabase Storage with anon key. Should use authenticated uploads with RLS on the storage bucket:

```sql
-- Storage bucket policy
CREATE POLICY "upload_own_profile" ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (
    bucket_id = 'profile-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
```

---

## 4. OWASP Top 10 Coverage

| OWASP Risk | Status | Notes |
|------------|--------|-------|
| A01: Broken Access Control | **Requires backend** | Client-only authz must be backed by server middleware + policies |
| A02: Cryptographic Failures | **Requires backend** | Password hashing, JWT signing, HTTPS enforcement |
| A03: Injection | **Protected by Eloquent** | ORM prevents SQL injection; validate all inputs |
| A04: Insecure Design | **Partially addressed** | Financial safety rules documented; audit trail designed |
| A05: Security Misconfiguration | **Requires backend** | CORS, rate limiting, debug mode, error handling |
| A06: Vulnerable Components | **Monitor** | Keep all packages updated; run `composer audit` |
| A07: Authentication Failures | **Requires backend** | Rate limiting, password policy, session management |
| A08: Software/Data Integrity | **Requires backend** | File upload validation, unsigned data prevention |
| A09: Logging/Monitoring Failures | **Designed** | Audit logging specified; login activity tracking |
| A10: SSRF | **N/A** | No server-side URL fetching from user input (except M-Pesa callbacks) |

---

## 5. Security Recommendations Summary

1. **Backend must enforce all authorization** — never rely on frontend checks
2. **Fix XSS in `WithdrawalReceipts`** before any production deployment
3. **Add RLS policies to all Supabase chat tables** — currently open to anyone with anon key
4. **Verify JWT in AI assistant edge function** — currently accepts any request
5. **Implement server-side logout** with token invalidation
6. **Add session revalidation** on page reload via `authApi.me()`
7. **Force demo mode off in production** via `NODE_ENV` check
8. **Standardize password policy** at 8 characters minimum
9. **Configure CORS** to allow only the frontend origin
10. **Set up rate limiting** on login (5/min) and general API (60/min)
