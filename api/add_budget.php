<?php
/**
 * Add Budget
 * POST /api/add_budget.php
 */
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/middleware.php';

$user = authenticate();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    apiError('Method not allowed', 405);
}

$body = getJsonBody();

$budgetName = trim($body['budget_name'] ?? '');
$budgetPurpose = trim($body['budget_purpose'] ?? '');
$items = $body['items'] ?? [];

if (empty($budgetName)) {
    apiError('Budget name is required', 400);
}

try {
    $db->beginTransaction();

    $stmt = $db->prepare("INSERT INTO budget (budget_name, budget_purpose, is_active, reference_doc, created_by, update_by, created_at, updated_at) VALUES (:name, :purpose, 1, 0, :user_id, :user_id, NOW(), NOW())");
    $stmt->execute([
        ':name' => $budgetName,
        ':purpose' => $budgetPurpose,
        ':user_id' => $user['id']
    ]);
    $budgetId = $db->lastInsertId();

    // Add line items
    if (!empty($items)) {
        $itemStmt = $db->prepare("INSERT INTO budget_details (budget_id, description, amount, created_on, created_by, updated_on, category) VALUES (:budget_id, :description, :amount, NOW(), :user_id, NOW(), 0)");
        foreach ($items as $item) {
            if (!empty($item['description']) && !empty($item['amount'])) {
                $itemStmt->execute([
                    ':budget_id' => $budgetId,
                    ':description' => trim($item['description']),
                    ':amount' => (float)$item['amount'],
                    ':user_id' => $user['id']
                ]);
            }
        }
    }

    $db->commit();
    apiSuccess(['id' => $budgetId], 'Budget created successfully');

} catch (PDOException $e) {
    $db->rollBack();
    error_log("Add budget error: " . $e->getMessage());
    apiError('Failed to create budget', 500);
}
