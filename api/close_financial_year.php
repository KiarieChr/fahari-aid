<?php
/**
 * Close Financial Year (Accounting Period)
 * POST /api/close_financial_year.php
 * Body: { period_id }
 * 
 * Closes an accounting period:
 * 1. Creates closing journal entry (Revenue/Expense → Retained Surplus)
 * 2. Marks the period as closed
 */
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/middleware.php';
require_once __DIR__ . '/JournalService.php';

$user = authenticate();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    apiError('Method not allowed', 405);
}

$body = getJsonBody();
$periodId = (int)($body['period_id'] ?? 0);

if ($periodId <= 0) {
    apiError('period_id is required', 400);
}

try {
    // Get period
    $stmt = $db->prepare("SELECT * FROM accounting_period WHERE id = :id");
    $stmt->execute([':id' => $periodId]);
    $period = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$period) apiError('Period not found', 404);
    if ($period['is_closed']) apiError('Period is already closed', 400);

    $db->beginTransaction();
    $js = new JournalService($db);

    // Sum all revenue accounts for the period
    $revStmt = $db->prepare("
        SELECT a.id, COALESCE(SUM(jel.credit) - SUM(jel.debit), 0) AS balance
        FROM account a
        JOIN journal_entry_line jel ON jel.account_id = a.id
        JOIN journal_entry je ON je.id = jel.journal_entry_id
        WHERE a.account_type = 'Revenue' AND je.is_posted = 1
          AND je.entry_date BETWEEN :start AND :end
        GROUP BY a.id
        HAVING balance != 0
    ");
    $revStmt->execute([':start' => $period['start_date'], ':end' => $period['end_date']]);
    $revenueAccounts = $revStmt->fetchAll(PDO::FETCH_ASSOC);

    // Sum all expense accounts for the period
    $expStmt = $db->prepare("
        SELECT a.id, COALESCE(SUM(jel.debit) - SUM(jel.credit), 0) AS balance
        FROM account a
        JOIN journal_entry_line jel ON jel.account_id = a.id
        JOIN journal_entry je ON je.id = jel.journal_entry_id
        WHERE a.account_type = 'Expense' AND je.is_posted = 1
          AND je.entry_date BETWEEN :start AND :end
        GROUP BY a.id
        HAVING balance != 0
    ");
    $expStmt->execute([':start' => $period['start_date'], ':end' => $period['end_date']]);
    $expenseAccounts = $expStmt->fetchAll(PDO::FETCH_ASSOC);

    $retainedSurplusId = $js->getAccountByCode('3100'); // Retained Surplus

    $lines = [];
    $totalRevenue = 0;
    $totalExpenses = 0;

    // Close revenue: Debit Revenue, Credit Retained Surplus
    foreach ($revenueAccounts as $rev) {
        $bal = round((float)$rev['balance'], 2);
        if ($bal == 0) continue;
        $totalRevenue += $bal;
        $lines[] = [
            'account_id' => (int)$rev['id'],
            'debit' => $bal,
            'credit' => 0,
            'description' => 'Year-end close: Revenue to Retained Surplus'
        ];
    }

    // Close expenses: Credit Expense, Debit Retained Surplus
    foreach ($expenseAccounts as $exp) {
        $bal = round((float)$exp['balance'], 2);
        if ($bal == 0) continue;
        $totalExpenses += $bal;
        $lines[] = [
            'account_id' => (int)$exp['id'],
            'debit' => 0,
            'credit' => $bal,
            'description' => 'Year-end close: Expense to Retained Surplus'
        ];
    }

    // Net to Retained Surplus
    $netIncome = round($totalRevenue - $totalExpenses, 2);
    if ($netIncome > 0) {
        // Surplus: Credit Retained Surplus
        $lines[] = [
            'account_id' => $retainedSurplusId,
            'debit' => 0,
            'credit' => $totalRevenue,
            'description' => 'Year-end: Revenue closed'
        ];
        $lines[] = [
            'account_id' => $retainedSurplusId,
            'debit' => $totalExpenses,
            'credit' => 0,
            'description' => 'Year-end: Expenses closed'
        ];
    } elseif ($netIncome < 0) {
        // Deficit
        $lines[] = [
            'account_id' => $retainedSurplusId,
            'debit' => 0,
            'credit' => $totalRevenue,
            'description' => 'Year-end: Revenue closed'
        ];
        $lines[] = [
            'account_id' => $retainedSurplusId,
            'debit' => $totalExpenses,
            'credit' => 0,
            'description' => 'Year-end: Expenses closed'
        ];
    }

    if (!empty($lines)) {
        $js->createEntry(
            $period['end_date'],
            "Year-end closing entry for " . $period['name'],
            'adjustment',
            null,
            $user->id,
            $lines
        );
    }

    // Mark period as closed
    $db->prepare("UPDATE accounting_period SET is_closed = 1, closed_by = :user, closed_at = NOW() WHERE id = :id")
        ->execute([':user' => $user->id, ':id' => $periodId]);

    $js->audit('accounting_period', $periodId, 'close', ['is_closed' => 0], ['is_closed' => 1], $user->id);

    $db->commit();

    apiSuccess([
        'period_id' => $periodId,
        'net_income' => $netIncome,
        'total_revenue_closed' => $totalRevenue,
        'total_expenses_closed' => $totalExpenses,
    ], 'Financial year closed successfully');

} catch (Exception $e) {
    $db->rollBack();
    error_log("Close year error: " . $e->getMessage());
    apiError('Failed to close financial year: ' . $e->getMessage(), 500);
}
