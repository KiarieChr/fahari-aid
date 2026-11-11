<?php
/**
 * Get Meeting Statistics API
 * GET /api/get_meeting_stats.php
 * 
 * Returns meeting statistics
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/middleware.php';

$user = authenticate();

try {
    $stats = [];

    // Total meetings
    $stmt = $db->query("SELECT COUNT(*) as total FROM meeting");
    $stats['total_meetings'] = (int)$stmt->fetch()['total'];

    // Upcoming meetings in next 7 days
    $stmt = $db->query("
        SELECT COUNT(*) as total FROM meeting 
        WHERE start_time >= NOW() 
        AND start_time <= DATE_ADD(NOW(), INTERVAL 7 DAY)
    ");
    $stats['upcoming_7_days'] = (int)$stmt->fetch()['total'];

    // Completed meetings
    $stmt = $db->query("SELECT COUNT(*) as total FROM meeting WHERE end_time < NOW()");
    $stats['completed_meetings'] = (int)$stmt->fetch()['total'];

    // Average attendance
    $stmt = $db->query("
        SELECT COALESCE(AVG(att_count), 0) as avg_attendance
        FROM (
            SELECT meeting_id, COUNT(*) as att_count
            FROM attendance
            GROUP BY meeting_id
        ) sub
    ");
    $stats['average_attendance'] = round((float)$stmt->fetch()['avg_attendance'], 1);

    apiSuccess(['stats' => $stats], 'Meeting stats retrieved');

} catch (PDOException $e) {
    error_log("Meeting stats error: " . $e->getMessage());
    apiError('Failed to retrieve meeting statistics', 500);
}
