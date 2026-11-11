<?php
/**
 * Cell Attendance API
 * GET /api/cell_attendance.php?cell_id=X&date=YYYY-MM-DD
 * POST /api/cell_attendance.php  { cell_id, date, attendees: [{member_id, present}] }
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/middleware.php';

$user = authenticate();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Fetch attendance for a cell on a specific date
    $cell_id = (int)($_GET['cell_id'] ?? 0);
    $date = $_GET['date'] ?? date('Y-m-d');

    if (!$cell_id) {
        apiError('Cell ID is required');
    }

    try {
        // Get all cell members with attendance status for the date
        $stmt = $db->prepare("
            SELECT 
                m.id, m.first_name, m.last_name, m.phone_no,
                CASE WHEN ca.id IS NOT NULL THEN ca.present ELSE NULL END AS present
            FROM member m
            LEFT JOIN cell_attendance ca ON ca.member_id = m.id AND ca.cell_id = :cell_id AND ca.meeting_date = :date
            WHERE m.cell_id = :cell_id2
            AND (m.delete_status IS NULL OR m.delete_status = '0')
            ORDER BY m.first_name ASC
        ");
        $stmt->execute([
            ':cell_id' => $cell_id,
            ':date' => $date,
            ':cell_id2' => $cell_id
        ]);
        $members = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($members as &$m) {
            $m['present'] = $m['present'] === null ? null : (int)$m['present'];
        }

        // Get attendance history for the cell (last 10 meetings)
        $histStmt = $db->prepare("
            SELECT 
                meeting_date,
                COUNT(CASE WHEN present = 1 THEN 1 END) AS present_count,
                COUNT(*) AS total
            FROM cell_attendance
            WHERE cell_id = :cell_id
            GROUP BY meeting_date
            ORDER BY meeting_date DESC
            LIMIT 10
        ");
        $histStmt->execute([':cell_id' => $cell_id]);
        $history = $histStmt->fetchAll(PDO::FETCH_ASSOC);

        apiSuccess([
            'members' => $members,
            'date' => $date,
            'history' => $history,
            'recorded' => !empty($members) && $members[0]['present'] !== null
        ]);

    } catch (PDOException $e) {
        error_log("Cell attendance GET error: " . $e->getMessage());
        apiError('Failed to retrieve attendance', 500);
    }

} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Record attendance
    $body = getJsonBody();

    $cell_id = (int)($body['cell_id'] ?? 0);
    $date = $body['date'] ?? date('Y-m-d');
    $attendees = $body['attendees'] ?? [];

    if (!$cell_id) {
        apiError('Cell ID is required');
    }

    if (empty($attendees) || !is_array($attendees)) {
        apiError('Attendees list is required');
    }

    try {
        $db->beginTransaction();

        // Delete existing records for this cell+date (upsert approach)
        $delStmt = $db->prepare("DELETE FROM cell_attendance WHERE cell_id = :cell_id AND meeting_date = :date");
        $delStmt->execute([':cell_id' => $cell_id, ':date' => $date]);

        // Insert attendance records
        $insStmt = $db->prepare("
            INSERT INTO cell_attendance (cell_id, member_id, meeting_date, present, recorded_by)
            VALUES (:cell_id, :member_id, :date, :present, :recorded_by)
        ");

        $recorded = 0;
        foreach ($attendees as $a) {
            $insStmt->execute([
                ':cell_id' => $cell_id,
                ':member_id' => (int)$a['member_id'],
                ':date' => $date,
                ':present' => (int)($a['present'] ?? 0),
                ':recorded_by' => $user->id
            ]);
            $recorded++;
        }

        $db->commit();

        apiSuccess([
            'recorded' => $recorded,
            'cell_id' => $cell_id,
            'date' => $date
        ], 'Attendance recorded successfully');

    } catch (PDOException $e) {
        $db->rollBack();
        error_log("Cell attendance POST error: " . $e->getMessage());
        apiError('Failed to record attendance', 500);
    }

} else {
    apiError('Method not allowed', 405);
}
