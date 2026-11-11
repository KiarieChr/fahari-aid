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
$module_id = isset($data['module_id']) ? intval($data['module_id']) : 0;
$media_url = isset($data['media_url']) ? trim($data['media_url']) : '';

if (!$module_id || empty($media_url)) {
    echo json_encode(['success' => false, 'error' => 'Missing required fields']);
    exit;
}

try {
    // Get assignment ID for this module
    $stmtAssig = $db->prepare("SELECT id FROM trn_practical_assignments WHERE module_id = :mid LIMIT 1");
    $stmtAssig->execute([':mid' => $module_id]);
    $assignment = $stmtAssig->fetch(PDO::FETCH_ASSOC);

    if (!$assignment) {
        echo json_encode(['success' => false, 'error' => 'No practical assignment found for this module.']);
        exit;
    }

    // Insert submission
    $stmt = $db->prepare("INSERT INTO trn_assignment_submissions (trainee_id, assignment_id, media_url, status) VALUES (:trainee, :assig, :url, 'pending_review')");
    $stmt->execute([
        ':trainee' => $currentUserId,
        ':assig'   => $assignment['id'],
        ':url'     => $media_url
    ]);
    
    echo json_encode(['success' => true]);

} catch (PDOException $e) {
    error_log("Error submitting assignment: " . $e->getMessage());
    echo json_encode(['success' => false, 'error' => 'Database error occurred']);
}
