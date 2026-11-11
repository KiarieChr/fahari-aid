<?php
// manage/record_bill.php
ob_start();
require_once('../includes/checklogin.php');
ob_clean();
header('Content-Type: application/json; charset=utf-8');
require_once('../api/JournalService.php');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit();
}

$json = file_get_contents('php://input');
$body = json_decode($json, true);
if (json_last_error() !== JSON_ERROR_NONE || empty($body)) {
    $body = $_POST;
}

$vendorName = trim($body['vendor_name'] ?? '');
$billNumber = trim($body['bill_number'] ?? '');
$billDate = trim($body['bill_date'] ?? '');
$dueDate = trim($body['due_date'] ?? '');
$amount = (float)($body['amount'] ?? 0);
$glAccountId = (int)($body['gl_account_id'] ?? 0);
$description = trim($body['description'] ?? '');
$eventId = !empty($body['event_id']) ? (int)$body['event_id'] : null;
$eventBudgetItemId = !empty($body['event_budget_item_id']) ? (int)$body['event_budget_item_id'] : null;

if (empty($vendorName) || empty($billNumber) || empty($billDate) || empty($dueDate) || $amount <= 0 || $glAccountId <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Vendor name, bill number, bill date, due date, amount, and expense GL account are required.']);
    exit();
}

try {
    $db->beginTransaction();

    $js = new JournalService($db);

    // 1. Insert bill record
    $stmt = $db->prepare("
        INSERT INTO bills (vendor_name, bill_number, bill_date, due_date, amount, balance_due, description, gl_account_id, status, event_id, event_budget_item_id, recorded_by, recorded_on)
        VALUES (:vendor_name, :bill_number, :bill_date, :due_date, :amount, :balance_due, :description, :gl_account_id, 'unpaid', :event_id, :event_budget_item_id, :recorded_by, NOW())
    ");
    $stmt->execute([
        ':vendor_name' => $vendorName,
        ':bill_number' => $billNumber,
        ':bill_date' => $billDate,
        ':due_date' => $dueDate,
        ':amount' => $amount,
        ':balance_due' => $amount,
        ':description' => $description ?: null,
        ':gl_account_id' => $glAccountId,
        ':event_id' => $eventId ?: null,
        ':event_budget_item_id' => $eventBudgetItemId ?: null,
        ':recorded_by' => $user_id
    ]);
    $billId = (int)$db->lastInsertId();

    // 2. Call JournalService::recordBill()
    $jeId = $js->recordBill($billDate, $amount, $glAccountId, $vendorName, $billNumber, $description ?: "Bill $billNumber from $vendorName", $user_id, $billId);

    // 3. Update bill table with journal_entry_id
    $db->prepare("UPDATE bills SET journal_entry_id = :je_id WHERE id = :id")->execute([
        ':je_id' => $jeId,
        ':id' => $billId
    ]);

    // 4. Write audit log
    $js->audit('bills', $billId, 'create', null, [
        'vendor_name' => $vendorName,
        'bill_number' => $billNumber,
        'amount' => $amount,
        'gl_account_id' => $glAccountId,
        'event_id' => $eventId,
        'event_budget_item_id' => $eventBudgetItemId
    ], $user_id);

    $db->commit();

    echo json_encode([
        'success' => true,
        'bill_id' => $billId,
        'journal_entry_id' => $jeId,
        'message' => 'Bill recorded successfully'
    ]);

} catch (Exception $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to record bill: ' . $e->getMessage()
    ]);
}
?>
