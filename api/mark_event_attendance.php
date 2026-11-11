<?php
/**
 * Mark Event Attendance API (Manual Check-in)
 * POST /api/mark_event_attendance.php
 * 
 * Request body:
 * {
 *   "event_id": 1,
 *   "registration_id": 10,
 *   "notes": "optional notes"
 * }
 * 
 * OR search by phone/email:
 * {
 *   "event_id": 1,
 *   "search": "0712345678"
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
$search = trim($body['search'] ?? '');
$notes = trim($body['notes'] ?? '');

if ($eventId <= 0) {
    apiError('Event ID is required', 400);
}

if ($registrationId <= 0 && empty($search)) {
    apiError('Either registration_id or search (phone/email) is required', 400);
}

try {
    // Verify event exists
    $stmt = $db->prepare("SELECT id, ename FROM event WHERE id = :id");
    $stmt->execute([':id' => $eventId]);
    $event = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$event) {
        apiError('Event not found', 404);
    }
    
    // Find registration
    if ($registrationId > 0) {
        $stmt = $db->prepare("
            SELECT id, names, phone_no, email 
            FROM event_registration 
            WHERE id = :id AND event_id = :event_id
        ");
        $stmt->execute([':id' => $registrationId, ':event_id' => $eventId]);
    } else {
        // Search by phone or email
        $stmt = $db->prepare("
            SELECT id, names, phone_no, email 
            FROM event_registration 
            WHERE event_id = :event_id AND (phone_no = :search OR email = :search2)
            LIMIT 1
        ");
        $stmt->execute([
            ':event_id' => $eventId,
            ':search' => $search,
            ':search2' => $search
        ]);
    }
    
    $registration = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$registration) {
        apiError('Registration not found for this event', 404);
    }
    
    // Check if already checked in
    $stmt = $db->prepare("
        SELECT id FROM event_attendance 
        WHERE event_id = :event_id AND registration_id = :reg_id
    ");
    $stmt->execute([':event_id' => $eventId, ':reg_id' => $registration['id']]);
    
    if ($stmt->fetch()) {
        apiError($registration['names'] . ' is already checked in', 409);
    }
    
    // Mark attendance
    $stmt = $db->prepare("
        INSERT INTO event_attendance (event_id, registration_id, check_in_time, check_in_method, checked_in_by, notes)
        VALUES (:event_id, :reg_id, NOW(), 'manual', :user_id, :notes)
    ");
    $stmt->execute([
        ':event_id' => $eventId,
        ':reg_id' => $registration['id'],
        ':user_id' => $user->id,
        ':notes' => $notes ?: null
    ]);
    
    apiSuccess([
        'attendance_id' => (int)$db->lastInsertId(),
        'registration' => $registration,
        'method' => 'manual'
    ], $registration['names'] . ' checked in successfully!');
    
} catch (PDOException $e) {
    error_log("Mark event attendance error: " . $e->getMessage());
    apiError('Failed to mark attendance', 500);
}
