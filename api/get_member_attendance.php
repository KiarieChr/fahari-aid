<?php
// Start output buffering to prevent any accidental output
ob_start();

try {
    // Include the database connection and authentication
    require_once('../includes/connection.php');
    
    // Set headers first
    header('Content-Type: application/json; charset=utf-8');
    
    // Check if member_id is provided
    $member_id = $_GET['member_id'] ?? null;
    
    if (!$member_id) {
        throw new Exception('Member ID is required');
    }
    
    // Validate member_id
    if (!is_numeric($member_id)) {
        throw new Exception('Invalid Member ID format');
    }
    
    // Get member details
    $stmt = $db->prepare("SELECT * FROM member WHERE id = :id");
    $stmt->bindParam(':id', $member_id, PDO::PARAM_INT);
    $stmt->execute();
    $member = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$member) {
        throw new Exception('Member not found');
    }
    
    // Get attendance history
    $attendance_stmt = $db->prepare("
        SELECT 
            m.name as meeting_name,
            DATE_FORMAT(a.login_time, '%b %d, %Y') as date,
            DATE_FORMAT(a.login_time, '%h:%i %p') as time,
            CASE 
                WHEN a.id IS NOT NULL THEN 'Attended'
                ELSE 'Absent'
            END as status
        FROM meeting m
        LEFT JOIN attendance a ON m.id = a.meeting_id AND a.member_id = :member_id
        ORDER BY m.start_time DESC
        LIMIT 10
    ");
    $attendance_stmt->bindParam(':member_id', $member_id, PDO::PARAM_INT);
    $attendance_stmt->execute();
    $attendance_history = $attendance_stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Calculate stats
    $stats_stmt = $db->prepare("
        SELECT 
            COUNT(DISTINCT m.id) as total_meetings,
            COUNT(DISTINCT a.id) as attended_count,
            COUNT(DISTINCT CASE WHEN a.id IS NULL THEN m.id END) as missed_count
        FROM meeting m
        LEFT JOIN attendance a ON m.id = a.meeting_id AND a.member_id = :member_id
    ");
    $stats_stmt->bindParam(':member_id', $member_id, PDO::PARAM_INT);
    $stats_stmt->execute();
    $stats = $stats_stmt->fetch(PDO::FETCH_ASSOC);
    
    // Prepare chart data (example data - you can make this dynamic)
    $chart_labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    $chart_data = [80, 60, 90, 70];
    
    $response = [
        'success' => true,
        'member' => [
            'name' => $member['first_name'] . ' ' . $member['last_name'],
            'phone' => $member['phone_no'] ?? 'N/A',
            'email' => $member['email'] ?? 'N/A',
            'initials' => strtoupper(substr($member['first_name'], 0, 1)),
            'avatar_color' => substr(md5($member['id']), 0, 6),
            'total_meetings' => $stats['total_meetings'] ?? 0,
            'attended_count' => $stats['attended_count'] ?? 0,
            'missed_count' => $stats['missed_count'] ?? 0
        ],
        'attendance_history' => $attendance_history,
        'chart_data' => [
            'labels' => $chart_labels,
            'datasets' => [[
                'label' => 'Attendance %',
                'data' => $chart_data,
                'backgroundColor' => '#667eea'
            ]]
        ]
    ];
    
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    
} catch (PDOException $e) {
    // Database error
    $response = [
        'success' => false,
        'error' => 'Database error',
        'message' => $e->getMessage()
    ];
    echo json_encode($response);
    
} catch (Exception $e) {
    // General error
    $response = [
        'success' => false,
        'error' => 'Application error',
        'message' => $e->getMessage()
    ];
    echo json_encode($response);
}

// Clear any remaining output
ob_end_flush();
?>