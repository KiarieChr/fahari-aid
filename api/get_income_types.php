<?php
/**
 * Get Income Types (from incometype table with linked GL accounts)
 * GET /api/get_income_types.php
 */
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/middleware.php';

$user = authenticate();

try {
    $stmt = $db->query("
        SELECT it.id, it.name, it.gl_account_id,
               a.account_code, a.account_name,
               CONCAT(a.account_code, ' - ', it.name) AS display_name
        FROM incometype it
        LEFT JOIN account a ON it.gl_account_id = a.id
        WHERE it.delete_status = 0
        ORDER BY a.account_code ASC, it.name ASC
    ");
    $types = $stmt->fetchAll(PDO::FETCH_ASSOC);
    apiSuccess(['types' => $types], 'Income types retrieved');
} catch (PDOException $e) {
    error_log("Income types error: " . $e->getMessage());
    apiError('Failed to retrieve income types', 500);
}
