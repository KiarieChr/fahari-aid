<?php
/**
 * Get Attendance Records API
 * GET /api/get_attendance_records.php
 */
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/middleware.php';

$user = authenticate();

try {
    $stmt = $db->query("
        SELECT 
            mtg.id as meeting_id,
            mtg.start_time as date,
            COALESCE(mtg.branch, '1') as branchId,
            mtg.name as title,
            mtg.meeting_type
        FROM meeting mtg
        WHERE mtg.meeting_type NOT IN (2, 3, 4, 7, 14) OR mtg.meeting_type IS NULL
        ORDER BY mtg.start_time DESC
        LIMIT 1000
    ");
    $meetings = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $formatted = [];

    // Preload all attendance for these meetings
    $meetingIds = array_column($meetings, 'meeting_id');
    if (!empty($meetingIds)) {
        $inQuery = implode(',', array_map('intval', $meetingIds));
        $attStmt = $db->query("
            SELECT 
                att.meeting_id,
                m.id as member_id,
                m.bod,
                m.delete_status,
                a.id as assimilation_id
            FROM attendance att
            JOIN member m ON att.member_id = m.id
            LEFT JOIN (SELECT member_id, MIN(id) as id FROM new_member_assimilation GROUP BY member_id) a ON a.member_id = m.id
            WHERE att.meeting_id IN ($inQuery)
        ");
        $attendanceRows = $attStmt->fetchAll(PDO::FETCH_ASSOC);

        // Group attendance by meeting
        $grouped = [];
        foreach ($attendanceRows as $row) {
            $grouped[$row['meeting_id']][] = $row;
        }

        foreach ($meetings as $mtg) {
            $adults = 0;
            $children = 0;
            $visitors = 0;

            if (isset($grouped[$mtg['meeting_id']])) {
                foreach ($grouped[$mtg['meeting_id']] as $att) {
                    $age = 30; // Default adult
                    if ($att['bod']) {
                        try {
                            $dob = new DateTime($att['bod']);
                            $now = new DateTime();
                            $age = $now->diff($dob)->y;
                        } catch (Exception $e) {
                            $age = 30;
                        }
                    }

                    $isVisitor = (strtolower($att['delete_status'] ?? '') === 'visitor' || !empty($att['assimilation_id']));

                    if ($age < 13) {
                        $children++;
                    } elseif ($isVisitor) {
                        $visitors++;
                    } else {
                        $adults++;
                    }
                }
            }

            // Determine scope from meeting_type if possible, else default to 'service'
            $scopeMap = [
                1 => 'service',
                2 => 'event',
                3 => 'group',
                4 => 'ministry'
            ];
            $scope = isset($scopeMap[$mtg['meeting_type']]) ? $scopeMap[$mtg['meeting_type']] : 'service';

            $formatted[] = [
                'id' => (string)$mtg['meeting_id'],
                'date' => date('Y-m-d', strtotime($mtg['date'])),
                'branchId' => (string)$mtg['branchId'],
                'scope' => $scope,
                'title' => $mtg['title'],
                'adults' => $adults,
                'children' => $children,
                'visitors' => $visitors
            ];
        }
    }

    apiSuccess(['data' => $formatted], 'Attendance records retrieved');
} catch (Exception $e) {
    error_log("Get attendance records error: " . $e->getMessage());
    apiError('Failed to retrieve attendance records', 500);
}
