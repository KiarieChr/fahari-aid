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
$action = $data['action'] ?? '';

try {
    if ($action === 'start') {
        $member_id = intval($data['member_id']);
        
        $stmt = $db->prepare("INSERT INTO cell_disciples (member_id, discipler_id, stage, status) VALUES (:mid, :did, 'New Birth', 'active') ON DUPLICATE KEY UPDATE status = 'active'");
        $stmt->execute([':mid' => $member_id, ':did' => $currentUserId]);
        
        echo json_encode(['success' => true]);
        
    } elseif ($action === 'advance') {
        $dc_id = intval($data['dc_id']);
        $stage = $data['stage'];
        
        $stmt = $db->prepare("UPDATE cell_disciples SET stage = :stage WHERE id = :id");
        $stmt->execute([':stage' => $stage, ':id' => $dc_id]);
        
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Invalid action']);
    }

} catch (PDOException $e) {
    error_log("Error updating DC stage: " . $e->getMessage());
    echo json_encode(['success' => false, 'error' => 'Database error occurred']);
}
