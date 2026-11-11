<?php
/**
 * Get Account Ledger — transaction history for a single account
 * GET /api/get_account_ledger.php?account_id=1&start_date=2026-01-01&end_date=2026-12-31&page=1&limit=50
 */
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/middleware.php';

$user = authenticate();

try {
    $accountId = (int)($_GET['account_id'] ?? 0);
    $startDate = $_GET['start_date'] ?? date('Y-01-01');
    $endDate = $_GET['end_date'] ?? date('Y-12-31');
    $page = max(1, (int)($_GET['page'] ?? 1));
    $limit = max(1, min(100, (int)($_GET['limit'] ?? 50)));
    $offset = ($page - 1) * $limit;

    if ($accountId <= 0) {
        apiError('account_id is required', 400);
    }

    // Get account info
    $acctStmt = $db->prepare("SELECT * FROM account WHERE id = :id");
    $acctStmt->execute([':id' => $accountId]);
    $account = $acctStmt->fetch(PDO::FETCH_ASSOC);
    if (!$account) {
        apiError('Account not found', 404);
    }

    // Opening balance (sum before start_date)
    $openStmt = $db->prepare("
        SELECT COALESCE(SUM(jel.debit), 0) AS total_debit,
               COALESCE(SUM(jel.credit), 0) AS total_credit
        FROM journal_entry_line jel
        JOIN journal_entry je ON je.id = jel.journal_entry_id
        WHERE jel.account_id = :acct AND je.is_posted = 1 AND je.entry_date < :start
    ");
    $openStmt->execute([':acct' => $accountId, ':start' => $startDate]);
    $opening = $openStmt->fetch(PDO::FETCH_ASSOC);
    $openingBalance = ($account['normal_balance'] === 'Debit')
        ? (float)$opening['total_debit'] - (float)$opening['total_credit']
        : (float)$opening['total_credit'] - (float)$opening['total_debit'];

    // Count
    $countStmt = $db->prepare("
        SELECT COUNT(*) FROM journal_entry_line jel
        JOIN journal_entry je ON je.id = jel.journal_entry_id
        WHERE jel.account_id = :acct AND je.is_posted = 1
          AND je.entry_date BETWEEN :start AND :end
    ");
    $countStmt->execute([':acct' => $accountId, ':start' => $startDate, ':end' => $endDate]);
    $total = (int)$countStmt->fetchColumn();

    // Ledger lines
    $stmt = $db->prepare("
        SELECT je.id AS journal_entry_id, je.entry_date, je.reference_no, je.description AS entry_description,
               je.source_type, jel.debit, jel.credit, jel.description AS line_description, jel.fund_id,
               f.name AS fund_name
        FROM journal_entry_line jel
        JOIN journal_entry je ON je.id = jel.journal_entry_id
        LEFT JOIN fund f ON f.id = jel.fund_id
        WHERE jel.account_id = :acct AND je.is_posted = 1
          AND je.entry_date BETWEEN :start AND :end
        ORDER BY je.entry_date ASC, je.id ASC
        LIMIT :limit OFFSET :offset
    ");
    $stmt->execute([':acct' => $accountId, ':start' => $startDate, ':end' => $endDate, ':limit' => $limit, ':offset' => $offset]);
    $lines = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Running balance
    $runningBalance = $openingBalance;
    foreach ($lines as &$line) {
        $line['debit'] = (float)$line['debit'];
        $line['credit'] = (float)$line['credit'];
        if ($account['normal_balance'] === 'Debit') {
            $runningBalance += $line['debit'] - $line['credit'];
        } else {
            $runningBalance += $line['credit'] - $line['debit'];
        }
        $line['running_balance'] = round($runningBalance, 2);
    }

    // Period totals
    $totStmt = $db->prepare("
        SELECT COALESCE(SUM(jel.debit), 0) AS period_debit,
               COALESCE(SUM(jel.credit), 0) AS period_credit
        FROM journal_entry_line jel
        JOIN journal_entry je ON je.id = jel.journal_entry_id
        WHERE jel.account_id = :acct AND je.is_posted = 1
          AND je.entry_date BETWEEN :start AND :end
    ");
    $totStmt->execute([':acct' => $accountId, ':start' => $startDate, ':end' => $endDate]);
    $periodTotals = $totStmt->fetch(PDO::FETCH_ASSOC);

    $closingBalance = ($account['normal_balance'] === 'Debit')
        ? $openingBalance + (float)$periodTotals['period_debit'] - (float)$periodTotals['period_credit']
        : $openingBalance + (float)$periodTotals['period_credit'] - (float)$periodTotals['period_debit'];

    apiSuccess([
        'account' => [
            'id' => (int)$account['id'],
            'account_code' => $account['account_code'],
            'account_name' => $account['account_name'],
            'account_type' => $account['account_type'],
            'normal_balance' => $account['normal_balance'],
        ],
        'opening_balance' => round($openingBalance, 2),
        'closing_balance' => round($closingBalance, 2),
        'period_debit' => (float)$periodTotals['period_debit'],
        'period_credit' => (float)$periodTotals['period_credit'],
        'lines' => $lines,
        'pagination' => [
            'total' => $total,
            'total_pages' => max(1, ceil($total / $limit)),
            'page' => $page,
            'limit' => $limit,
        ]
    ], 'Account ledger retrieved');

} catch (PDOException $e) {
    error_log("Account ledger error: " . $e->getMessage());
    apiError('Failed to retrieve account ledger', 500);
}
