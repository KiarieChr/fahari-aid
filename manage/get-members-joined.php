<?php
require '../includes/connection.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $month = isset($_GET['month']) ? trim($_GET['month']) : '';

    if (empty($month) || !preg_match('/^\d{4}-\d{2}$/', $month)) {
        echo json_encode(['success' => false, 'message' => 'Invalid or missing month parameter. Expected format: YYYY-MM.']);
        exit;
    }

    try {
        $stmt = $db->prepare("
            SELECT m.id, m.first_name, m.last_name, m.email, m.phone_no, m.joined_on, COALESCE(c.name, 'Unassigned') as cell_name 
            FROM member m 
            LEFT JOIN cells c ON m.cell_id = c.id 
            WHERE DATE_FORMAT(m.joined_on, '%Y-%m') = :month 
            ORDER BY m.joined_on DESC
        ");
        $stmt->execute([':month' => $month]);
        $members = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Format dates nicely
        foreach ($members as &$member) {
            $member['joined_on_formatted'] = date('M d, Y', strtotime($member['joined_on']));
            $member['full_name'] = $member['first_name'] . ' ' . $member['last_name'];
        }

        echo json_encode([
            'success' => true,
            'month' => $month,
            'count' => count($members),
            'data' => $members
        ]);
    } catch (PDOException $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Database error: ' . $e->getMessage()
        ]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request method.']);
}
?>
