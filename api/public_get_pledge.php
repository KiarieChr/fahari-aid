<?php
/**
 * Public Get Pledge
 * POST /api/public_get_pledge.php
 * Body: { search_term } (Email or Phone Number)
 */
require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    apiError('Method not allowed', 405);
}

$body = getJsonBody();
$search_term = trim($body['search_term'] ?? '');
$token = trim($body['token'] ?? '');

if (empty($search_term)) {
    apiError('Email or Phone Number is required', 400);
}

if (empty($token)) {
    apiError('Unauthorized access: verification token required', 401);
}

// Verify the token
$tokenStmt = $db->prepare("SELECT 1 FROM pledge_verifications WHERE search_term = :term AND token = :token AND expires_at > NOW() LIMIT 1");
$tokenStmt->execute([
    ':term' => $search_term,
    ':token' => $token
]);
if (!$tokenStmt->fetchColumn()) {
    apiError('Unauthorized or expired session. Please verify again.', 401);
}

try {
    // Search for pledges by email or phone
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

    // Calculate remaining for each
    foreach ($pledges as &$pledge) {
        $pledge['remaining_balance'] = max(0, (float)$pledge['pledges_amount'] - (float)$pledge['total_redeemed']);
    }

    apiSuccess($pledges, 'Pledges retrieved successfully');

} catch (Exception $e) {
    error_log("Public get pledge error: " . $e->getMessage());
    apiError('Failed to fetch pledges', 500);
}
