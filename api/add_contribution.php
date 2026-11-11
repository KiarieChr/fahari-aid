<?php
/**
 * Add Contribution
 * POST /api/add_contribution.php
 */
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/middleware.php';
require_once __DIR__ . '/JournalService.php';

$user = authenticate();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    apiError('Method not allowed', 405);
}

$body = getJsonBody();

$member = trim($body['member'] ?? '');
$contritype = trim($body['contritype'] ?? '');
$fund = trim($body['fund'] ?? '');
$amount = (float)($body['amount'] ?? 0);
$paymentmethod = trim($body['paymentmethod'] ?? '');
$date = trim($body['date'] ?? '');

if (empty($member) || empty($contritype) || $amount <= 0 || empty($date)) {
    apiError('Member, contribution type, amount, and date are required', 400);
}

try {
    $db->beginTransaction();

    $stmt = $db->prepare("INSERT INTO contribution (branch, member, amount, batch, contritype, fund, paymentmethod, date, payment_id, total, status, delete_status) VALUES ('', :member, :amount, '', :contritype, :fund, :paymentmethod, :date, 0, 0, 0, 0)");
    $stmt->execute([
        ':member' => $member,
        ':amount' => $amount,
        ':contritype' => $contritype,
        ':fund' => $fund,
        ':paymentmethod' => $paymentmethod,
        ':date' => $date
    ]);
    $contriId = $db->lastInsertId();

    // Also add to contribution_details
    $stmt = $db->prepare("INSERT INTO contribution_details (contribution_id, amount, batch, contritype, fund, paymentmethod, delete_status) VALUES (:id, :amount, '', :contritype, :fund, :paymentmethod, 0)");
    $stmt->execute([
        ':id' => $contriId,
        ':amount' => $amount,
        ':contritype' => $contritype,
        ':fund' => $fund,
        ':paymentmethod' => $paymentmethod
    ]);

    // Create double-entry journal entry
    $js = new JournalService($db);
    $jeId = $js->recordContribution($date, $amount, $contritype, $paymentmethod, $member, $user->id, (int)$contriId);

    // Link journal entry back to contribution record
    $db->prepare("UPDATE contribution SET journal_entry_id = :je WHERE id = :id")->execute([':je' => $jeId, ':id' => $contriId]);

    $js->audit('contribution', (int)$contriId, 'create', null, ['member' => $member, 'contritype' => $contritype, 'amount' => $amount, 'date' => $date], $user->id);

    $db->commit();
    apiSuccess(['id' => $contriId, 'journal_entry_id' => $jeId], 'Contribution recorded successfully');

} catch (Exception $e) {
    $db->rollBack();
    error_log("Add contribution error: " . $e->getMessage());
    apiError('Failed to record contribution', 500);
}
