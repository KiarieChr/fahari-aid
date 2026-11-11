<?php
/**
 * Add Expense
 * POST /api/add_expense.php
 */
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/middleware.php';
require_once __DIR__ . '/JournalService.php';

$user = authenticate();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    apiError('Method not allowed', 405);
}

$body = getJsonBody();

$expensetype = trim($body['expensetype'] ?? '');
$expensetype_id = (int)($body['expensetype_id'] ?? 0);
$amount = (float)($body['amount'] ?? 0);
$date = trim($body['date'] ?? '');
$description = trim($body['description'] ?? '');

if (empty($expensetype) || $amount <= 0 || empty($date)) {
    apiError('Expense type, amount, and date are required', 400);
}

try {
    $db->beginTransaction();

    // Look up GL account from expensetype table
    $gl_account_id = null;
    if ($expensetype_id > 0) {
        $glStmt = $db->prepare("SELECT gl_account_id FROM expensetype WHERE id = :id AND delete_status = 0");
        $glStmt->execute([':id' => $expensetype_id]);
        $gl_account_id = $glStmt->fetchColumn() ?: null;
    }

    $stmt = $db->prepare("INSERT INTO expense (branch, expensetype, amount, date, recurring, description, photo1, total_expense, delete_status) VALUES ('', :expensetype, :amount, :date, '', :description, '', 0, 0)");
    $stmt->execute([
        ':expensetype' => $expensetype,
        ':amount' => $amount,
        ':date' => $date,
        ':description' => $description
    ]);
    $expenseId = $db->lastInsertId();

    // Create double-entry journal entry
    $js = new JournalService($db);
    if ($gl_account_id) {
        $jeId = $js->recordExpenseByAccountId($date, $amount, (int)$gl_account_id, $expensetype, null, $description, $user->id, (int)$expenseId);
    } else {
        $jeId = $js->recordExpense($date, $amount, $expensetype, null, $description, $user->id, (int)$expenseId);
    }

    // Link journal entry back to expense record
    $db->prepare("UPDATE expense SET journal_entry_id = :je WHERE id = :id")->execute([':je' => $jeId, ':id' => $expenseId]);

    $js->audit('expense', (int)$expenseId, 'create', null, ['expensetype' => $expensetype, 'amount' => $amount, 'date' => $date], $user->id);

    $db->commit();
    apiSuccess(['id' => $expenseId, 'journal_entry_id' => $jeId], 'Expense recorded successfully');

} catch (Exception $e) {
    $db->rollBack();
    error_log("Add expense error: " . $e->getMessage());
    apiError('Failed to record expense', 500);
}
