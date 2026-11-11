<?php
/**
 * Get Expense Types (from expensetype table with linked GL accounts)
 * GET /api/get_expense_types.php
 */
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/middleware.php';

$user = authenticate();

try {
    $stmt = $db->query("
        SELECT et.id, et.name, et.gl_account_id,
               a.account_code, a.account_name,
               CONCAT(a.account_code, ' - ', et.name) AS display_name
        FROM expensetype et
        LEFT JOIN account a ON et.gl_account_id = a.id
        WHERE et.delete_status = 0
        ORDER BY a.account_code ASC, et.name ASC
    ");
    $types = $stmt->fetchAll(PDO::FETCH_ASSOC);
    apiSuccess(['types' => $types], 'Expense types retrieved');
} catch (PDOException $e) {
    error_log("Expense types error: " . $e->getMessage());
    apiError('Failed to retrieve expense types', 500);
}
