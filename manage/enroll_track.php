<?php
session_start();
require_once('../includes/connection.php');
include('../includes/checklogin.php');

$currentUserId = $user_id ?? 0;

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

if (!$currentUserId) {
    echo json_encode(['success' => false, 'error' => 'Not authenticated']);
    exit;
}

$body = json_decode(file_get_contents('php://input'), true);
$track_id = (int)($body['track_id'] ?? 0);

if (!$track_id) {
    echo json_encode(['success' => false, 'error' => 'track_id is required']);
    exit;
}

try {
    // Check if already enrolled
    $checkStmt = $db->prepare("SELECT id FROM trn_track_enrollments WHERE trainee_id = :uid AND track_id = :tid");
    $checkStmt->execute([':uid' => $currentUserId, ':tid' => $track_id]);
    if ($checkStmt->fetch()) {
        echo json_encode(['success' => false, 'error' => 'Already enrolled in this track']);
        exit;
    }

    // Auto-assign a coach (for MVP, we just pick the first active coach for this track)
    $coachStmt = $db->prepare("SELECT id FROM trn_coaches WHERE track_id = :tid AND status = 1 LIMIT 1");
    $coachStmt->execute([':tid' => $track_id]);
    $coach = $coachStmt->fetch(PDO::FETCH_ASSOC);
    $coach_id = $coach ? $coach['id'] : null;

    $stmt = $db->prepare("INSERT INTO trn_track_enrollments (trainee_id, track_id, coach_id, status) VALUES (:uid, :tid, :cid, 'active')");
    $stmt->execute([
        ':uid' => $currentUserId,
        ':tid' => $track_id,
        ':cid' => $coach_id
    ]);

    echo json_encode(['success' => true]);

} catch (PDOException $e) {
    error_log("Error enrolling in track: " . $e->getMessage());
    echo json_encode(['success' => false, 'error' => 'Database error']);
}
