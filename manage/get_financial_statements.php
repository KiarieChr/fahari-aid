<?php
// manage/get_financial_statements.php
ob_start();
require_once('../includes/checklogin.php');
ob_clean();
header('Content-Type: application/json; charset=utf-8');

try {
    $statementType = $_GET['type'] ?? 'all';
    $asOfDate = $_GET['as_of_date'] ?? date('Y-m-d');
    $startDate = $_GET['start_date'] ?? date('Y-01-01');
    $endDate = $_GET['end_date'] ?? date('Y-12-31');
    $fundId = !empty($_GET['fund_id']) ? (int)$_GET['fund_id'] : null;

    $response = [];

    // Helper to fetch account balances by type for Balance Sheet
    $fetchByType = function(string $type, string $balanceExpr, string $asOfDate, ?int $fundId) use ($db) {
        $fundFilter = '';
        $params = [':end' => $asOfDate];
        if ($fundId) {
            $fundFilter = " AND jel.fund_id = :fund_id";
            $params[':fund_id'] = $fundId;
        }

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

    // 1. Balance Sheet
    if ($statementType === 'balance_sheet' || $statementType === 'all') {
        $assets = $fetchByType('Asset', 'COALESCE(SUM(jel.debit), 0) - COALESCE(SUM(jel.credit), 0)', $asOfDate, $fundId);
        $liabilities = $fetchByType('Liability', 'COALESCE(SUM(jel.credit), 0) - COALESCE(SUM(jel.debit), 0)', $asOfDate, $fundId);
        $equity = $fetchByType('Equity', 'COALESCE(SUM(jel.credit), 0) - COALESCE(SUM(jel.debit), 0)', $asOfDate, $fundId);

        // Current period net income (Revenue - Expenses)
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

        $totalEquityWithIncome = round($totalEquity + $netIncome, 2);

        $response['balance_sheet'] = [
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
        ];
    }

    // 2. Income Statement
    if ($statementType === 'income_statement' || $statementType === 'all') {
        $fundFilter = '';
        $params = [':start' => $startDate, ':end' => $endDate];
        if ($fundId) {
            $fundFilter = " AND jel.fund_id = :fund_id";
            $params[':fund_id'] = $fundId;
        }

        // Revenues
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

        // Expenses
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

        $response['income_statement'] = [
            'revenue' => $revenueItems,
            'expenses' => $expenseItems,
            'total_revenue' => round($totalRevenue, 2),
            'total_expenses' => round($totalExpenses, 2),
            'net_income' => $netIncome,
            'period' => ['start_date' => $startDate, 'end_date' => $endDate]
        ];
    }

    // 3. Trial Balance
    if ($statementType === 'trial_balance' || $statementType === 'all') {
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

        $response['trial_balance'] = [
            'accounts' => $accounts,
            'total_debit' => round($totalDebit, 2),
            'total_credit' => round($totalCredit, 2),
            'is_balanced' => abs($totalDebit - $totalCredit) < 0.01,
            'period' => ['start_date' => $startDate, 'end_date' => $endDate],
        ];
    }

    echo json_encode([
        'success' => true,
        'data' => $response,
        'message' => 'Financial statements retrieved'
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage()
    ]);
}
?>
