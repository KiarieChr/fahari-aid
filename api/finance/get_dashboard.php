<?php
/**
 * Get Finance Dashboard API
 * GET /api/finance/get_dashboard.php
 */

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../middleware.php';

// Require authentication
$user = authenticate();

try {
    $data = [];
    
    // 1. Total Receivables (Pending Pledges)
    // Could also include invoices if they existed, but we'll use pledges for now
    $stmt = $db->query("
        SELECT COALESCE(SUM(pledges_amount - COALESCE((SELECT SUM(redeemed_amount) FROM pledges_redeem WHERE pledge_id = p.id), 0)), 0) AS total_receivables
        FROM pledges p
        WHERE p.status != 'cancelled'
    ");
    $data['total_receivables'] = (float)$stmt->fetchColumn();
    
    // 2. Total Payables (Unpaid Bills)
    $stmt = $db->query("
        SELECT COALESCE(SUM(balance_due), 0) AS total_payables
        FROM bills
        WHERE status != 'paid' AND delete_status = 0
    ");
    $data['total_payables'] = (float)$stmt->fetchColumn();
    
    // 3. Asset Valuation
    $stmt = $db->query("
        SELECT COALESCE(SUM(CAST(REPLACE(value_amount, ',', '') AS DECIMAL(15,2))), 0) AS total_assets
        FROM asset
        WHERE delete_status = 0
    ");
    $data['total_assets'] = (float)$stmt->fetchColumn();
    
    // 4. Cash Flow / Income vs Expense (Current Year)
    // Calculate from journal entries mapped to Revenue and Expense accounts
    $stmt = $db->query("
        SELECT 
            MONTH(je.entry_date) as month,
            SUM(CASE WHEN a.account_type = 'Revenue' THEN jel.credit - jel.debit ELSE 0 END) as income,
            SUM(CASE WHEN a.account_type = 'Expense' THEN jel.debit - jel.credit ELSE 0 END) as expense
        FROM journal_entry je
        JOIN journal_entry_line jel ON je.id = jel.journal_entry_id
        JOIN account a ON jel.account_id = a.id
        WHERE YEAR(je.entry_date) = YEAR(CURDATE())
          AND je.is_posted = 1
        GROUP BY MONTH(je.entry_date)
        ORDER BY month ASC
    ");
    
    $monthlyData = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $cashflow = array_fill(1, 12, ['income' => 0, 'expense' => 0]);
    foreach ($monthlyData as $row) {
        $cashflow[(int)$row['month']] = [
            'income' => (float)$row['income'],
            'expense' => (float)$row['expense']
        ];
    }
    
    // Convert to array of objects for Recharts
    $months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    $data['cashflow'] = [];
    for ($i = 1; $i <= 12; $i++) {
        $data['cashflow'][] = [
            'name' => $months[$i - 1],
            'income' => $cashflow[$i]['income'],
            'expense' => $cashflow[$i]['expense']
        ];
    }
    
    apiSuccess($data, 'Finance dashboard retrieved successfully');
    
} catch (PDOException $e) {
    error_log("Finance Dashboard error: " . $e->getMessage());
    apiError('Failed to retrieve finance dashboard data', 500);
}
