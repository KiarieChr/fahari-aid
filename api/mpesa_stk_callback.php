<?php
/**
 * M-Pesa STK Push Callback
 * POST /api/mpesa_stk_callback.php   ← must be publicly reachable
 *
 * Safaricom calls this URL after the customer approves/cancels/times out.
 * We verify the payload, then record the redemption and journal entry.
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/JournalService.php';

// Safaricom sends JSON — read raw body
$raw  = file_get_contents('php://input');
$data = json_decode($raw, true);

error_log("M-Pesa Callback: " . $raw);

// Acknowledge Safaricom immediately (they retry otherwise)
header('Content-Type: application/json');

$body = $data['Body']['stkCallback'] ?? null;
if (!$body) {
    echo json_encode(['ResultCode' => 1, 'ResultDesc' => 'Invalid callback']);
    exit;
}

$resultCode        = (int)($body['ResultCode']       ?? 1);
$checkoutRequestId = trim($body['CheckoutRequestID'] ?? '');
$merchantRequestId = trim($body['MerchantRequestID'] ?? '');

if ($resultCode !== 0) {
    // Payment was not completed (user cancelled, timed out, etc.)
    try {
        $db->prepare("UPDATE mpesa_stk_requests SET status = 'failed', result_code = :rc WHERE checkout_request_id = :cr")
           ->execute([':rc' => $resultCode, ':cr' => $checkoutRequestId]);
    } catch (PDOException $e) {
        error_log("Callback update error: " . $e->getMessage());
    }
    echo json_encode(['ResultCode' => 0, 'ResultDesc' => 'Accepted']);
    exit;
}

// ── Extract metadata from callback items ─────────────────────────────────────
$items = [];
foreach ($body['CallbackMetadata']['Item'] ?? [] as $item) {
    $items[$item['Name']] = $item['Value'] ?? null;
}

$mpesaCode = $items['MpesaReceiptNumber'] ?? '';
$amount    = (float)($items['Amount']           ?? 0);
$phone     = (string)($items['PhoneNumber']     ?? '');

try {
    // ── Look up the pending STK request ──────────────────────────────────────
    $stmt = $db->prepare("SELECT * FROM mpesa_stk_requests WHERE checkout_request_id = :cr LIMIT 1");
    $stmt->execute([':cr' => $checkoutRequestId]);
    $stkRow = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$stkRow) {
        error_log("M-Pesa Callback: no matching STK request for $checkoutRequestId");
        echo json_encode(['ResultCode' => 0, 'ResultDesc' => 'Accepted (no match)']);
        exit;
    }

    // Guard duplicate callbacks
    if ($stkRow['status'] === 'completed') {
        echo json_encode(['ResultCode' => 0, 'ResultDesc' => 'Already processed']);
        exit;
    }

    $pledge_id = (int)$stkRow['pledge_id'];

    $db->beginTransaction();

    // ── Fetch pledge details ──────────────────────────────────────────────────
    $pledge = $db->query("SELECT * FROM pledges WHERE id = $pledge_id")->fetch(PDO::FETCH_ASSOC);
    if (!$pledge) throw new Exception("Pledge $pledge_id not found");

    // ── Insert redemption record ──────────────────────────────────────────────
    $maxId    = (int)$db->query("SELECT COALESCE(MAX(id),0) FROM pledges_redeem")->fetchColumn();
    $redeemId = $maxId + 1;

    $db->prepare("
        INSERT INTO pledges_redeem (id, email, mpesa_code, pledge_id, phone_no, redeemed_amount, recorded_by)
        VALUES (:id, :email, :mpesa_code, :pledge_id, :phone_no, :amount, :recorded_by)
    ")->execute([
        ':id'         => $redeemId,
        ':email'      => $pledge['email'],
        ':mpesa_code' => $mpesaCode,
        ':pledge_id'  => $pledge_id,
        ':phone_no'   => $phone ?: ($pledge['phone_no'] ?? ''),
        ':amount'     => $amount,
        ':recorded_by'=> 0, // system
    ]);

    // ── Double-entry journal ─────────────────────────────────────────────────
    $js   = new JournalService($db);
    $jeId = $js->recordPledgeRedemption(date('Y-m-d'), $amount, $pledge['full_name'], 'M-Pesa', 0, $redeemId);
    $db->prepare("UPDATE pledges_redeem SET journal_entry_id = :je WHERE id = :id")->execute([':je' => $jeId, ':id' => $redeemId]);

    $js->audit('pledge_redeem', $redeemId, 'create', null, [
        'pledge_id'      => $pledge_id,
        'pledger'        => $pledge['full_name'],
        'amount'         => $amount,
        'payment_method' => 'M-Pesa',
        'mpesa_code'     => $mpesaCode,
        'checkout_id'    => $checkoutRequestId,
    ], 0);

    // ── Mark STK request as completed ────────────────────────────────────────
    $db->prepare("UPDATE mpesa_stk_requests SET status='completed', mpesa_code=:mc, result_code=0 WHERE checkout_request_id=:cr")
       ->execute([':mc' => $mpesaCode, ':cr' => $checkoutRequestId]);

    $db->commit();
    error_log("M-Pesa Callback: pledge $pledge_id redeemed KES $amount via $mpesaCode");

} catch (Exception $e) {
    if ($db->inTransaction()) $db->rollBack();
    error_log("M-Pesa Callback Exception: " . $e->getMessage());
    // Still ack Safaricom
}

echo json_encode(['ResultCode' => 0, 'ResultDesc' => 'Accepted']);
exit;
