<?php
/**
 * Public Redeem Pledge (Paystack Verification)
 * POST /api/public_redeem_pledge.php
 * Body: { pledge_id, amount, reference, email }
 */
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/JournalService.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    apiError('Method not allowed', 405);
}

$body = getJsonBody();

$pledge_id = (int)($body['pledge_id'] ?? 0);
$amount = (float)($body['amount'] ?? 0);
$reference = trim($body['reference'] ?? '');
$email = trim($body['email'] ?? '');
$date = date('Y-m-d');
$payment_method = 'Paystack';

if ($pledge_id <= 0 || $amount <= 0 || empty($reference)) {
    apiError('Pledge ID, amount, and payment reference are required', 400);
}

try {
    // 1. Verify payment with Paystack
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, "https://api.paystack.co/transaction/verify/" . rawurlencode($reference));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Authorization: Bearer " . PAYSTACK_SECRET_KEY,
        "Cache-Control: no-cache"
    ]);
    
    $response = curl_exec($ch);
    $err = curl_error($ch);
    curl_close($ch);

    if ($err) {
        throw new Exception("Paystack curl error: " . $err);
    }

    $tranx = json_decode($response, true);
    if (!$tranx || !$tranx['status']) {
        // Handle specific failure where status is false but message gives detail
        $msg = $tranx['message'] ?? 'API connection error';
        apiError("Paystack Verification Failed: " . $msg, 400);
    }

    if ($tranx['data']['status'] !== 'success') {
        apiError("Transaction was not successful", 400);
    }

    // Verify amount (Paystack amount is in kobo/cents)
    $paystack_amount = $tranx['data']['amount'] / 100;
    if (abs($paystack_amount - $amount) > 0.01) {
        apiError("Payment amount mismatch", 400);
    }

    // 2. Process Redemption in DB
    $stmt = $db->prepare("SELECT * FROM pledges WHERE id = :id");
    $stmt->execute([':id' => $pledge_id]);
    $pledge = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$pledge) {
        apiError('Pledge not found', 404);
    }

    // Check if reference was already used
    $checkRef = $db->prepare("SELECT id FROM pledges_redeem WHERE mpesa_code = :ref");
    $checkRef->execute([':ref' => $reference]);
    if ($checkRef->fetch()) {
        apiError('This payment reference has already been processed', 400);
    }

    $db->beginTransaction();

    $maxId = (int)$db->query("SELECT COALESCE(MAX(id), 0) FROM pledges_redeem")->fetchColumn();
    $redeemId = $maxId + 1;

    $stmt = $db->prepare("
        INSERT INTO pledges_redeem (id, email, mpesa_code, pledge_id, phone_no, redeemed_amount, recorded_by)
        VALUES (:id, :email, :mpesa_code, :pledge_id, :phone_no, :amount, :recorded_by)
    ");
    
    $systemUserId = 0; // Public submission
    
    $stmt->execute([
        ':id' => $redeemId,
        ':email' => $email ?: $pledge['email'],
        ':mpesa_code' => $reference, // Store paystack ref here
        ':pledge_id' => $pledge_id,
        ':phone_no' => $pledge['phone_no'] ?? '',
        ':amount' => $amount,
        ':recorded_by' => $systemUserId,
    ]);

    // Create double-entry journal entry
    $js = new JournalService($db);
    $jeId = $js->recordPledgeRedemption($date, $amount, $pledge['full_name'], $payment_method, $systemUserId, $redeemId);

    // Link journal entry
    $db->prepare("UPDATE pledges_redeem SET journal_entry_id = :je WHERE id = :id")->execute([':je' => $jeId, ':id' => $redeemId]);

    $js->audit('pledge_redeem', $redeemId, 'create', null, [
        'pledge_id' => $pledge_id,
        'pledger' => $pledge['full_name'],
        'amount' => $amount,
        'payment_method' => $payment_method,
        'reference' => $reference
    ], $systemUserId);

    $db->commit();
    apiSuccess([
        'id' => $redeemId,
        'journal_entry_id' => $jeId,
        'amount' => $amount
    ], 'Payment verified and pledge redeemed successfully');

} catch (Exception $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    error_log("Public redeem pledge error: " . $e->getMessage());
    apiError('Failed to redeem pledge', 500);
}
