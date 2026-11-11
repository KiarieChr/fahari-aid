<?php
/**
 * Mark Attendance API (Portal)
 * POST /api/mark_attendance.php
 * 
 * Request body:
 * {
 *   "meeting_id": 1,
 *   "phone_no": "0712345678"
 * }
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/middleware.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    apiError('Method not allowed', 405);
}

$user = authenticate();

$body = getJsonBody();

$meetingId = (int)($body['meeting_id'] ?? 0);
$phoneNo = trim($body['phone_no'] ?? '');

if ($meetingId <= 0) {
    apiError('Meeting ID is required', 400);
}

if (strlen($phoneNo) < 10) {
    apiError('A valid phone number is required (at least 10 digits)', 400);
}

try {
    // Verify meeting exists
    $stmt = $db->prepare("SELECT id, name FROM meeting WHERE id = :id");
    $stmt->execute([':id' => $meetingId]);
    $meeting = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$meeting) {
        apiError('Meeting not found', 404);
    }

    // Find member by phone number (support local 07... and international 254...)
    $cleanPhone = preg_replace('/[^0-9]/', '', $phoneNo);
    $altPhone = '';
    if (str_starts_with($cleanPhone, '254') && strlen($cleanPhone) === 12) {
        $altPhone = '0' . substr($cleanPhone, 3);
    } elseif (str_starts_with($cleanPhone, '0') && strlen($cleanPhone) === 10) {
        $altPhone = '254' . substr($cleanPhone, 1);
    }

    $stmt = $db->prepare("SELECT id, first_name, last_name FROM member WHERE phone_no = :p1 OR phone_no = :p2 OR phone_no = :p3 LIMIT 1");
    $stmt->execute([':p1' => $phoneNo, ':p2' => $cleanPhone, ':p3' => ($altPhone ?: $cleanPhone)]);
    $member = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$member) {
        apiError('Member not found with that phone number', 404);
    }

    // Check if already marked
    $stmt = $db->prepare("SELECT id FROM attendance WHERE member_id = :member_id AND meeting_id = :meeting_id LIMIT 1");
    $stmt->execute([':member_id' => $member['id'], ':meeting_id' => $meetingId]);

    if ($stmt->fetch()) {
        apiError('Attendance already marked for this meeting', 409);
    }

    // Insert attendance
    $stmt = $db->prepare("
        INSERT INTO attendance (member_id, meeting_id, login_time)
        VALUES (:member_id, :meeting_id, NOW())
    ");
    $stmt->execute([
        ':member_id' => $member['id'],
        ':meeting_id' => $meetingId
    ]);

    echo json_encode([
        'success' => true,
        'message' => 'Attendance marked!'
    ]);

} catch (PDOException $e) {
    error_log("Mark attendance error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Could not mark attendance'
    ]);
}
