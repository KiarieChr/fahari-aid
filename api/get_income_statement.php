<?php
/**
 * Get Income Statement (Profit & Loss)
 * GET /api/get_income_statement.php?start_date=2026-01-01&end_date=2026-12-31&fund_id=
 */
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/middleware.php';

$user = authenticate();

try {
    $startDate = $_GET['start_date'] ?? date('Y-01-01');
    $endDate = $_GET['end_date'] ?? date('Y-12-31');
    $fundId = !empty($_GET['fund_id']) ? (int)$_GET['fund_id'] : null;

    $fundFilter = '';
    $params = [':start' => $startDate, ':end' => $endDate];
    if ($fundId) {
        $fundFilter = " AND jel.fund_id = :fund_id";
        $params[':fund_id'] = $fundId;
    }

    // Revenue accounts (4xxx) — credit balances
    $revStmt = $db->prepare("
        SELECT a.id, a.account_code, a.account_name,
               COALESCE(SUM(jel.credit), 0) - COALESCE(SUM(jel.debit), 0) AS amount
        FROM account a
        LEFT JOIN journal_entry_line jel ON jel.account_id = a.id $fundFilter
        LEFT JOIN journal_entry je ON je.id = jel.journal_entry_id
            AND je.is_posted = 1
            AND je.entry_date BETWEEN :start AND :end
        WHERE a.account_type = 'Revenue' AND a.is_active = 1
        GROUP BY a.id
        HAVING amount != 0
        ORDER BY a.account_code ASC
    ");
    $revStmt->execute($params);
    $revenueItems = $revStmt->fetchAll(PDO::FETCH_ASSOC);

    // Expense accounts (5xxx) — debit balances
    $expStmt = $db->prepare("
        SELECT a.id, a.account_code, a.account_name,
               COALESCE(SUM(jel.debit), 0) - COALESCE(SUM(jel.credit), 0) AS amount
        FROM account a
        LEFT JOIN journal_entry_line jel ON jel.account_id = a.id $fundFilter
        LEFT JOIN journal_entry je ON je.id = jel.journal_entry_id
            AND je.is_posted = 1
            AND je.entry_date BETWEEN :start AND :end
        WHERE a.account_type = 'Expense' AND a.is_active = 1
        GROUP BY a.id
        HAVING amount != 0
        ORDER BY a.account_code ASC
    ");
    $expStmt->execute($params);
    $expenseItems = $expStmt->fetchAll(PDO::FETCH_ASSOC);

    $totalRevenue = 0;
    foreach ($revenueItems as &$r) {
        $r['amount'] = round((float)$r['amount'], 2);
        $r['id'] = (int)$r['id'];
        $totalRevenue += $r['amount'];
    }

    $totalExpenses = 0;
    foreach ($expenseItems as &$e) {
        $e['amount'] = round((float)$e['amount'], 2);
        $e['id'] = (int)$e['id'];
        $totalExpenses += $e['amount'];
    }

    $netIncome = round($totalRevenue - $totalExpenses, 2);

    apiSuccess([
        'revenue' => $revenueItems,
        'expenses' => $expenseItems,
        'total_revenue' => round($totalRevenue, 2),
        'total_expenses' => round($totalExpenses, 2),
        'net_income' => $netIncome,
        'period' => ['start_date' => $startDate, 'end_date' => $endDate],
        'fund_id' => $fundId,
    ], 'Income statement retrieved');

} catch (PDOException $e) {
    error_log("Income statement error: " . $e->getMessage());
    apiError('Failed to retrieve income statement', 500);
}
