<?php
/**
 * mark_cell_attendance.php
 * AJAX handler: Mark or unmark a cell member's attendance at a meeting.
 * Uses the existing `attendance` table (member_id, meeting_id, login_time).
 *
 * POST params:
 *   action      : 'mark' | 'unmark'
 *   member_id   : int
 *   meeting_id  : int
 */

session_start();
header('Content-Type: application/json');
include('../includes/connection.php');
include('../includes/checklogin.php');
require_once 'functions.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit;
}

$action     = trim($_POST['action'] ?? '');
$member_id  = intval($_POST['member_id'] ?? 0);
$meeting_id = intval($_POST['meeting_id'] ?? 0);

if (!in_array($action, ['mark', 'unmark']) || !$member_id || !$meeting_id) {
    echo json_encode(['success' => false, 'message' => 'Missing or invalid parameters']);
    exit;
}

try {
    if ($action === 'mark') {
        // Check if record already exists
        $check = $db->prepare("SELECT id FROM attendance WHERE member_id = :mid AND meeting_id = :mtid LIMIT 1");
        $check->execute([':mid' => $member_id, ':mtid' => $meeting_id]);
        if ($check->fetch()) {
            echo json_encode(['success' => true, 'message' => 'Already marked as present']);
            exit;
        }

        // Insert attendance record (marked now by admin)
        $now = date('Y-m-d H:i:s');
        $stmt = $db->prepare("INSERT INTO attendance (member_id, meeting_id, login_time) VALUES (:mid, :mtid, :now)");
        $stmt->execute([':mid' => $member_id, ':mtid' => $meeting_id, ':now' => $now]);
        $new_id = $db->lastInsertId();

        // Log Audit Trail
        log_audit_trail($db, 'attendance', intval($new_id), 'create', null, [
            'member_id' => $member_id,
            'meeting_id' => $meeting_id,
            'login_time' => $now
        ], intval($user_id));

        echo json_encode(['success' => true, 'message' => 'Marked as present successfully']);

    } elseif ($action === 'unmark') {
        // Fetch the record before deleting it for audit trail
        $fetch = $db->prepare("SELECT id, member_id, meeting_id, login_time FROM attendance WHERE member_id = :mid AND meeting_id = :mtid LIMIT 1");
        $fetch->execute([':mid' => $member_id, ':mtid' => $meeting_id]);
        $record = $fetch->fetch(PDO::FETCH_ASSOC);

        if ($record) {
            $record_id = intval($record['id']);
            $old_values = [
                'member_id' => intval($record['member_id']),
                'meeting_id' => intval($record['meeting_id']),
                'login_time' => $record['login_time']
            ];

            $stmt = $db->prepare("DELETE FROM attendance WHERE id = :id");
            $stmt->execute([':id' => $record_id]);

            // Log Audit Trail
            log_audit_trail($db, 'attendance', $record_id, 'delete', $old_values, null, intval($user_id));
        }

        echo json_encode(['success' => true, 'message' => 'Marked as absent successfully']);
    }

} catch (PDOException $e) {
    error_log("mark_cell_attendance error: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Database error occurred: ' . $e->getMessage()]);
}
?>
