<?php
/**
 * Get Event Attendance API
 * GET /api/get_event_attendance.php?event_id=X
 * 
 * Returns registered attendees with their check-in status for an event
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/middleware.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    apiError('Method not allowed', 405);
}

$user = authenticate();

$eventId = isset($_GET['event_id']) ? (int)$_GET['event_id'] : 0;

if ($eventId <= 0) {
    apiError('Event ID is required', 400);
}

try {
    // Get event details
    $stmt = $db->prepare("
        SELECT id, ename, start_date, end_date, branch as venue, target_attendees 
        FROM event WHERE id = :id
    ");
    $stmt->execute([':id' => $eventId]);
    $event = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$event) {
        apiError('Event not found', 404);
    }
    
    // Get all registrations with attendance status
    $stmt = $db->prepare("
        SELECT 
            r.id as registration_id,
            r.names,
            r.phone_no,
            r.email,
            r.gender,
            r.residence,
            r.category,
            r.travelling_from,
            r.sponsorship,
            r.qr_token,
            r.created_at as registered_at,
            ea.id as attendance_id,
            ea.check_in_time,
            ea.check_in_method,
            ea.notes as check_in_notes
        FROM event_registration r
        LEFT JOIN event_attendance ea ON r.id = ea.registration_id AND ea.event_id = :event_id
        WHERE r.event_id = :event_id2
        ORDER BY r.names ASC
    ");
    $stmt->execute([':event_id' => $eventId, ':event_id2' => $eventId]);
    $attendees = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Calculate stats
    $totalRegistered = count($attendees);
    $checkedIn = 0;
    $manualCheckIns = 0;
    $qrCheckIns = 0;
    
    foreach ($attendees as &$a) {
        $a['checked_in'] = !empty($a['attendance_id']);
        if ($a['checked_in']) {
            $checkedIn++;
            if ($a['check_in_method'] === 'qr') {
                $qrCheckIns++;
            } else {
                $manualCheckIns++;
            }
        }
        // Don't expose qr_token in list
        unset($a['qr_token']);
    }
    unset($a);
    
    $attendanceRate = $totalRegistered > 0 ? round(($checkedIn / $totalRegistered) * 100, 1) : 0;
    
    apiSuccess([
        'event' => $event,
        'attendees' => $attendees,
        'stats' => [
            'total_registered' => $totalRegistered,
            'checked_in' => $checkedIn,
            'not_checked_in' => $totalRegistered - $checkedIn,
            'attendance_rate' => $attendanceRate,
            'manual_checkins' => $manualCheckIns,
            'qr_checkins' => $qrCheckIns,
            'target_attendees' => (int)($event['target_attendees'] ?? 0)
        ]
    ]);
    
} catch (PDOException $e) {
    error_log("Get event attendance error: " . $e->getMessage());
    apiError('Failed to retrieve attendance data', 500);
}
