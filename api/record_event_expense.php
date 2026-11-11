<?php
/**
 * Record Event Expense (Payment)
 * POST /api/record_event_expense.php
 * 
 * Marks a budget item as paid, records the actual amount,
 * and creates a double-entry journal entry via JournalService.
 * 
 * Body: {
 *   item_id, actual_amount, payment_date, payment_method?,
 *   receipt_ref?, vendor?, notes?
 * }
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/middleware.php';
require_once __DIR__ . '/JournalService.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    apiError('Method not allowed', 405);
}

$user = authenticate();
$body = getJsonBody();

$itemId = (int)($body['item_id'] ?? 0);
$actualAmount = (float)($body['actual_amount'] ?? 0);
$paymentDate = trim($body['payment_date'] ?? '');
$paymentMethod = trim($body['payment_method'] ?? '');
$receiptRef = trim($body['receipt_ref'] ?? '');
$vendor = trim($body['vendor'] ?? '');
$notes = trim($body['notes'] ?? '');

if ($itemId <= 0 || $actualAmount <= 0 || empty($paymentDate)) {
    apiError('Item ID, actual amount, and payment date are required', 400);
}

// Validate date format
if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $paymentDate)) {
    apiError('Payment date must be YYYY-MM-DD', 400);
}

try {
    // Get item + budget
    $stmt = $db->prepare("
        SELECT ebi.*, eb.event_id, eb.status AS budget_status, eb.budget_name, e.ename
        FROM event_budget_item ebi
        JOIN event_budget eb ON eb.id = ebi.event_budget_id
        JOIN event e ON e.id = eb.event_id
        WHERE ebi.id = :id
    ");
    $stmt->execute([':id' => $itemId]);
    $item = $stmt->fetch();

    if (!$item) apiError('Budget item not found', 404);
    if ($item['budget_status'] !== 'approved') {
        apiError('Budget must be approved before recording expenses', 400);
    }
    if ($item['status'] === 'paid') {
        apiError('This item has already been paid', 400);
    }
    if ($item['status'] === 'cancelled') {
        apiError('Cannot pay a cancelled item', 400);
    }

    $db->beginTransaction();

    // Resolve GL accounts
    $expenseAccountId = $item['gl_account_id'];
    if (!$expenseAccountId) {
        // Fallback to parent 5030
        $js = new JournalService($db);
        $expenseAccountId = $js->getAccountByCode('5030');
    }

    // Create journal entry: Debit expense account, Credit cash/bank
    $js = new JournalService($db);
    $description = "Event expense: {$item['description']} ({$item['ename']})";

    $jeId = $js->createEntry(
        $paymentDate,
        $description,
        'event_expense',
        $itemId,
        $user->id,
        [
            [
                'account_id' => $expenseAccountId,
                'debit' => $actualAmount,
                'credit' => 0,
                'description' => "{$item['category']}: {$item['description']}",
                'fund_id' => null
            ],
            [
                'account_id' => $js->getAccountByCode(mapPaymentToCode($paymentMethod)),
                'debit' => 0,
                'credit' => $actualAmount,
                'description' => "Paid via " . ($paymentMethod ?: 'cash'),
                'fund_id' => null
            ]
        ]
    );

    // Update item
    $db->prepare("
        UPDATE event_budget_item SET
            actual_amount = :amount,
            payment_date = :pdate,
            payment_method = :pmethod,
            receipt_ref = :receipt,
            vendor = COALESCE(NULLIF(:vendor, ''), vendor),
            journal_entry_id = :je_id,
            status = 'paid',
            notes = CASE WHEN :notes != '' THEN :notes2 ELSE notes END
        WHERE id = :id
    ")->execute([
        ':amount' => $actualAmount,
        ':pdate' => $paymentDate,
        ':pmethod' => $paymentMethod ?: null,
        ':receipt' => $receiptRef ?: null,
        ':vendor' => $vendor,
        ':je_id' => $jeId,
        ':notes' => $notes,
        ':notes2' => $notes,
        ':id' => $itemId
    ]);

    // Recalculate budget totals
    $db->prepare("
        UPDATE event_budget SET
            total_actual = COALESCE((SELECT SUM(COALESCE(actual_amount, 0)) FROM event_budget_item WHERE event_budget_id = :bid AND status = 'paid'), 0)
        WHERE id = :bid2
    ")->execute([':bid' => $item['event_budget_id'], ':bid2' => $item['event_budget_id']]);

    // Audit
    $db->prepare("
        INSERT INTO event_budget_audit (event_budget_id, action, details, performed_by)
        VALUES (:bid, 'expense_recorded', :details, :uid)
    ")->execute([
        ':bid' => $item['event_budget_id'],
        ':details' => "Paid: {$item['description']} - KES " . number_format($actualAmount, 2) . " via " . ($paymentMethod ?: 'cash') . " (JE #{$jeId})",
        ':uid' => $user->id
    ]);

    $db->commit();

    apiSuccess([
        'item_id' => $itemId,
        'journal_entry_id' => $jeId,
        'actual_amount' => $actualAmount,
        'variance' => $actualAmount - (float)$item['estimated_amount']
    ], 'Expense recorded and journal entry created');

} catch (\Exception $e) {
    if ($db->inTransaction()) $db->rollBack();
    error_log("Record event expense error: " . $e->getMessage());
    apiError('Failed to record expense: ' . $e->getMessage(), 500);
}

function mapPaymentToCode(string $method): string {
    $lc = strtolower(trim($method));
    if (str_contains($lc, 'mpesa') || str_contains($lc, 'm-pesa') || str_contains($lc, 'mobile')) return '1020';
    if (str_contains($lc, 'bank') || str_contains($lc, 'transfer')) return '1010';
    if (str_contains($lc, 'online') || str_contains($lc, 'card')) return '1030';
    return '1000'; // Default: Cash
}
