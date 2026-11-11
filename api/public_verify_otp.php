<?php
/**
 * Public Verify OTP
 * POST /api/public_verify_otp.php
 * Body: { search_term, otp_code }
 */
require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    apiError('Method not allowed', 405);
}

$body = getJsonBody();
$search_term = trim($body['search_term'] ?? '');
$otp_code = trim($body['otp_code'] ?? '');

if (empty($search_term) || empty($otp_code)) {
    apiError('Search term and OTP code are required', 400);
}

try {
    // 1. Verify code against DB and check expiry
    $stmt = $db->prepare("SELECT * FROM pledge_verifications WHERE search_term = :term AND code = :otp AND expires_at > NOW() LIMIT 1");
    $stmt->execute([
        ':term' => $search_term,
        ':otp' => $otp_code
    ]);
    $otpRecord = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$otpRecord) {
        apiError('Invalid or expired verification code.', 400);
    }

    // 2. Generate a temporary session token (1 hour expiry)
    $token = bin2hex(random_bytes(16));
    $expires_at = date('Y-m-d H:i:s', time() + 3600);

    // 3. Save the token and clear the OTP code (mark verified)
    $updateStmt = $db->prepare("UPDATE pledge_verifications SET code = 'VERIFIED', token = :token, expires_at = :expires WHERE id = :id");
    $updateStmt->execute([
        ':token' => $token,
        ':expires' => $expires_at,
        ':id' => $otpRecord['id']
    ]);

    // 4. Fetch the pledges for this user
    $stmt = $db->prepare("
        SELECT p.*, 
               COALESCE((SELECT SUM(redeemed_amount) FROM pledges_redeem WHERE pledge_id = p.id), 0) AS total_redeemed
        FROM pledges p 
        WHERE p.email = :search1 OR p.phone_no = :search2
        ORDER BY p.date DESC
    ");
    $stmt->execute([
        ':search1' => $search_term,
        ':search2' => $search_term
    ]);
    $pledges = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Calculate remaining balance for each
    foreach ($pledges as &$pledge) {
        $pledge['remaining_balance'] = max(0, (float)$pledge['pledges_amount'] - (float)$pledge['total_redeemed']);
    }

    // 5. Return the pledges along with the verified token
    apiSuccess([
        'token' => $token,
        'pledges' => $pledges
    ], 'OTP verified successfully');

} catch (Exception $e) {
    error_log("OTP verification error: " . $e->getMessage());
    apiError('Failed to verify code', 500);
}
