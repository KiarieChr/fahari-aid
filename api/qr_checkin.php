<?php
/**
 * QR Check-in API
 * POST /api/qr_checkin.php
 * 
 * Request body:
 * {
 *   "qr_data": "EVT-9-REG-140-abc123def456..."
 * }
 * 
 * QR data format: EVT-{event_id}-REG-{registration_id}-{qr_token}
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/middleware.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    apiError('Method not allowed', 405);
}

$user = authenticate();
$body = getJsonBody();

$qrData = trim($body['qr_data'] ?? '');

if (empty($qrData)) {
    apiError('QR data is required', 400);
}

// Parse QR data: EVT-{event_id}-REG-{registration_id}-{token}
if (!preg_match('/^EVT-(\d+)-REG-(\d+)-([a-f0-9]{32})$/', $qrData, $matches)) {
    apiError('Invalid QR code format', 400);
}

$eventId = (int)$matches[1];
$registrationId = (int)$matches[2];
$qrToken = $matches[3];

try {
    // Verify registration exists with matching token
    $stmt = $db->prepare("
        SELECT r.id, r.names, r.phone_no, r.email, r.event_id, e.ename
        FROM event_registration r
        JOIN event e ON r.event_id = e.id
        WHERE r.id = :reg_id AND r.event_id = :event_id AND r.qr_token = :token
    ");
    $stmt->execute([
        ':reg_id' => $registrationId,
        ':event_id' => $eventId,
        ':token' => $qrToken
    ]);
    $registration = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$registration) {
        apiError('Invalid or expired QR code', 400);
    }
    
    // Check if already checked in
    $stmt = $db->prepare("
        SELECT id, check_in_time FROM event_attendance 
        WHERE event_id = :event_id AND registration_id = :reg_id
    ");
    $stmt->execute([':event_id' => $eventId, ':reg_id' => $registrationId]);
    $existing = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($existing) {
        apiSuccess([
            'already_checked_in' => true,
            'registration' => [
                'id' => $registration['id'],
                'names' => $registration['names'],
                'phone_no' => $registration['phone_no'],
                'email' => $registration['email']
            ],
            'check_in_time' => $existing['check_in_time'],
            'event_name' => $registration['ename']
        ], $registration['names'] . ' was already checked in at ' . date('h:i A', strtotime($existing['check_in_time'])));
    }
    
    // Mark attendance via QR
    $stmt = $db->prepare("
        INSERT INTO event_attendance (event_id, registration_id, check_in_time, check_in_method, checked_in_by)
        VALUES (:event_id, :reg_id, NOW(), 'qr', :user_id)
    ");
    $stmt->execute([
        ':event_id' => $eventId,
        ':reg_id' => $registrationId,
        ':user_id' => $user->id
    ]);
    
    apiSuccess([
        'already_checked_in' => false,
        'attendance_id' => (int)$db->lastInsertId(),
        'registration' => [
            'id' => $registration['id'],
            'names' => $registration['names'],
            'phone_no' => $registration['phone_no'],
            'email' => $registration['email']
        ],
        'method' => 'qr',
        'event_name' => $registration['ename']
    ], $registration['names'] . ' checked in successfully via QR!');
    
} catch (PDOException $e) {
    error_log("QR checkin error: " . $e->getMessage());
    apiError('Failed to process QR check-in', 500);
}
