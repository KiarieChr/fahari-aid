<?php
/**
 * Get Accounting Periods
 * GET /api/get_accounting_periods.php
 */
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/middleware.php';

$user = authenticate();

try {
    $stmt = $db->query("
        SELECT ap.*,
               (SELECT COUNT(*) FROM journal_entry je WHERE je.accounting_period_id = ap.id) AS entry_count,
               (SELECT COALESCE(SUM(jel.debit), 0) 
                FROM journal_entry_line jel 
                JOIN journal_entry je ON je.id = jel.journal_entry_id 
                WHERE je.accounting_period_id = ap.id) AS total_debits
        FROM accounting_period ap
        ORDER BY ap.start_date DESC
    ");
    $periods = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($periods as &$p) {
        $p['id'] = (int)$p['id'];
        $p['is_closed'] = (bool)$p['is_closed'];
        $p['entry_count'] = (int)$p['entry_count'];
        $p['total_debits'] = (float)$p['total_debits'];
    }

    apiSuccess(['periods' => $periods], 'Accounting periods retrieved');

} catch (PDOException $e) {
    error_log("Accounting periods error: " . $e->getMessage());
    apiError('Failed to retrieve accounting periods', 500);
}
