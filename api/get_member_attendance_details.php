<?php
/**
 * Get Member Attendance Details API
 * GET /api/get_member_attendance_details.php
 * 
 * Query params: id
 */
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/middleware.php';

$user = authenticate();

try {
    $id = $_GET['id'] ?? null;
    
    if (!$id) {
        apiError('Member ID is required', 400);
    }

    // 1. Fetch Member Profile and Account Status
    $sql = "
        SELECT m.id, m.first_name, m.last_name, m.phone_no as phone, m.email, 
               c.name as cell, m.department, m.joined_on,
               (SELECT COUNT(id) FROM users u WHERE u.member_id = m.id AND u.status = 1) as has_account
        FROM member m
        LEFT JOIN cells c ON m.cell_id = c.id
        WHERE m.id = :id
        LIMIT 1
    ";
    
    $stmt = $db->prepare($sql);
    $stmt->bindValue(':id', $id, PDO::PARAM_INT);
    $stmt->execute();
    
    $member = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$member) {
        apiError('Member not found', 404);
    }

    // 2. Fetch all eligible meetings for the rate calculation
    $stmt = $db->query("
        SELECT id, start_time 
        FROM meeting 
        WHERE meeting_type NOT IN (2, 3, 4, 7, 14) OR meeting_type IS NULL
        ORDER BY start_time ASC
    ");
    $allMeetings = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $joinedOn = $member['joined_on'] ? strtotime($member['joined_on']) : 0;
    $eligibleTotal = 0;
    foreach ($allMeetings as $mtg) {
        $mtgTime = strtotime($mtg['start_time']);
        if ($joinedOn === 0 || $mtgTime >= $joinedOn) {
            $eligibleTotal++;
        }
    }

    // 3. Fetch attended meetings for this member
    $attSql = "
        SELECT mtg.id, mtg.name as title, mtg.start_time as date
        FROM attendance a
        JOIN meeting mtg ON a.meeting_id = mtg.id
        WHERE a.member_id = :id
          AND (mtg.meeting_type NOT IN (2, 3, 4, 7, 14) OR mtg.meeting_type IS NULL)
        ORDER BY mtg.start_time DESC
    ";
    $attStmt = $db->prepare($attSql);
    $attStmt->bindValue(':id', $id, PDO::PARAM_INT);
    $attStmt->execute();
    $attendedMeetings = $attStmt->fetchAll(PDO::FETCH_ASSOC);

    // Format dates
    $meetingsLog = array_map(function($m) {
        return [
            'id' => (string)$m['id'],
            'title' => $m['title'],
            'date' => date('Y-m-d', strtotime($m['date']))
        ];
    }, $attendedMeetings);

    $attendedCount = count($meetingsLog);
    $rate = 0;
    if ($eligibleTotal > 0) {
        $rate = round(($attendedCount / $eligibleTotal) * 100);
        if ($rate > 100) $rate = 100;
    }

    // Combine data
    $responseData = [
        'id' => (string)$member['id'],
        'name' => $member['first_name'] . ' ' . $member['last_name'],
        'phone' => $member['phone'],
        'email' => $member['email'],
        'department' => $member['department'],
        'cell' => $member['cell'],
        'hasAccount' => $member['has_account'] > 0,
        'rate' => $rate,
        'attended' => $attendedCount,
        'total' => $eligibleTotal,
        'lastAttended' => !empty($meetingsLog) ? $meetingsLog[0]['date'] : null,
        'history' => $meetingsLog
    ];

    apiSuccess(['data' => $responseData], 'Member attendance details retrieved');

} catch (PDOException $e) {
    error_log("Get member attendance details error: " . $e->getMessage());
    apiError('Failed to retrieve member details', 500);
}
