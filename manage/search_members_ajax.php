<?php
/**
 * search_members_ajax.php
 * Search existing members by name or phone number to prevent duplicates
 */
session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/../includes/connection.php';
require_once __DIR__ . '/../includes/checklogin.php';

$action = isset($_GET['action']) ? trim($_GET['action']) : '';

if ($action === 'get_meeting_attendance') {
    $meeting_id = isset($_GET['meeting_id']) ? intval($_GET['meeting_id']) : 0;
    if (!$meeting_id) {
        echo json_encode([]);
        exit;
    }
    try {
        $stmt = $db->prepare("SELECT member_id FROM attendance WHERE meeting_id = ?");
        $stmt->execute([$meeting_id]);
        $present_ids = $stmt->fetchAll(PDO::FETCH_COLUMN);
        echo json_encode($present_ids);
    } catch (PDOException $e) {
        error_log("search_members_ajax get_meeting_attendance error: " . $e->getMessage());
        echo json_encode(['error' => 'Database query failed']);
    }
    exit;
}

$query = isset($_GET['query']) ? trim($_GET['query']) : '';

if (strlen($query) < 2) {
    echo json_encode([]);
    exit;
}

try {
    $search = "%{$query}%";
    $stmt = $db->prepare("
        SELECT id, first_name, last_name, phone_no, email, location
        FROM member
        WHERE (first_name LIKE ? 
           OR last_name LIKE ? 
           OR phone_no LIKE ?)
          AND (delete_status IS NULL OR delete_status = 'Active' OR delete_status = '0')
        ORDER BY first_name ASC
        LIMIT 10
    ");
    $stmt->execute([$search, $search, $search]);
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($results);
} catch (PDOException $e) {
    error_log("search_members_ajax error: " . $e->getMessage());
    echo json_encode(['error' => 'Database query failed']);
}
?>
