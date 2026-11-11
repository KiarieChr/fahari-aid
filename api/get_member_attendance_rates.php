<?php
/**
 * Get Member Attendance Rates API
 * GET /api/get_member_attendance_rates.php
 */
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/middleware.php';

$user = authenticate();

try {
    // 1. Get all eligible meetings (excluding admin/board meetings)
    $stmt = $db->query("
        SELECT id, start_time 
        FROM meeting 
        WHERE meeting_type NOT IN (2, 3, 4, 7, 14) OR meeting_type IS NULL
        ORDER BY start_time ASC
    ");
    $meetings = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 2. Get all members
    $mStmt = $db->query("
        SELECT id, CONCAT(first_name, ' ', last_name) as name, COALESCE(location, '1') as branchId, joined_on
        FROM member
        WHERE delete_status = 'Active'
    ");
    $members = $mStmt->fetchAll(PDO::FETCH_ASSOC);

    // 3. Get attendance for eligible meetings
    $meetingIds = array_column($meetings, 'id');
    $groupedAtt = [];
    if (!empty($meetingIds)) {
        $inQuery = implode(',', array_map('intval', $meetingIds));
        $attStmt = $db->query("
            SELECT member_id, meeting_id
            FROM attendance
            WHERE meeting_id IN ($inQuery)
        ");
        while ($row = $attStmt->fetch(PDO::FETCH_ASSOC)) {
            $groupedAtt[$row['member_id']][] = $row['meeting_id'];
        }
    }

    $formatted = [];
    foreach ($members as $m) {
        $memberId = $m['id'];
        $joinedOn = $m['joined_on'] ? strtotime($m['joined_on']) : 0;
        
        $eligibleTotal = 0;
        foreach ($meetings as $mtg) {
            $mtgTime = strtotime($mtg['start_time']);
            // Only count meetings that occurred after the member joined (or if joined_on is missing)
            if ($joinedOn === 0 || $mtgTime >= $joinedOn) {
                $eligibleTotal++;
            }
        }

        $attendedCount = isset($groupedAtt[$memberId]) ? count(array_unique($groupedAtt[$memberId])) : 0;
        
        $rate = 0;
        if ($eligibleTotal > 0) {
            $rate = round(($attendedCount / $eligibleTotal) * 100);
            if ($rate > 100) $rate = 100; // Cap at 100 just in case
        }

        $formatted[] = [
            'id' => (string)$memberId,
            'name' => $m['name'],
            'branchId' => (string)$m['branchId'],
            'rate' => $rate,
            'attended' => $attendedCount,
            'total' => $eligibleTotal
        ];
    }

    // Sort by rate descending, then by attended count descending
    usort($formatted, function($a, $b) {
        if ($b['rate'] === $a['rate']) {
            return $b['attended'] <=> $a['attended'];
        }
        return $b['rate'] <=> $a['rate'];
    });

    apiSuccess(['data' => $formatted], 'Member attendance rates retrieved');
} catch (Exception $e) {
    error_log("Get member attendance rates error: " . $e->getMessage());
    apiError('Failed to retrieve member attendance rates', 500);
}
