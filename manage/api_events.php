<?php
session_start();
require_once('../includes/connection.php');
include('../includes/checklogin.php');

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
if (!$data && isset($_POST['action'])) {
    $data = $_POST; // Fallback to form data
}

$action = $data['action'] ?? '';

try {
    if ($action === 'create') {
        $name = trim($data['name']);
        $description = trim($data['description'] ?? '');
        $start_time = trim($data['start_date']); // Expected format: YYYY-MM-DDTHH:MM
        $end_time = trim($data['end_date']);
        $location = trim($data['location'] ?? '');
        
        $Stime = date("Y-m-d H:i:s", strtotime($start_time));
        $Etime = date("Y-m-d H:i:s", strtotime($end_time));

        // 1. Insert into Event
        $stmt = $db->prepare("INSERT INTO event (ename, notes, start_date, end_date, branch, status) VALUES (:name, :desc, :start, :end, :loc, 'published')");
        $stmt->execute([
            ':name' => $name,
            ':desc' => $description,
            ':start' => $Stime,
            ':end' => $Etime,
            ':loc' => $location
        ]);
        
        $event_id = $db->lastInsertId();

        // 2. Dual Creation: Insert into Meeting for ticketing and QR code attendance
        // We link it by storing EventID in the description
        $link_desc = json_encode(['event_id' => $event_id, 'type' => 'event']);
        $meetStmt = $db->prepare("INSERT INTO meeting (name, start_time, end_time, description, branch, meeting_type) VALUES (:name, :start, :end, :desc, :branch, 2)");
        $meetStmt->execute([
            ':name' => $name,
            ':start' => $Stime,
            ':end' => $Etime,
            ':desc' => $link_desc,
            ':branch' => $location
        ]);
        
        $meeting_id = $db->lastInsertId();

        // 3. Insert into Calendar
        $calStmt = $db->prepare("INSERT INTO calendar(title, start_date, end_date, url, calendar_label) VALUES (:title, :start, :end, :url, 'Jesus Enthroned Events')");
        $calStmt->execute([
            ':title' => $name,
            ':start' => $Stime,
            ':end' => $Etime,
            ':url' => $location
        ]);

        echo json_encode([
            'success' => true, 
            'message' => 'Event and ticketing meeting created successfully!',
            'event_id' => $event_id,
            'meeting_id' => $meeting_id
        ]);
        
    } elseif ($action === 'delete') {
        $event_id = intval($data['id']);
        
        $stmt = $db->prepare("UPDATE event SET delete_status = 1 WHERE id = :id");
        $stmt->execute([':id' => $event_id]);
        
        echo json_encode(['success' => true, 'message' => 'Event archived.']);
        
    } else {
        echo json_encode(['success' => false, 'error' => 'Invalid action']);
    }

} catch (PDOException $e) {
    error_log("API Events Error: " . $e->getMessage());
    echo json_encode(['success' => false, 'error' => 'Database error occurred.']);
}
