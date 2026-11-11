<?php
/**
 * Undo Event Attendance (Reverse Check-in)
 * POST /api/undo_event_attendance.php
 * 
 * Request body:
 * {
 *   "event_id": 1,
 *   "registration_id": 10
 * }
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/middleware.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    apiError('Method not allowed', 405);
}

$user = authenticate();
$body = getJsonBody();

$eventId = (int)($body['event_id'] ?? 0);
$registrationId = (int)($body['registration_id'] ?? 0);

if ($eventId <= 0 || $registrationId <= 0) {
    apiError('Event ID and registration ID are required', 400);
}

try {
    $stmt = $db->prepare("
        DELETE FROM event_attendance 
        WHERE event_id = :event_id AND registration_id = :reg_id
    ");
    $stmt->execute([':event_id' => $eventId, ':reg_id' => $registrationId]);
    
    if ($stmt->rowCount() === 0) {
        apiError('No attendance record found to undo', 404);
    }
    
    apiSuccess(null, 'Check-in reversed successfully');
    
} catch (PDOException $e) {
    error_log("Undo event attendance error: " . $e->getMessage());
    apiError('Failed to undo check-in', 500);
}
