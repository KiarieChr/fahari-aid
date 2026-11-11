<?php
/**
 * Get Balance Sheet
 * GET /api/get_balance_sheet.php?as_of_date=2026-12-31&fund_id=
 */
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/middleware.php';

$user = authenticate();

try {
    $asOfDate = $_GET['as_of_date'] ?? date('Y-m-d');
    $fundId = !empty($_GET['fund_id']) ? (int)$_GET['fund_id'] : null;

    $fundFilter = '';
    $params = [':end' => $asOfDate];
    if ($fundId) {
        $fundFilter = " AND jel.fund_id = :fund_id";
        $params[':fund_id'] = $fundId;
    }

    // Helper to fetch account balances by type
    $fetchByType = function(string $type, string $balanceExpr) use ($db, $asOfDate, $fundFilter, $params) {
        $stmt = $db->prepare("
            SELECT a.id, a.account_code, a.account_name,
                   $balanceExpr AS balance
            FROM account a
            LEFT JOIN journal_entry_line jel ON jel.account_id = a.id $fundFilter
            LEFT JOIN journal_entry je ON je.id = jel.journal_entry_id
                AND je.is_posted = 1
                AND je.entry_date <= :end
            WHERE a.account_type = :type AND a.is_active = 1
            GROUP BY a.id
            HAVING balance != 0
            ORDER BY a.account_code ASC
        ");
        $p = $params;
        $p[':type'] = $type;
        $stmt->execute($p);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    };

    // Assets: debit balances (debit - credit)
    $assets = $fetchByType('Asset', 'COALESCE(SUM(jel.debit), 0) - COALESCE(SUM(jel.credit), 0)');
    // Liabilities: credit balances (credit - debit)
    $liabilities = $fetchByType('Liability', 'COALESCE(SUM(jel.credit), 0) - COALESCE(SUM(jel.debit), 0)');
    // Equity: credit balances (credit - debit)
    $equity = $fetchByType('Equity', 'COALESCE(SUM(jel.credit), 0) - COALESCE(SUM(jel.debit), 0)');

    // Calculate current period net income (Revenue - Expenses) and add to equity
    $niStmt = $db->prepare("
        SELECT 
            COALESCE((SELECT SUM(jel2.credit) - SUM(jel2.debit) 
                      FROM journal_entry_line jel2 
                      JOIN journal_entry je2 ON je2.id = jel2.journal_entry_id 
                      JOIN account a2 ON a2.id = jel2.account_id 
                      WHERE a2.account_type = 'Revenue' AND je2.is_posted = 1 AND je2.entry_date <= :end1), 0) -
            COALESCE((SELECT SUM(jel3.debit) - SUM(jel3.credit) 
                      FROM journal_entry_line jel3 
                      JOIN journal_entry je3 ON je3.id = jel3.journal_entry_id 
                      JOIN account a3 ON a3.id = jel3.account_id 
                      WHERE a3.account_type = 'Expense' AND je3.is_posted = 1 AND je3.entry_date <= :end2), 0) AS net_income
    ");
    $niStmt->execute([':end1' => $asOfDate, ':end2' => $asOfDate]);
    $netIncome = round((float)$niStmt->fetch(PDO::FETCH_ASSOC)['net_income'], 2);

    $totalAssets = 0;
    foreach ($assets as &$a) { $a['balance'] = round((float)$a['balance'], 2); $a['id'] = (int)$a['id']; $totalAssets += $a['balance']; }
    $totalLiabilities = 0;
    foreach ($liabilities as &$l) { $l['balance'] = round((float)$l['balance'], 2); $l['id'] = (int)$l['id']; $totalLiabilities += $l['balance']; }
    $totalEquity = 0;
    foreach ($equity as &$e) { $e['balance'] = round((float)$e['balance'], 2); $e['id'] = (int)$e['id']; $totalEquity += $e['balance']; }

    // Add net income to equity total
    $totalEquityWithIncome = round($totalEquity + $netIncome, 2);

    apiSuccess([
        'assets' => $assets,
        'liabilities' => $liabilities,
        'equity' => $equity,
        'total_assets' => round($totalAssets, 2),
        'total_liabilities' => round($totalLiabilities, 2),
        'total_equity' => round($totalEquity, 2),
        'net_income' => $netIncome,
        'total_liabilities_and_equity' => round($totalLiabilities + $totalEquityWithIncome, 2),
        'is_balanced' => abs($totalAssets - ($totalLiabilities + $totalEquityWithIncome)) < 0.01,
        'as_of_date' => $asOfDate,
        'fund_id' => $fundId,
    ], 'Balance sheet retrieved');

} catch (PDOException $e) {
    error_log("Balance sheet error: " . $e->getMessage());
    apiError('Failed to retrieve balance sheet', 500);
}
