<?php
/**
 * Add Income
 * POST /api/add_income.php
 */
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/middleware.php';
require_once __DIR__ . '/JournalService.php';

$user = authenticate();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    apiError('Method not allowed', 405);
}

$body = getJsonBody();

$incometype = trim($body['incometype'] ?? '');
$incometype_id = (int)($body['incometype_id'] ?? 0);
$amount = (float)($body['amount'] ?? 0);
$date = trim($body['date'] ?? '');
$description = trim($body['description'] ?? '');

if (empty($incometype) || $amount <= 0 || empty($date)) {
    apiError('Income type, amount, and date are required', 400);
}

try {
    $db->beginTransaction();

    // Look up GL account from incometype table
    $gl_account_id = null;
    if ($incometype_id > 0) {
        $glStmt = $db->prepare("SELECT gl_account_id FROM incometype WHERE id = :id AND delete_status = 0");
        $glStmt->execute([':id' => $incometype_id]);
        $gl_account_id = $glStmt->fetchColumn() ?: null;
    }

    $stmt = $db->prepare("INSERT INTO income (branch, incometype, amount, date, description, photo1, total_income, delete_status) VALUES ('', :incometype, :amount, :date, :description, '', 0, 0)");
    $stmt->execute([
        ':incometype' => $incometype,
        ':amount' => $amount,
        ':date' => $date,
        ':description' => $description
    ]);
    $incomeId = $db->lastInsertId();

    // Create double-entry journal entry
    $js = new JournalService($db);
    if ($gl_account_id) {
        $jeId = $js->recordIncomeByAccountId($date, $amount, (int)$gl_account_id, $incometype, null, $description, $user->id, (int)$incomeId);
    } else {
        $jeId = $js->recordIncome($date, $amount, $incometype, null, $description, $user->id, (int)$incomeId);
    }

    // Link journal entry back to income record
    $db->prepare("UPDATE income SET journal_entry_id = :je WHERE id = :id")->execute([':je' => $jeId, ':id' => $incomeId]);

    $js->audit('income', (int)$incomeId, 'create', null, ['incometype' => $incometype, 'amount' => $amount, 'date' => $date], $user->id);

    $db->commit();
    apiSuccess(['id' => $incomeId, 'journal_entry_id' => $jeId], 'Income recorded successfully');

} catch (Exception $e) {
    $db->rollBack();
    error_log("Add income error: " . $e->getMessage());
    apiError('Failed to record income', 500);
}
