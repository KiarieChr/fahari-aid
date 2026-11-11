<?php
/**
 * Get Meeting Details API
 * GET /api/get_meeting_details.php?id=123
 * 
 * Returns details for a specific meeting
 */

require_once __DIR__ . '/config.php';

$meetingId = (int)($_GET['id'] ?? 0);

if ($meetingId <= 0) {
    apiError('Meeting ID is required', 400);
}

try {
    $stmt = $db->prepare("
        SELECT 
            m.id, m.name AS title,
            DATE(m.start_time) AS date,
            DATE(m.end_time) AS end_date,
            TIME_FORMAT(m.start_time, '%H:%i') AS time,
            TIME_FORMAT(m.end_time, '%H:%i') AS end_time_formatted,
            m.start_time,
            m.end_time,
            m.meeting_link,
            m.description,
            m.banner,
            m.meeting_type,
            COALESCE((SELECT mt.name FROM meeting_types mt WHERE mt.id = m.meeting_type), 'General') AS category,
            COALESCE(
                (SELECT CONCAT(mb.first_name, ' ', mb.last_name) FROM users u JOIN member mb ON u.member_id = mb.id WHERE u.id = m.facilitator),
                (SELECT CONCAT(mb.first_name, ' ', mb.last_name) FROM member mb WHERE mb.id = m.facilitator),
                'N/A'
            ) AS facilitator,
            (SELECT COUNT(*) FROM attendance a WHERE a.meeting_id = m.id) AS attendee_count
        FROM meeting m
        WHERE m.id = :id
    ");
    $stmt->execute([':id' => $meetingId]);
    $meeting = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$meeting) {
        apiError('Meeting not found', 404);
    }

    apiSuccess($meeting, 'Meeting details retrieved');

} catch (PDOException $e) {
    error_log("Meeting details error: " . $e->getMessage());
    apiError('Failed to retrieve meeting details', 500);
}
