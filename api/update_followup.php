<?php
/**
 * Update Followup Status API
 * POST /api/update_followup.php
 * 
 * Body: { followup_id, status: 'completed'|'no_response', notes }
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/middleware.php';

$user = authenticate();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    apiError('Method not allowed', 405);
}

$body = getJsonBody();

$followup_id = (int)($body['followup_id'] ?? 0);
$status = $body['status'] ?? '';
$notes = trim($body['notes'] ?? '');

if (!$followup_id) {
    apiError('Followup ID is required');
}

if (!in_array($status, ['pending', 'completed', 'no_response'])) {
    apiError('Invalid status');
}

try {
    $stmt = $db->prepare("
        UPDATE followups 
        SET status = :status, 
            notes = :notes,
            completed_at = CASE WHEN :status2 = 'completed' THEN NOW() ELSE completed_at END
        WHERE id = :id
    ");
    $stmt->execute([
        ':status' => $status,
        ':status2' => $status,
        ':notes' => $notes,
        ':id' => $followup_id
    ]);

    if ($stmt->rowCount() === 0) {
        apiError('Followup not found', 404);
    }

    apiSuccess(['id' => $followup_id, 'status' => $status], 'Followup updated');

} catch (PDOException $e) {
    error_log("Update followup error: " . $e->getMessage());
    apiError('Failed to update followup', 500);
}
