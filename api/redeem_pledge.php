<?php
/**
 * Redeem Pledge
 * POST /api/redeem_pledge.php
 * Body: { pledge_id, redeemed_amount, mpesa_code?, payment_method?, date? }
 */
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/middleware.php';
require_once __DIR__ . '/JournalService.php';

$user = authenticate();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    apiError('Method not allowed', 405);
}

$body = getJsonBody();

$pledge_id = (int)($body['pledge_id'] ?? 0);
$redeemed_amount = (float)($body['redeemed_amount'] ?? 0);
$mpesa_code = trim($body['mpesa_code'] ?? '');
$payment_method = trim($body['payment_method'] ?? 'cash');
$date = trim($body['date'] ?? date('Y-m-d'));

if ($pledge_id <= 0 || $redeemed_amount <= 0) {
    apiError('Pledge ID and redeemed amount are required', 400);
}

try {
    // Verify pledge exists and get details
    $stmt = $db->prepare("SELECT * FROM pledges WHERE id = :id");
    $stmt->execute([':id' => $pledge_id]);
    $pledge = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$pledge) {
        apiError('Pledge not found', 404);
    }

    // Check remaining balance
    $redeemed = $db->prepare("SELECT COALESCE(SUM(redeemed_amount), 0) AS total FROM pledges_redeem WHERE pledge_id = :id");
    $redeemed->execute([':id' => $pledge_id]);
    $totalRedeemed = (float)$redeemed->fetch()['total'];
    $remaining = (float)$pledge['pledges_amount'] - $totalRedeemed;

    if ($redeemed_amount > $remaining + 0.01) {
        apiError("Amount exceeds remaining balance of KES " . number_format($remaining, 2), 400);
    }

    $db->beginTransaction();

    // Get next ID (table has no auto_increment)
    $maxId = (int)$db->query("SELECT COALESCE(MAX(id), 0) FROM pledges_redeem")->fetchColumn();
    $redeemId = $maxId + 1;

    $stmt = $db->prepare("
        INSERT INTO pledges_redeem (id, email, mpesa_code, pledge_id, phone_no, redeemed_amount, recorded_by)
        VALUES (:id, :email, :mpesa_code, :pledge_id, :phone_no, :amount, :recorded_by)
    ");
    $stmt->execute([
        ':id' => $redeemId,
        ':email' => $pledge['email'],
        ':mpesa_code' => $mpesa_code,
        ':pledge_id' => $pledge_id,
        ':phone_no' => $pledge['phone_no'] ?? '',
        ':amount' => $redeemed_amount,
        ':recorded_by' => $user->id,
    ]);

    // Create double-entry journal entry
    $js = new JournalService($db);
    $jeId = $js->recordPledgeRedemption($date, $redeemed_amount, $pledge['full_name'], $payment_method, $user->id, $redeemId);

    // Link journal entry
    $db->prepare("UPDATE pledges_redeem SET journal_entry_id = :je WHERE id = :id")->execute([':je' => $jeId, ':id' => $redeemId]);

    $js->audit('pledge_redeem', $redeemId, 'create', null, [
        'pledge_id' => $pledge_id,
        'pledger' => $pledge['full_name'],
        'amount' => $redeemed_amount,
        'payment_method' => $payment_method,
    ], $user->id);

    $db->commit();
    apiSuccess([
        'id' => $redeemId,
        'journal_entry_id' => $jeId,
        'remaining' => $remaining - $redeemed_amount,
    ], 'Pledge redeemed successfully');

} catch (Exception $e) {
    $db->rollBack();
    error_log("Redeem pledge error: " . $e->getMessage());
    apiError('Failed to redeem pledge', 500);
}
