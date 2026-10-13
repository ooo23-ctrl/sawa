# KHWWC — Financial Integrity Rules

**Date:** 2026-10-13  
**Purpose:** Financial safety rules and ledger constraints for the welfare application

---

## 1. Core Principles

1. **All financial totals are derived from persisted records** — never from frontend state
2. **All financial mutations are atomic** — wrapped in database transactions
3. **All financial changes are auditable** — audit log with before/after values
4. **No silent overwrites** — corrections create new records, not updates to existing
5. **No assumed successes** — payments verified via callbacks, not initiation
6. **Idempotency required** — duplicate operations detected and rejected

---

## 2. Wallet Integrity

### 2.1 Wallet Types

| Wallet | Source of Funds | Uses |
|--------|----------------|------|
| operational | Member monthly contributions | Payouts (bereavement, medical, education), expenses |
| contributions | Member contributions (tracked separately) | Withdrawals |
| penalty | Penalty payments | Payouts (penalty wallet source) |
| donation | Donation contributions | Payouts (donation wallet source) |

### 2.2 Balance Calculation

```
wallet_balance = SUM(credits) - SUM(debits)
```

- Balance is NOT a stored mutable field — it is computed from `wallet_transactions`
- Each `wallet_transaction` has `balance_after` field for quick lookup, but this is a denormalized convenience
- A reconciliation job runs periodically to verify `balance_after` chain is consistent
- The `wallets.balance` field is a cache; it must match `SUM(credits) - SUM(debits)`

### 2.3 Transaction Rules

| Rule | Enforcement |
|------|-------------|
| Every credit/debit is a new row | INSERT only; no UPDATE/DELETE on `wallet_transactions` |
| `balance_after` is calculated server-side | Not from client input |
| `reference` is unique | Prevents duplicate entries |
| `related_txn_id` links counterpart | For transfers between wallets |
| `created_by` is always the authenticated user | Server-set, never client-set |

---

## 3. Contribution Integrity

### 3.1 Contribution Lifecycle

```
Created (pending)
  ├── M-Pesa STK push initiated → status stays "pending"
  │     ├── Callback: success → status "confirmed", create wallet_transaction
  │     └── Callback: failure → status "failed"
  ├── Bank import matched → status "confirmed", create wallet_transaction
  └── Manual entry by treasurer → status "confirmed" (requires audit)
```

### 3.2 Rules

| Rule | Enforcement |
|------|-------------|
| `reference` is unique | Unique index on `contributions.reference` |
| Amount must be > 0 | Validation: `amount: required\|numeric\|min:0.01` |
| M-Pesa STK push does NOT confirm | Status remains "pending" until callback |
| Bank import matching creates contribution | Only if phone matches a member |
| Duplicate detection | Check `reference` and `mpesa_txn_id` uniqueness |
| Adjustments create audit records | `adjusted_at`, `adjusted_by`, `adjustment_reason` |
| Adjustments do NOT delete original | Original amount preserved; new record with `adjusted_by` reference |

### 3.3 Adjustment Workflow

```php
// TreasurerController::adjustContribution
DB::transaction(function () {
    $original = $contribution->amount;
    $contribution->update([
        'amount' => $validated['amount'],
        'adjusted_at' => now(),
        'adjusted_by' => auth()->id(),
        'adjustment_reason' => $validated['reason'],
    ]);

    AuditLog::create([
        'user_id' => auth()->id(),
        'action' => 'contribution.adjusted',
        'module' => 'treasurer',
        'details' => json_encode([
            'contribution_id' => $contribution->id,
            'original_amount' => $original,
            'new_amount' => $validated['amount'],
            'reason' => $validated['reason'],
        ]),
    ]);

    // Update wallet transaction if confirmed
    if ($contribution->status === 'confirmed') {
        WalletService::reconcileContribution($contribution);
    }
});
```

---

## 4. Bank Statement Import Integrity

### 4.1 Import Process

```
1. Parse Excel/CSV file → extract rows
2. For each row:
   a. Check for duplicate (by reference_no + trans_date)
   b. Match to member by phone (extracted from transaction_details)
   c. If matched: create contribution (status=pending), link bank_transaction
   d. If unmatched: store as unmatched bank_transaction
   e. If invalid phone: mark as invalid_phone
3. Create import_batch record with summary statistics
4. Store import_batch_rows for audit trail
```

### 4.2 Rules

| Rule | Enforcement |
|------|-------------|
| Duplicate detection | Match on `reference_no` + `trans_date` |
| Phone matching | Extract digits from `transaction_details`, match to `members.phone` |
| Atomic batch import | All rows in a chunk succeed or all fail |
| Import batch record | Always created with counts (new, matched, duplicates, unmatched, invalid) |
| Row-level audit | `import_batch_rows` stores every row with match status |
| No automatic confirmation | Matched contributions are "pending" until treasurer reviews |
| Chunking | Frontend sends 200 rows per request; backend processes atomically per chunk |

### 4.3 Reconciliation

```
book_balance (from bank statement) vs computed_balance (from wallet transactions)
  ├── difference = 0 → reconciled
  ├── difference > 0 → unmatched credits (deposits not in system)
  └── difference < 0 → unmatched debits (withdrawals not in system)
```

---

## 5. M-Pesa Payment Integrity

### 5.1 STK Push Flow

```
1. Member initiates payment → POST /payments/stk-push
2. Backend calls Safaricom Daraja API → STK push
3. Create mpesa_transactions record (status=pending)
4. Return checkout_request_id to frontend
5. Frontend polls GET /payments/status/{checkoutRequestId}
6. Safaricom sends callback → POST /payments/mpesa-callback
   a. Verify callback signature
   b. Update mpesa_transactions (status, receipt_no, result_code)
   c. If success: create/confirm contribution, create wallet_transaction
   d. If failure: update contribution status to "failed"
7. Frontend polling sees status change
```

### 5.2 Rules

| Rule | Enforcement |
|------|-------------|
| STK push does NOT confirm payment | Status stays "pending" until callback |
| Callback signature verified | Prevents spoofed callbacks |
| `checkout_request_id` is unique | Prevents duplicate processing |
| `mpesa_receipt_no` is unique | Prevents duplicate confirmations |
| Callback is idempotent | If already processed, return success without re-processing |
| Amount verified | Callback amount must match STK push amount |
| Member verified | Callback phone must match initiating member |

### 5.3 Sandbox Rules (Development)

- Use Safaricom Daraja sandbox endpoints
- Sandbox credentials in `.env` (not committed)
- No real money is moved
- Callbacks simulated via test endpoint
- All amounts in KES

---

## 6. Payout Integrity

### 6.1 Payout Workflow

```
1. Treasurer creates payout → status "pending"
   a. Verify member exists
   b. Verify payout_type eligibility
   c. Verify wallet_type has sufficient balance
   d. Create payout record
   e. Create payout_signatories (based on org policy)
2. Authorized signatory approves → signatory status "approved"
3. All signatories approved → payout status "approved"
4. Treasurer marks as paid → status "paid"
   a. Create wallet_transaction (debit)
   b. Update wallet balance
   c. Create audit record
```

### 6.2 Rules

| Rule | Enforcement |
|------|-------------|
| Eligibility check per payout type | Server validates member eligibility |
| Wallet balance check | Server rejects if insufficient balance |
| Signatory requirements | Configurable per organization |
| Amount limits | Per payout type (from org settings) |
| Unique reference | Generated server-side |
| Paid status creates debit | Wallet transaction created atomically |

---

## 7. Withdrawal Integrity

### 7.1 Workflow

```
1. Member requests withdrawal → status "pending"
2. Treasurer/Admin approves → status "approved"
   a. Verify wallet balance
   b. Create audit record
3. Treasurer marks as paid → status "paid"
   a. Create wallet_transaction (debit)
   b. Update wallet balance
4. Treasurer/Admin rejects → status "rejected" (with note)
```

### 7.2 Rules

| Rule | Enforcement |
|------|-------------|
| Only own withdrawals | Member can only request for themselves |
| Approver cannot be requester | Separation of duties |
| Amount > 0 | Validation |
| Paid requires prior approval | Status transition enforced |
| Paid creates wallet debit | Atomic transaction |

---

## 8. Expense Integrity

### 8.1 Workflow

```
1. Treasurer creates expense → status "pending"
2. Treasurer/Admin approves → status "approved"
3. Treasurer marks as paid → status "paid"
   a. Create wallet_transaction (debit from operational wallet)
   b. Update wallet balance
4. Treasurer/Admin rejects → status "rejected"
```

### 8.2 Rules

| Rule | Enforcement |
|------|-------------|
| Amount > 0 | Validation |
| Category required | For reporting |
| Receipt URL optional | But recommended for audit |
| Paid creates wallet debit | Atomic transaction |
| Approver can be creator | (Different from withdrawals — expenses are internal) |

---

## 9. Audit Trail Requirements

Every financial operation must create an audit log entry:

```php
AuditLog::create([
    'user_id' => auth()->id(),
    'user_name' => auth()->user()->name,
    'action' => '{module}.{operation}',  // e.g., "contribution.adjusted"
    'module' => '{module}',              // e.g., "treasurer"
    'ip_address' => $request->ip(),
    'details' => json_encode([
        'entity_id' => $entity->id,
        'before' => $beforeState,         // For updates
        'after' => $afterState,           // For updates
        'amount' => $amount,              // For financial ops
        'reason' => $reason,              // For adjustments
    ]),
]);
```

### Operations Requiring Audit

- Contribution creation, adjustment, confirmation
- Wallet transaction creation (credit/debit)
- Bank statement import
- M-Pesa payment confirmation
- Payout creation, approval, payment
- Withdrawal approval, rejection, payment
- Expense creation, approval, payment, rejection
- Penalty waiver
- Donation campaign creation, update, deletion
- Organization settings update
- Any DELETE operation on financial records

---

## 10. Prohibited Actions

| Action | Reason |
|--------|--------|
| DELETE on `wallet_transactions` | Immutable ledger |
| DELETE on `contributions` (confirmed) | Financial record |
| UPDATE on `wallet_transactions.balance_after` | Server-calculated only |
| Client-side balance calculation | Server is source of truth |
| Marking payment successful from STK push | Must wait for callback |
| Creating wallet_transaction without reference | Idempotency |
| Bypassing signatory requirements | Authorization |
| Exposing financial data in error messages | Information leakage |
