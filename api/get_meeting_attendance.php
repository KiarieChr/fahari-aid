<?php
/**
 * Get Meeting Attendance API (for leaders/admins)
 * GET /api/get_meeting_attendance.php
 * 
 * Returns latest meeting attendance list
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/middleware.php';

// Require authentication
$user = authenticate();

try {
    $data = [];
    
    // Get the latest meeting from this week
    $stmt = $db->query("
        SELECT id, name, start_time, end_time
        FROM meeting
        WHERE WEEK(start_time, 1) = WEEK(CURDATE(), 1)
        AND YEAR(start_time) = YEAR(CURDATE())
        ORDER BY start_time DESC
        LIMIT 1
    ");
    $meeting = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$meeting) {
        // Try to get most recent meeting
        $stmt = $db->query("
            SELECT id, name, start_time, end_time
            FROM meeting
            ORDER BY start_time DESC
            LIMIT 1
        ");
        $meeting = $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    if (!$meeting) {
        apiSuccess(['meeting' => null, 'attendance' => []], 'No meetings found');
        exit;
    }
    
    $data['meeting'] = $meeting;
    
    // Get attendance for this meeting
    $stmt = $db->prepare("
        SELECT 
            a.id,
            a.login_time,
            m.first_name,
            m.last_name,
            m.phone_no,
            m.email
        FROM attendance a
        JOIN member m ON a.member_id = m.id
        WHERE a.meeting_id = :meeting_id
        ORDER BY a.login_time ASC
    ");
    $stmt->execute([':meeting_id' => $meeting['id']]);
    $data['attendance'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $data['total_attendees'] = count($data['attendance']);
    
    apiSuccess($data, 'Meeting attendance retrieved');
    
} catch (PDOException $e) {
    error_log("Meeting attendance API error: " . $e->getMessage());
    apiError('Failed to retrieve meeting attendance', 500);
}
