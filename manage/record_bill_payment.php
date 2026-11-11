<?php
// manage/record_bill_payment.php
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

$billId = (int)($body['bill_id'] ?? 0);
$amount = (float)($body['amount'] ?? 0);
$paymentDate = trim($body['payment_date'] ?? '');
$paymentMethod = trim($body['payment_method'] ?? '');
$referenceNo = trim($body['reference_no'] ?? '');
$notes = trim($body['notes'] ?? '');

if ($billId <= 0 || $amount <= 0 || empty($paymentDate) || empty($paymentMethod)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Bill ID, payment amount, payment date, and payment method are required.']);
    exit();
}

try {
    $db->beginTransaction();

    $js = new JournalService($db);

    // 1. Verify bill exists and is not fully paid
    $billStmt = $db->prepare("SELECT * FROM bills WHERE id = :id AND delete_status = 0 FOR UPDATE");
    $billStmt->execute([':id' => $billId]);
    $bill = $billStmt->fetch(PDO::FETCH_ASSOC);

    if (!$bill) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Bill not found.']);
        $db->rollBack();
        exit();
    }

    if ($bill['status'] === 'paid' || $bill['balance_due'] <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'This bill has already been fully paid.']);
        $db->rollBack();
        exit();
    }

    if (round($amount, 2) > round($bill['balance_due'], 2)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Payment amount exceeds the remaining balance due: KES ' . number_format($bill['balance_due'], 2)]);
        $db->rollBack();
        exit();
    }

    // 2. Insert payment record into bill_payments
    $paymentStmt = $db->prepare("
        INSERT INTO bill_payments (bill_id, payment_date, payment_method, amount, reference_no, notes, recorded_by, recorded_on)
        VALUES (:bill_id, :payment_date, :payment_method, :amount, :reference_no, :notes, :recorded_by, NOW())
    ");
    $paymentStmt->execute([
        ':bill_id' => $billId,
        ':payment_date' => $paymentDate,
        ':payment_method' => $paymentMethod,
        ':amount' => $amount,
        ':reference_no' => $referenceNo ?: null,
        ':notes' => $notes ?: null,
        ':recorded_by' => $user_id
    ]);
    $paymentId = (int)$db->lastInsertId();

    // 3. Recalculate bill balance_due and update status
    $newBalance = round($bill['balance_due'] - $amount, 2);
    $newStatus = ($newBalance <= 0) ? 'paid' : 'partially_paid';

    $updateBillStmt = $db->prepare("
        UPDATE bills 
        SET balance_due = :balance, status = :status 
        WHERE id = :id
    ");
    $updateBillStmt->execute([
        ':balance' => $newBalance,
        ':status' => $newStatus,
        ':id' => $billId
    ]);

    // 4. Call JournalService::recordBillPayment()
    $jeId = $js->recordBillPayment($paymentDate, $amount, $bill['vendor_name'], $bill['bill_number'], $paymentMethod, $user_id, $paymentId);

    // 5. Link payment with journal_entry_id
    $db->prepare("UPDATE bill_payments SET journal_entry_id = :je_id WHERE id = :id")->execute([
        ':je_id' => $jeId,
        ':id' => $paymentId
    ]);

    // 6. If bill is linked to an event_budget_item_id, and status becomes 'paid' (fully paid)
    if ($bill['event_budget_item_id'] && $newStatus === 'paid') {
        $updateEventItemStmt = $db->prepare("
            UPDATE event_budget_item 
            SET status = 'paid', 
                actual_amount = :actual_amount, 
                payment_date = :payment_date, 
                payment_method = :payment_method, 
                journal_entry_id = :je_id,
                updated_at = NOW()
            WHERE id = :id
        ");
        $updateEventItemStmt->execute([
            ':actual_amount' => $bill['amount'], // total bill amount
            ':payment_date' => $paymentDate,
            ':payment_method' => $paymentMethod,
            ':je_id' => $jeId,
            ':id' => $bill['event_budget_item_id']
        ]);

        // Get event_budget_id for recalculating total_actual
        $ebStmt = $db->prepare("SELECT event_budget_id FROM event_budget_item WHERE id = :id");
        $ebStmt->execute([':id' => $bill['event_budget_item_id']]);
        $eventBudgetId = (int)$ebStmt->fetchColumn();

        if ($eventBudgetId > 0) {
            // Recalculate event_budget total_actual
            $db->prepare("
                UPDATE event_budget 
                SET total_actual = COALESCE((SELECT SUM(COALESCE(actual_amount, 0)) FROM event_budget_item WHERE event_budget_id = :id1 AND status = 'paid'), 0)
                WHERE id = :id2
            ")->execute([':id1' => $eventBudgetId, ':id2' => $eventBudgetId]);

            // Insert audit record into event_budget_audit
            $db->prepare("
                INSERT INTO event_budget_audit (event_budget_id, action, details, performed_by)
                VALUES (:id, 'updated', :details, :uid)
            ")->execute([
                ':id' => $eventBudgetId,
                ':details' => "Bill payment completed. Item status updated to paid. Total Bill: KES " . number_format($bill['amount'], 2),
                ':uid' => $user_id
            ]);
        }
    }

    // 7. Write audit log
    $js->audit('bill_payments', $paymentId, 'create', null, [
        'bill_id' => $billId,
        'amount' => $amount,
        'payment_date' => $paymentDate,
        'payment_method' => $paymentMethod,
        'reference_no' => $referenceNo,
        'notes' => $notes
    ], $user_id);

    $db->commit();

    echo json_encode([
        'success' => true,
        'payment_id' => $paymentId,
        'journal_entry_id' => $jeId,
        'new_balance' => $newBalance,
        'new_status' => $newStatus,
        'message' => 'Payment recorded successfully'
    ]);

} catch (Exception $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to record bill payment: ' . $e->getMessage()
    ]);
}
?>
