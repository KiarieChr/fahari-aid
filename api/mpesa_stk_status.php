<?php
/**
 * M-Pesa STK Push Status Check
 * GET /api/mpesa_stk_status.php?checkout_request_id=xxxxx
 *
 * Returns whether the payment has been completed.
 * Used for polling from the frontend while waiting for the callback.
 */

require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    apiError('Method not allowed', 405);
}

$checkoutRequestId = trim($_GET['checkout_request_id'] ?? '');

if (empty($checkoutRequestId)) {
    apiError('checkout_request_id is required', 400);
}

try {
    $stmt = $db->prepare("
        SELECT status, mpesa_code, amount, result_code
        FROM mpesa_stk_requests
        WHERE checkout_request_id = :cr
        LIMIT 1
    ");
    $stmt->execute([':cr' => $checkoutRequestId]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$row) {
        apiError('Request not found', 404);
    }

    apiSuccess([
        'paid'       => $row['status'] === 'completed',
        'status'     => $row['status'],
        'mpesa_code' => $row['mpesa_code'],
        'amount'     => (float)$row['amount'],
        'result_code'=> (int)$row['result_code'],
    ]);

} catch (PDOException $e) {
    error_log("STK status error: " . $e->getMessage());
    apiError('Failed to check payment status', 500);
}
