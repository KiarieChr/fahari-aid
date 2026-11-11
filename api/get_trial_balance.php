<?php
/**
 * Get Trial Balance
 * GET /api/get_trial_balance.php?start_date=2026-01-01&end_date=2026-12-31
 */
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/middleware.php';

$user = authenticate();

try {
    $startDate = $_GET['start_date'] ?? date('Y-01-01');
    $endDate = $_GET['end_date'] ?? date('Y-12-31');

    $stmt = $db->prepare("
        SELECT a.id, a.account_code, a.account_name, a.account_type, a.normal_balance,
               COALESCE(SUM(jel.debit), 0) AS total_debit,
               COALESCE(SUM(jel.credit), 0) AS total_credit
        FROM account a
        LEFT JOIN journal_entry_line jel ON jel.account_id = a.id
        LEFT JOIN journal_entry je ON je.id = jel.journal_entry_id 
            AND je.is_posted = 1
            AND je.entry_date BETWEEN :start AND :end
        WHERE a.is_active = 1
        GROUP BY a.id
        HAVING total_debit > 0 OR total_credit > 0
        ORDER BY a.account_code ASC
    ");
    $stmt->execute([':start' => $startDate, ':end' => $endDate]);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $totalDebit = 0;
    $totalCredit = 0;
    $accounts = [];

    foreach ($rows as $row) {
        $debit = (float)$row['total_debit'];
        $credit = (float)$row['total_credit'];
        $balance = $debit - $credit;

        // Present as debit or credit balance based on net
        $debitBalance = $balance > 0 ? round($balance, 2) : 0;
        $creditBalance = $balance < 0 ? round(abs($balance), 2) : 0;

        $totalDebit += $debitBalance;
        $totalCredit += $creditBalance;

        $accounts[] = [
            'id' => (int)$row['id'],
            'account_code' => $row['account_code'],
            'account_name' => $row['account_name'],
            'account_type' => $row['account_type'],
            'normal_balance' => $row['normal_balance'],
            'debit' => $debitBalance,
            'credit' => $creditBalance,
        ];
    }

    apiSuccess([
        'accounts' => $accounts,
        'total_debit' => round($totalDebit, 2),
        'total_credit' => round($totalCredit, 2),
        'is_balanced' => abs($totalDebit - $totalCredit) < 0.01,
        'period' => ['start_date' => $startDate, 'end_date' => $endDate],
    ], 'Trial balance retrieved');

} catch (PDOException $e) {
    error_log("Trial balance error: " . $e->getMessage());
    apiError('Failed to retrieve trial balance', 500);
}
