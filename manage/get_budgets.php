<?php
// manage/get_budgets.php
ob_start();
require_once('../includes/checklogin.php');
ob_clean();
header('Content-Type: application/json; charset=utf-8');

try {
    $sql = "
        SELECT b.id, b.budget_name, b.budget_purpose, b.is_active, b.created_at,
               COALESCE((SELECT SUM(bd.amount) FROM budget_details bd WHERE bd.budget_id = b.id), 0) AS total_allocated,
               COALESCE((SELECT COUNT(*) FROM budget_details bd WHERE bd.budget_id = b.id), 0) AS item_count
        FROM budget b
        ORDER BY b.created_at DESC
    ";
    $stmt = $db->query($sql);
    $budgets = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($budgets as &$b) {
        $b['total_allocated'] = (float)$b['total_allocated'];
        $b['total_spent'] = 0; // No spending tracking table linked to budgets yet
        $b['is_active'] = (bool)$b['is_active'];
        $b['item_count'] = (int)$b['item_count'];
    }

    echo json_encode([
        'success' => true,
        'data' => [
            'budgets' => $budgets
        ],
        'message' => 'Budgets retrieved'
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage()
    ]);
}
?>
