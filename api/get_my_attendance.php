<?php
/**
 * Get User's Attendance API
 * GET /api/get_my_attendance.php
 * 
 * Returns user's attendance statistics and history
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/middleware.php';

// Require authentication
$user = authenticate();

try {
    $data = [];
    
    // Get member_id from user
    $member_id = $user->member_id;
    
    if (!$member_id) {
        apiError('Member profile not found', 404);
    }
    
    // My attendance this month
    $stmt = $db->prepare("
        SELECT COUNT(*) as attendance 
        FROM attendance 
        WHERE member_id = :member_id 
        AND MONTH(login_time) = MONTH(CURRENT_DATE())
        AND YEAR(login_time) = YEAR(CURRENT_DATE())
    ");
    $stmt->execute([':member_id' => $member_id]);
    $myAttendance = (int) $stmt->fetch()['attendance'];
    
    // Total meetings this month
    $stmt = $db->query("
        SELECT COUNT(*) as meetings 
        FROM meeting 
        WHERE MONTH(start_time) = MONTH(CURRENT_DATE()) 
        AND YEAR(start_time) = YEAR(CURRENT_DATE())
    ");
    $totalMeetings = (int) $stmt->fetch()['meetings'];
    
    // Calculate percentage
    $percentage = $totalMeetings > 0 ? round(($myAttendance / $totalMeetings) * 100, 2) : 0;
    
    $data['my_attendance'] = [
        'attended' => $myAttendance,
        'total_meetings' => $totalMeetings,
        'percentage' => $percentage
    ];
    
    // Recent attendance history (last 10)
    $stmt = $db->prepare("
        SELECT a.id, a.login_time, m.name as meeting_name, m.start_time as meeting_date
        FROM attendance a
        JOIN meeting m ON a.meeting_id = m.id
        WHERE a.member_id = :member_id
        ORDER BY a.login_time DESC
        LIMIT 10
    ");
    $stmt->execute([':member_id' => $member_id]);
    $data['recent_attendance'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Monthly attendance trend (last 6 months)
    $stmt = $db->prepare("
        SELECT 
            DATE_FORMAT(login_time, '%Y-%m') as month,
            COUNT(*) as count
        FROM attendance
        WHERE member_id = :member_id
        AND login_time >= DATE_SUB(CURRENT_DATE(), INTERVAL 6 MONTH)
        GROUP BY DATE_FORMAT(login_time, '%Y-%m')
        ORDER BY month ASC
    ");
    $stmt->execute([':member_id' => $member_id]);
    $data['monthly_trend'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    apiSuccess($data, 'Attendance data retrieved');
    
} catch (PDOException $e) {
    error_log("Attendance API error: " . $e->getMessage());
    apiError('Failed to retrieve attendance data', 500);
}
