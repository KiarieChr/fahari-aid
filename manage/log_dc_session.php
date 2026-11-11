<?php
session_start();
require_once('../includes/connection.php');
include('../includes/checklogin.php');

header('Content-Type: application/json');

$currentUserId = $user_id ?? 0;

if (!$currentUserId) {
    echo json_encode(['success' => false, 'error' => 'Not authenticated']);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
$dc_id = isset($data['dc_id']) ? intval($data['dc_id']) : 0;
$date = $data['date'] ?? '';
$notes = $data['notes'] ?? '';
$qt = isset($data['qt']) ? intval($data['qt']) : null;
$memory = isset($data['memory']) ? intval($data['memory']) : 0;

if (!$dc_id || empty($date)) {
    echo json_encode(['success' => false, 'error' => 'Missing required fields']);
    exit;
}

try {
    $stmt = $db->prepare("INSERT INTO cell_dc_sessions (disciple_id, session_date, notes, quiet_time_rating, scripture_memory) VALUES (:did, :dt, :notes, :qt, :mem)");
    $stmt->execute([
        ':did' => $dc_id,
        ':dt' => $date,
        ':notes' => $notes,
        ':qt' => $qt,
        ':mem' => $memory
    ]);
    
    echo json_encode(['success' => true]);

} catch (PDOException $e) {
    error_log("Error logging DC session: " . $e->getMessage());
    echo json_encode(['success' => false, 'error' => 'Database error occurred']);
}
