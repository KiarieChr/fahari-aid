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

try {
    // 1. Check if user is a Mentor
    $stmtM = $db->prepare("SELECT id FROM trn_mentors WHERE user_id = :uid AND status = 1 LIMIT 1");
    $stmtM->execute([':uid' => $currentUserId]);
    $mentor = $stmtM->fetch(PDO::FETCH_ASSOC);
    $mentor_id = $mentor ? $mentor['id'] : null;

    // 2. Check if user is a Coach
    $stmtC = $db->prepare("SELECT id, track_id FROM trn_coaches WHERE user_id = :uid AND status = 1");
    $stmtC->execute([':uid' => $currentUserId]);
    $coaches = $stmtC->fetchAll(PDO::FETCH_ASSOC);
    $is_coach = count($coaches) > 0;

    if (!$mentor_id && !$is_coach) {
        echo json_encode(['success' => false, 'is_mentor' => false, 'is_coach' => false]);
        exit;
    }

    $data = [
        'success' => true,
        'is_mentor' => (bool)$mentor_id,
        'is_coach' => $is_coach,
        'mentees' => [],
        'reflections' => [],
        'evaluations' => []
    ];

    if ($mentor_id) {
        // Get Mentees
        $stmtMentees = $db->prepare("
            SELECT a.id as assignment_id, a.status, a.created_at, u.id as trainee_id, u.first_name, u.last_name, u.email, u.phone_no 
            FROM trn_mentorship_assignments a 
            JOIN users u ON a.trainee_id = u.id 
            WHERE a.mentor_id = :mid
        ");
        $stmtMentees->execute([':mid' => $mentor_id]);
        $data['mentees'] = $stmtMentees->fetchAll(PDO::FETCH_ASSOC);

        // Get Pending Reflections
        $stmtRef = $db->prepare("
            SELECT r.id as reflection_id, r.reflection_text, r.submitted_at, 
                   m.title as module_title, u.first_name, u.last_name 
            FROM trn_module_reflections r 
            JOIN trn_learning_modules m ON r.module_id = m.id 
            JOIN users u ON r.trainee_id = u.id 
            WHERE r.mentor_id = :mid AND r.mentor_response IS NULL
            ORDER BY r.submitted_at DESC
        ");
        $stmtRef->execute([':mid' => $mentor_id]);
        $data['reflections'] = $stmtRef->fetchAll(PDO::FETCH_ASSOC);
    }

    if ($is_coach) {
        $trackIds = array_column($coaches, 'track_id');
        if (!empty($trackIds)) {
            $inQuery = implode(',', array_fill(0, count($trackIds), '?'));
            
            // Get Evaluation Queue (Assignments submitted to tracks this coach manages)
            $stmtEval = $db->prepare("
                SELECT s.id as submission_id, s.media_url, s.submitted_at, s.status,
                       u.first_name, u.last_name, 
                       pa.title as assignment_title, m.title as module_title 
                FROM trn_assignment_submissions s 
                JOIN trn_practical_assignments pa ON s.assignment_id = pa.id 
                JOIN trn_learning_modules m ON pa.module_id = m.id 
                JOIN users u ON s.trainee_id = u.id 
                WHERE m.track_id IN ($inQuery) AND s.status = 'pending_review'
                ORDER BY s.submitted_at ASC
            ");
            $stmtEval->execute($trackIds);
            $data['evaluations'] = $stmtEval->fetchAll(PDO::FETCH_ASSOC);
        }
    }

    echo json_encode($data);

} catch (PDOException $e) {
    error_log("Error fetching mentor data: " . $e->getMessage());
    echo json_encode(['success' => false, 'error' => 'Database error']);
}
