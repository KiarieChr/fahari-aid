<?php
/**
 * Get Attendance By Date API
 * GET /api/get_attendance_by_date.php?date=YYYY-MM-DD
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/middleware.php';

$user = authenticate();

$date = isset($_GET['date']) ? trim($_GET['date']) : '';

if (empty($date)) {
    apiError('Date parameter is required', 400);
}

try {
    // We group by member to avoid duplicates if they logged in multiple times on the same date, 
    // taking the earliest login_time on that day.
    $sql = "
        SELECT 
            m.id, 
            m.first_name, 
            m.last_name, 
            m.phone_no, 
            m.email, 
            MIN(a.login_time) as login_time,
            CASE WHEN (SELECT 1 FROM new_member_assimilation nma WHERE nma.member_id = m.id AND nma.decision_type = 'visitor' LIMIT 1) THEN 1 ELSE 0 END as is_visitor,
            CASE WHEN DATE(m.joined_on) = :date_joined THEN 1 ELSE 0 END as is_new_member
        FROM attendance a
        JOIN member m ON a.member_id = m.id
        WHERE DATE(a.login_time) = :date
        GROUP BY m.id, m.first_name, m.last_name, m.phone_no, m.email, m.joined_on
        ORDER BY login_time ASC
    ";
    
    $stmt = $db->prepare($sql);
    $stmt->execute([':date' => $date, ':date_joined' => $date]);
    $attendees = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $formatted = array_map(function($r) {
        $status = 'Regular';
        if ($r['is_visitor']) {
            $status = 'Visitor';
        } elseif ($r['is_new_member']) {
            $status = 'New Member';
        }
        
        return [
            'id' => (string)$r['id'],
            'name' => trim($r['first_name'] . ' ' . $r['last_name']),
            'phone' => $r['phone_no'],
            'email' => $r['email'],
            'loginTime' => $r['login_time'],
            'status' => $status
        ];
    }, $attendees);

    apiSuccess(['data' => $formatted, 'total' => count($formatted)], 'Attendees retrieved');

} catch (PDOException $e) {
    error_log("Get attendance by date error: " . $e->getMessage());
    apiError('Failed to retrieve attendees', 500);
}
?>
