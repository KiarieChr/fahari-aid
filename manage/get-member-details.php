<?php
require '../includes/connection.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $member_id = isset($_GET['id']) ? intval($_GET['id']) : 0;

    if ($member_id <= 0) {
        echo json_encode(['success' => false, 'message' => 'Invalid member ID.']);
        exit;
    }

    try {
        // Fetch member
        $stmt = $db->prepare("SELECT * FROM member WHERE id = :id");
        $stmt->execute([':id' => $member_id]);
        $member = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$member) {
            echo json_encode(['success' => false, 'message' => 'Member not found.']);
            exit;
        }

        // Fetch Cell Group
        $cell_name = 'Unassigned';
        $cell_code = '';
        if ($member['cell_id']) {
            $c_stmt = $db->prepare("SELECT name, code FROM cells WHERE id = :id");
            $c_stmt->execute([':id' => $member['cell_id']]);
            $cell = $c_stmt->fetch(PDO::FETCH_ASSOC);
            if ($cell) {
                $cell_name = $cell['name'];
                $cell_code = $cell['code'];
            }
        }

        // Fetch Department
        $dept_name = $member['department'] ? $member['department'] : 'General';
        if ($member['department_id']) {
            $d_stmt = $db->prepare("SELECT name FROM departments WHERE id = :id");
            $d_stmt->execute([':id' => $member['department_id']]);
            $dept = $d_stmt->fetch(PDO::FETCH_ASSOC);
            if ($dept) {
                $dept_name = $dept['name'];
            }
        }

        // Fetch Attendance Stats
        $att_stmt = $db->prepare("
            SELECT 
                (SELECT COUNT(*) FROM attendance WHERE member_id = :id) as attended,
                (SELECT COUNT(*) FROM meeting) as total
        ");
        $att_stmt->execute([':id' => $member_id]);
        $att_stats = $att_stmt->fetch(PDO::FETCH_ASSOC);
        
        $attended = intval($att_stats['attended']);
        $total_meetings = intval($att_stats['total']);
        $attendance_rate = $total_meetings > 0 ? round(($attended / $total_meetings) * 100, 1) : 0;

        // Build data structure
        $data = [
            'id' => $member['id'],
            'first_name' => $member['first_name'],
            'last_name' => $member['last_name'],
            'name' => $member['first_name'] . ' ' . $member['last_name'],
            'email' => $member['email'],
            'phone_no' => $member['phone_no'],
            'location' => $member['location'],
            'gender' => $member['gender'] ? $member['gender'] : 'Not specified',
            'marital' => $member['marital'] ? $member['marital'] : 'Not specified',
            'emp_status' => $member['emp_status'] ? $member['emp_status'] : 'Not specified',
            'joined_on' => $member['joined_on'] ? date('M d, Y', strtotime($member['joined_on'])) : 'Not specified',
            'photo' => $member['photo'] ? $member['photo'] : $member['photo1'],
            'cell_name' => $cell_name,
            'cell_code' => $cell_code,
            'department' => $dept_name,
            'attendance_rate' => $attendance_rate,
            'attended_count' => $attended,
            'total_meetings' => $total_meetings
        ];

        echo json_encode(['success' => true, 'data' => $data]);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request method.']);
}
?>
