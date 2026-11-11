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
$reflection_text = isset($data['reflection_text']) ? trim($data['reflection_text']) : '';

if (!$module_id || empty($reflection_text)) {
    echo json_encode(['success' => false, 'error' => 'Missing required fields']);
    exit;
}

try {
    // Check if user has an active mentor
    $stmtMentor = $db->prepare("SELECT mentor_id FROM trn_mentorship_assignments WHERE trainee_id = :uid AND status = 'active' LIMIT 1");
    $stmtMentor->execute([':uid' => $currentUserId]);
    $assignment = $stmtMentor->fetch(PDO::FETCH_ASSOC);

    if (!$assignment) {
        echo json_encode(['success' => false, 'error' => 'You do not have an active mentor assigned yet. Please contact administration.']);
        exit;
    }

    $mentor_id = $assignment['mentor_id'];

    // Insert reflection
    $stmt = $db->prepare("INSERT INTO trn_module_reflections (trainee_id, mentor_id, module_id, reflection_text) VALUES (:trainee, :mentor, :module, :text)");
    $stmt->execute([
        ':trainee' => $currentUserId,
        ':mentor'  => $mentor_id,
        ':module'  => $module_id,
        ':text'    => $reflection_text
    ]);
    
    // Also log progress for this module as 'completed'
    // First find the enrollment ID for this module's track
    $stmtTrack = $db->prepare("SELECT track_id FROM trn_learning_modules WHERE id = :mid");
    $stmtTrack->execute([':mid' => $module_id]);
    $trackInfo = $stmtTrack->fetch(PDO::FETCH_ASSOC);
    
    if ($trackInfo) {
        $track_id = $trackInfo['track_id'];
        $stmtEnroll = $db->prepare("SELECT id FROM trn_track_enrollments WHERE trainee_id = :uid AND track_id = :tid LIMIT 1");
        $stmtEnroll->execute([':uid' => $currentUserId, ':tid' => $track_id]);
        $enrollment = $stmtEnroll->fetch(PDO::FETCH_ASSOC);
        
        if ($enrollment) {
            // Check if progress already exists
            $stmtCheckProg = $db->prepare("SELECT id FROM trn_module_progress WHERE enrollment_id = :eid AND module_id = :mid");
            $stmtCheckProg->execute([':eid' => $enrollment['id'], ':mid' => $module_id]);
            
            if (!$stmtCheckProg->fetch()) {
                // Insert progress
                $stmtProg = $db->prepare("INSERT INTO trn_module_progress (enrollment_id, module_id, status, completed_at) VALUES (:eid, :mid, 'completed', NOW())");
                $stmtProg->execute([':eid' => $enrollment['id'], ':mid' => $module_id]);
            }
        }
    }

    echo json_encode(['success' => true]);

} catch (PDOException $e) {
    error_log("Error submitting reflection: " . $e->getMessage());
    echo json_encode(['success' => false, 'error' => 'Database error occurred']);
}
