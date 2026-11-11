<?php
/**
 * JournalService — Centralized Double-Entry Bookkeeping Logic
 * 
 * Every financial transaction in the system flows through this service to
 * create balanced journal entries (debits = credits).
 * 
 * Usage:
 *   require_once __DIR__ . '/JournalService.php';
 *   $js = new JournalService($db);
 *   $jeId = $js->recordIncome($date, $amount, $revenueAccountId, $assetAccountId, $description, $userId, $sourceId);
 */

class JournalService {
    private PDO $db;

    public function __construct(PDO $db) {
        $this->db = $db;
    }

    // -------------------------------------------------------
    // Core: Create a journal entry with balanced lines
    // -------------------------------------------------------
    /**
     * Create a journal entry with debit/credit lines.
     * 
     * @param string $entryDate       YYYY-MM-DD
     * @param string $description     Human-readable description
     * @param string $sourceType      income|expense|contribution|pledge|pledge_redeem|payroll|transfer|adjustment|opening_balance
     * @param int|null $sourceId      FK to the source table row
     * @param int $createdBy          User ID
     * @param array $lines            Array of ['account_id'=>int, 'debit'=>float, 'credit'=>float, 'description'=>string|null, 'fund_id'=>int|null]
     * @return int                    The journal_entry.id
     * @throws Exception              If debits != credits or lines empty
     */
    public function createEntry(string $entryDate, string $description, string $sourceType, ?int $sourceId, int $createdBy, array $lines): int {
        if (empty($lines)) {
            throw new \Exception("Journal entry must have at least one line");
        }

        // Validate balance
        $totalDebit = 0;
        $totalCredit = 0;
        foreach ($lines as $line) {
            $totalDebit += round((float)($line['debit'] ?? 0), 2);
            $totalCredit += round((float)($line['credit'] ?? 0), 2);
        }

        if (abs($totalDebit - $totalCredit) > 0.01) {
            throw new \Exception("Journal entry is unbalanced: Debit=$totalDebit, Credit=$totalCredit");
        }

        // Find accounting period
        $periodId = $this->findPeriod($entryDate);

        // Generate reference number
        $refNo = $this->generateReference($sourceType);

        // Insert header
        $stmt = $this->db->prepare("
            INSERT INTO journal_entry (entry_date, reference_no, description, source_type, source_id, accounting_period_id, is_posted, created_by)
            VALUES (:date, :ref, :desc, :source_type, :source_id, :period_id, 1, :user_id)
        ");
        $stmt->execute([
            ':date' => $entryDate,
            ':ref' => $refNo,
            ':desc' => $description,
            ':source_type' => $sourceType,
            ':source_id' => $sourceId,
            ':period_id' => $periodId,
            ':user_id' => $createdBy,
        ]);
        $journalId = (int)$this->db->lastInsertId();

        // Insert lines
        $lineStmt = $this->db->prepare("
            INSERT INTO journal_entry_line (journal_entry_id, account_id, debit, credit, description, fund_id)
            VALUES (:je_id, :account_id, :debit, :credit, :desc, :fund_id)
        ");
        foreach ($lines as $line) {
            $lineStmt->execute([
                ':je_id' => $journalId,
                ':account_id' => (int)$line['account_id'],
                ':debit' => round((float)($line['debit'] ?? 0), 2),
                ':credit' => round((float)($line['credit'] ?? 0), 2),
                ':desc' => $line['description'] ?? null,
                ':fund_id' => $line['fund_id'] ?? null,
            ]);
        }

        return $journalId;
    }

    // -------------------------------------------------------
    // Convenience: Record Income
    // -------------------------------------------------------
    /**
     * @param string $date
     * @param float $amount
     * @param string $incomeTypeName   e.g. "Donations" — maps to a revenue account
     * @param string|null $paymentMethod  payment method name — maps to an asset account
     * @param string $description
     * @param int $userId
     * @param int $sourceId            income.id
     * @param int|null $fundId
     * @return int journal_entry.id
     */
    public function recordIncome(string $date, float $amount, string $incomeTypeName, ?string $paymentMethod, string $description, int $userId, int $sourceId, ?int $fundId = null): int {
        $revenueAccountId = $this->mapIncomeTypeToAccount($incomeTypeName);
        $assetAccountId = $this->mapPaymentMethodToAccount($paymentMethod);

        return $this->createEntry($date, $description ?: "Income: $incomeTypeName", 'income', $sourceId, $userId, [
            ['account_id' => $assetAccountId, 'debit' => $amount, 'credit' => 0, 'description' => "Received via " . ($paymentMethod ?: 'cash'), 'fund_id' => $fundId],
            ['account_id' => $revenueAccountId, 'credit' => $amount, 'debit' => 0, 'description' => $incomeTypeName, 'fund_id' => $fundId],
        ]);
    }

    /**
     * Record income using a direct GL account ID (from the account table dropdown).
     */
    public function recordIncomeByAccountId(string $date, float $amount, int $revenueAccountId, string $label, ?string $paymentMethod, string $description, int $userId, int $sourceId, ?int $fundId = null): int {
        $assetAccountId = $this->mapPaymentMethodToAccount($paymentMethod);

        return $this->createEntry($date, $description ?: "Income: $label", 'income', $sourceId, $userId, [
            ['account_id' => $assetAccountId, 'debit' => $amount, 'credit' => 0, 'description' => "Received via " . ($paymentMethod ?: 'cash'), 'fund_id' => $fundId],
            ['account_id' => $revenueAccountId, 'credit' => $amount, 'debit' => 0, 'description' => $label, 'fund_id' => $fundId],
        ]);
    }

    // -------------------------------------------------------
    // Convenience: Record Expense
    // -------------------------------------------------------
    public function recordExpense(string $date, float $amount, string $expenseTypeName, ?string $paymentMethod, string $description, int $userId, int $sourceId, ?int $fundId = null): int {
        $expenseAccountId = $this->mapExpenseTypeToAccount($expenseTypeName);
        $assetAccountId = $this->mapPaymentMethodToAccount($paymentMethod);

        return $this->createEntry($date, $description ?: "Expense: $expenseTypeName", 'expense', $sourceId, $userId, [
            ['account_id' => $expenseAccountId, 'debit' => $amount, 'credit' => 0, 'description' => $expenseTypeName, 'fund_id' => $fundId],
            ['account_id' => $assetAccountId, 'credit' => $amount, 'debit' => 0, 'description' => "Paid via " . ($paymentMethod ?: 'cash'), 'fund_id' => $fundId],
        ]);
    }

    /**
     * Record expense using a direct GL account ID (from the account table dropdown).
     */
    public function recordExpenseByAccountId(string $date, float $amount, int $expenseAccountId, string $label, ?string $paymentMethod, string $description, int $userId, int $sourceId, ?int $fundId = null): int {
        $assetAccountId = $this->mapPaymentMethodToAccount($paymentMethod);

        return $this->createEntry($date, $description ?: "Expense: $label", 'expense', $sourceId, $userId, [
            ['account_id' => $expenseAccountId, 'debit' => $amount, 'credit' => 0, 'description' => $label, 'fund_id' => $fundId],
            ['account_id' => $assetAccountId, 'credit' => $amount, 'debit' => 0, 'description' => "Paid via " . ($paymentMethod ?: 'cash'), 'fund_id' => $fundId],
        ]);
    }

    // -------------------------------------------------------
    // Convenience: Record Contribution
    // -------------------------------------------------------
    public function recordContribution(string $date, float $amount, string $contriType, ?string $paymentMethod, string $memberName, int $userId, int $sourceId, ?int $fundId = null): int {
        $revenueAccountId = $this->mapContributionTypeToAccount($contriType);
        $assetAccountId = $this->mapPaymentMethodToAccount($paymentMethod);

        return $this->createEntry($date, "Contribution from $memberName: $contriType", 'contribution', $sourceId, $userId, [
            ['account_id' => $assetAccountId, 'debit' => $amount, 'credit' => 0, 'description' => "Received from $memberName via " . ($paymentMethod ?: 'cash'), 'fund_id' => $fundId],
            ['account_id' => $revenueAccountId, 'credit' => $amount, 'debit' => 0, 'description' => "$contriType contribution", 'fund_id' => $fundId],
        ]);
    }

    // -------------------------------------------------------
    // Convenience: Record Pledge (commitment made)
    // -------------------------------------------------------
    public function recordPledge(string $date, float $amount, string $pledgerName, int $userId, int $sourceId): int {
        $receivableId = $this->getAccountByCode('1100'); // Pledges Receivable
        $revenueId = $this->getAccountByCode('4030');    // Pledges Revenue

        return $this->createEntry($date, "Pledge from $pledgerName", 'pledge', $sourceId, $userId, [
            ['account_id' => $receivableId, 'debit' => $amount, 'credit' => 0, 'description' => "Pledge receivable from $pledgerName"],
            ['account_id' => $revenueId, 'credit' => $amount, 'debit' => 0, 'description' => "Pledge revenue from $pledgerName"],
        ]);
    }

    // -------------------------------------------------------
    // Convenience: Record Pledge Redemption
    // -------------------------------------------------------
    public function recordPledgeRedemption(string $date, float $amount, string $pledgerName, ?string $paymentMethod, int $userId, int $sourceId): int {
        $assetAccountId = $this->mapPaymentMethodToAccount($paymentMethod);
        $receivableId = $this->getAccountByCode('1100'); // Pledges Receivable

        return $this->createEntry($date, "Pledge redeemed by $pledgerName", 'pledge_redeem', $sourceId, $userId, [
            ['account_id' => $assetAccountId, 'debit' => $amount, 'credit' => 0, 'description' => "Received from $pledgerName via " . ($paymentMethod ?: 'cash')],
            ['account_id' => $receivableId, 'credit' => $amount, 'debit' => 0, 'description' => "Pledge receivable cleared"],
        ]);
    }

    // -------------------------------------------------------
    // Convenience: Record Payroll
    // -------------------------------------------------------
    public function recordPayroll(string $date, float $totalNet, string $description, int $userId, int $sourceId): int {
        $salaryExpenseId = $this->getAccountByCode('5020');  // Salaries & Wages
        $bankAccountId = $this->getAccountByCode('1010');    // Bank Account - Main

        return $this->createEntry($date, $description, 'payroll', $sourceId, $userId, [
            ['account_id' => $salaryExpenseId, 'debit' => $totalNet, 'credit' => 0, 'description' => 'Salary expense'],
            ['account_id' => $bankAccountId, 'credit' => $totalNet, 'debit' => 0, 'description' => 'Salary payment'],
        ]);
    }

    // -------------------------------------------------------
    // Reverse a journal entry
    // -------------------------------------------------------
    public function reverseEntry(int $journalEntryId, int $userId): int {
        // Get original entry
        $stmt = $this->db->prepare("SELECT * FROM journal_entry WHERE id = :id AND is_reversed = 0");
        $stmt->execute([':id' => $journalEntryId]);
        $original = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$original) {
            throw new \Exception("Journal entry not found or already reversed");
        }

        // Get original lines
        $lines = $this->db->prepare("SELECT * FROM journal_entry_line WHERE journal_entry_id = :id");
        $lines->execute([':id' => $journalEntryId]);
        $originalLines = $lines->fetchAll(PDO::FETCH_ASSOC);

        // Create reversed lines (swap debit/credit)
        $reversedLines = [];
        foreach ($originalLines as $line) {
            $reversedLines[] = [
                'account_id' => $line['account_id'],
                'debit' => (float)$line['credit'],
                'credit' => (float)$line['debit'],
                'description' => 'REVERSAL: ' . ($line['description'] ?? ''),
                'fund_id' => $line['fund_id'],
            ];
        }

        $reversalId = $this->createEntry(
            date('Y-m-d'),
            'REVERSAL of ' . $original['reference_no'] . ': ' . $original['description'],
            'adjustment',
            null,
            $userId,
            $reversedLines
        );

        // Mark original as reversed
        $this->db->prepare("UPDATE journal_entry SET is_reversed = 1, reversed_by_id = :rev_id WHERE id = :id")
            ->execute([':rev_id' => $reversalId, ':id' => $journalEntryId]);

        return $reversalId;
    }

    // -------------------------------------------------------
    // Audit logging
    // -------------------------------------------------------
    public function audit(string $tableName, int $recordId, string $action, ?array $oldValues, ?array $newValues, int $userId): void {
        $stmt = $this->db->prepare("
            INSERT INTO audit_log (table_name, record_id, action, old_values, new_values, user_id, ip_address)
            VALUES (:table, :record_id, :action, :old_val, :new_val, :user_id, :ip)
        ");
        $stmt->execute([
            ':table' => $tableName,
            ':record_id' => $recordId,
            ':action' => $action,
            ':old_val' => $oldValues ? json_encode($oldValues) : null,
            ':new_val' => $newValues ? json_encode($newValues) : null,
            ':user_id' => $userId,
            ':ip' => $_SERVER['REMOTE_ADDR'] ?? null,
        ]);
    }

    // -------------------------------------------------------
    // Helper: Find accounting period for a given date
    // -------------------------------------------------------
    private function findPeriod(string $date): ?int {
        $stmt = $this->db->prepare("
            SELECT id FROM accounting_period 
            WHERE :d BETWEEN start_date AND end_date AND is_closed = 0 
            ORDER BY start_date DESC LIMIT 1
        ");
        $stmt->execute([':d' => $date]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ? (int)$row['id'] : null;
    }

    // -------------------------------------------------------
    // Helper: Generate reference number  JE-2026-00001
    // -------------------------------------------------------
    private function generateReference(string $sourceType): string {
        $prefix = match($sourceType) {
            'income' => 'INC',
            'expense' => 'EXP',
            'contribution' => 'CON',
            'pledge' => 'PLG',
            'pledge_redeem' => 'PLR',
            'payroll' => 'PAY',
            'transfer' => 'TRF',
            'adjustment' => 'ADJ',
            'opening_balance' => 'OPN',
            'event_expense' => 'EVX',
            default => 'JE',
        };
        $year = date('Y');
        $stmt = $this->db->query("SELECT COUNT(*) + 1 FROM journal_entry WHERE YEAR(created_at) = $year");
        $seq = str_pad($stmt->fetchColumn(), 5, '0', STR_PAD_LEFT);
        return "$prefix-$year-$seq";
    }

    // -------------------------------------------------------
    // Helper: Get account ID by code
    // -------------------------------------------------------
    public function getAccountByCode(string $code): int {
        $stmt = $this->db->prepare("SELECT id FROM account WHERE account_code = :code AND is_active = 1");
        $stmt->execute([':code' => $code]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$row) {
            throw new \Exception("Account not found: $code");
        }
        return (int)$row['id'];
    }

    // -------------------------------------------------------
    // Helper: Map income type name → revenue account
    // -------------------------------------------------------
    private function mapIncomeTypeToAccount(string $typeName): int {
        $map = [
            'tithe' => '4000', 'tithes' => '4000',
            'offering' => '4010', 'offerings' => '4010',
            'donation' => '4020', 'donations' => '4020', 'donationss' => '4020',
            'welfare offering' => '4050', 'welfare' => '4050',
            'partnership' => '4060', 'partnership income' => '4060',
            'interest' => '4070', 'interest income' => '4070',
            'event' => '4040', 'event registration' => '4040',
        ];
        $key = strtolower(trim($typeName));
        $code = $map[$key] ?? '4080'; // Default to Other Income
        return $this->getAccountByCode($code);
    }

    // -------------------------------------------------------
    // Helper: Map expense type name → expense account
    // -------------------------------------------------------
    private function mapExpenseTypeToAccount(string $typeName): int {
        $map = [
            'ministry' => '5000', 'ministry expenses' => '5000',
            'rent' => '5010', 'rent & utilities' => '5010', 'utilities' => '5010',
            'salary' => '5020', 'salaries' => '5020', 'salaries & wages' => '5020',
            'event' => '5030', 'event expenses' => '5030',
            'transport' => '5040', 'transport & travel' => '5040', 'travel' => '5040',
            'office' => '5050', 'office & supplies' => '5050', 'supplies' => '5050',
            'communication' => '5060', 'phone' => '5060', 'mail' => '5060',
            'cleaning' => '5070', 'cleaning & maintenance' => '5070', 'cleaning supplies' => '5070', 'maintenance' => '5070',
            'missions' => '5080', 'missions & outreach' => '5080', 'outreach' => '5080',
            'benevolence' => '5090', 'benevolence & welfare' => '5090',
            'equipment' => '5100', 'equipment & assets' => '5100',
            'professional' => '5110', 'professional services' => '5110', 'consulting' => '5110',
            'bank charges' => '5120', 'bank fees' => '5120',
            'depreciation' => '5130',
        ];
        $key = strtolower(trim($typeName));
        $code = $map[$key] ?? '5140'; // Default to Other Expenses
        return $this->getAccountByCode($code);
    }

    // -------------------------------------------------------
    // Helper: Map contribution type name → revenue account
    // -------------------------------------------------------
    private function mapContributionTypeToAccount(string $typeName): int {
        $map = [
            'tithe' => '4000', 'tithes' => '4000',
            'offering' => '4010', 'offerings' => '4010',
            'building fund' => '4020',
            'donation' => '4020', 'donations' => '4020',
            'welfare' => '4050',
        ];
        $key = strtolower(trim($typeName));
        $code = $map[$key] ?? '4010'; // Default to Offerings
        return $this->getAccountByCode($code);
    }

    // -------------------------------------------------------
    // Helper: Map payment method → asset account
    // -------------------------------------------------------
    private function mapPaymentMethodToAccount(?string $method): int {
        if (!$method) {
            return $this->getAccountByCode('1000'); // Default: Cash
        }

        // Try DB mapping first
        $stmt = $this->db->prepare("
            SELECT pam.account_id FROM payment_account_map pam
            JOIN paymentmethod pm ON pm.id = pam.payment_method_id
            WHERE LOWER(pm.name) = LOWER(:method) AND pm.delete_status = 0
            LIMIT 1
        ");
        $stmt->execute([':method' => $method]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row) {
            return (int)$row['account_id'];
        }

        // Fallback name matching
        $lc = strtolower(trim($method));
        if (str_contains($lc, 'mpesa') || str_contains($lc, 'm-pesa') || str_contains($lc, 'mobile')) {
            return $this->getAccountByCode('1020');
        }
        if (str_contains($lc, 'bank') || str_contains($lc, 'transfer')) {
            return $this->getAccountByCode('1010');
        }
        if (str_contains($lc, 'online') || str_contains($lc, 'card')) {
            return $this->getAccountByCode('1030');
        }
        // Default: Cash
        return $this->getAccountByCode('1000');
    }

    // -------------------------------------------------------
    // Convenience: Record Bill (Accounts Payable liability creation)
    // -------------------------------------------------------
    public function recordBill(string $date, float $amount, int $expenseAccountId, string $vendorName, string $billNo, string $description, int $userId, int $sourceId): int {
        $apAccountId = $this->getAccountByCode('2000'); // Accounts Payable
        return $this->createEntry($date, "Bill $billNo from $vendorName", 'expense', $sourceId, $userId, [
            ['account_id' => $expenseAccountId, 'debit' => $amount, 'credit' => 0, 'description' => $description],
            ['account_id' => $apAccountId, 'credit' => $amount, 'debit' => 0, 'description' => "Owed to $vendorName"],
        ]);
    }

    // -------------------------------------------------------
    // Convenience: Record Bill Payment (Accounts Payable settlement)
    // -------------------------------------------------------
    public function recordBillPayment(string $date, float $amount, string $vendorName, string $billNo, ?string $paymentMethod, int $userId, int $sourceId): int {
        $apAccountId = $this->getAccountByCode('2000'); // Accounts Payable
        $assetAccountId = $this->mapPaymentMethodToAccount($paymentMethod);
        return $this->createEntry($date, "Payment for Bill $billNo to $vendorName", 'expense', $sourceId, $userId, [
            ['account_id' => $apAccountId, 'debit' => $amount, 'credit' => 0, 'description' => "Liability cleared to $vendorName"],
            ['account_id' => $assetAccountId, 'credit' => $amount, 'debit' => 0, 'description' => "Paid via " . ($paymentMethod ?: 'cash')],
        ]);
    }
}
