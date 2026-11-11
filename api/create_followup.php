<?php
/**
 * Create Followup API (new version using config.php pattern)
 * POST /api/create_followup.php
 * 
 * Body: { member_id, message, followup_type, send_sms, send_email }
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/middleware.php';

$user = authenticate();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    apiError('Method not allowed', 405);
}

$body = getJsonBody();

$member_id = (int)($body['member_id'] ?? 0);
$message = trim($body['message'] ?? '');
$followup_type = $body['followup_type'] ?? 'general';
$send_sms = (int)($body['send_sms'] ?? 0);
$send_email = (int)($body['send_email'] ?? 0);

if (!$member_id) {
    apiError('Member ID is required');
}

if ($message === '') {
    apiError('Message is required');
}

if (!in_array($followup_type, ['general', 'attendance', 'welfare', 'new_member'])) {
    $followup_type = 'general';
}

try {
    // Verify member exists
    $memStmt = $db->prepare("SELECT id, first_name, last_name FROM member WHERE id = :id");
    $memStmt->execute([':id' => $member_id]);
    $member = $memStmt->fetch(PDO::FETCH_ASSOC);

    if (!$member) {
        apiError('Member not found', 404);
    }

    $stmt = $db->prepare("
        INSERT INTO followups (member_id, message, followup_type, sent_by, sent_via_sms, sent_via_email, status, sent_at)
        VALUES (:member_id, :message, :type, :sent_by, :sms, :email, 'pending', NOW())
    ");
    $stmt->execute([
        ':member_id' => $member_id,
        ':message' => $message,
        ':type' => $followup_type,
        ':sent_by' => $user->id,
        ':sms' => $send_sms,
        ':email' => $send_email
    ]);

    $followupId = (int)$db->lastInsertId();

    apiSuccess([
        'id' => $followupId,
        'member_name' => $member['first_name'] . ' ' . $member['last_name']
    ], 'Follow-up created successfully', 201);

} catch (PDOException $e) {
    error_log("Create followup error: " . $e->getMessage());
    apiError('Failed to create followup', 500);
}
