<?php
session_start();
require_once('../includes/connection.php');
include('../includes/checklogin.php');
require_once('functions.php');

$currentUserId = $user_id ?? 0;
header('Content-Type: application/json');

if (!$currentUserId) {
    echo json_encode(['success' => false, 'error' => 'Not authenticated']);
    exit;
}

if (!userHasPermission($db, $currentUserId, 'senior_leadership') && !userHasPermission($db, $currentUserId, 'dc_coordinator')) {
    echo json_encode(['success' => false, 'error' => 'Permission denied']);
    exit;
}

$user_id_assign = (int)($_POST['user_id'] ?? 0);
$track_id = (int)($_POST['track_id'] ?? 0);

if (!$user_id_assign || !$track_id) {
    echo json_encode(['success' => false, 'error' => 'User ID and Track ID are required']);
    exit;
}

try {
    // Check if already a coach for this track
    $check = $db->prepare("SELECT id FROM trn_coaches WHERE user_id = :uid AND track_id = :tid");
    $check->execute([':uid' => $user_id_assign, ':tid' => $track_id]);
    $existing = $check->fetch(PDO::FETCH_ASSOC);

    if ($existing) {
        // Just set status to 1 if inactive
        $upd = $db->prepare("UPDATE trn_coaches SET status = 1 WHERE id = :id");
        $upd->execute([':id' => $existing['id']]);
    } else {
        // Insert new
        $ins = $db->prepare("INSERT INTO trn_coaches (user_id, track_id, status) VALUES (:uid, :tid, 1)");
        $ins->execute([':uid' => $user_id_assign, ':tid' => $track_id]);
    }

    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    error_log("Assign Coach Error: " . $e->getMessage());
    echo json_encode(['success' => false, 'error' => 'Database error occurred']);
}
?>
