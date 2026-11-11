<?php
// manage/add_budget.php
ob_start();
require_once('../includes/checklogin.php');
ob_clean();
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit();
}

// Get request body (JSON or form data)
$json = file_get_contents('php://input');
$body = json_decode($json, true);
if (json_last_error() !== JSON_ERROR_NONE || empty($body)) {
    $body = $_POST;
}

$budgetName = trim($body['budget_name'] ?? '');
$budgetPurpose = trim($body['budget_purpose'] ?? '');
$items = $body['items'] ?? [];

if (empty($budgetName)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Budget name is required']);
    exit();
}

try {
    $db->beginTransaction();

    // $user_id is defined in checklogin.php
    $stmt = $db->prepare("INSERT INTO budget (budget_name, budget_purpose, is_active, reference_doc, created_by, update_by, created_at, updated_at) VALUES (:name, :purpose, 1, 0, :user_id, :user_id, NOW(), NOW())");
    $stmt->execute([
        ':name' => $budgetName,
        ':purpose' => $budgetPurpose,
        ':user_id' => $user_id
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
                    ':user_id' => $user_id
                ]);
            }
        }
    }

    $db->commit();
    echo json_encode([
        'success' => true,
        'data' => ['id' => $budgetId],
        'message' => 'Budget created successfully'
    ]);

} catch (PDOException $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to create budget: ' . $e->getMessage()
    ]);
}
?>
