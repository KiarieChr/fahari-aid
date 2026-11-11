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

$trn_id = (int)($_POST['trn_id'] ?? 0);
$type = $_POST['type'] ?? '';

if (!$trn_id || !in_array($type, ['mentor', 'coach'])) {
    echo json_encode(['success' => false, 'error' => 'Invalid parameters']);
    exit;
}

try {
    if ($type === 'mentor') {
        $upd = $db->prepare("UPDATE trn_mentors SET status = 0 WHERE id = :id");
        $upd->execute([':id' => $trn_id]);
    } else {
        $upd = $db->prepare("UPDATE trn_coaches SET status = 0 WHERE id = :id");
        $upd->execute([':id' => $trn_id]);
    }

    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    error_log("Revoke Trainer Error: " . $e->getMessage());
    echo json_encode(['success' => false, 'error' => 'Database error occurred']);
}
?>
