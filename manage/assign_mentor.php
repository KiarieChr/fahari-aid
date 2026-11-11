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
$max_mentees = (int)($_POST['max_mentees'] ?? 5);

if (!$user_id_assign) {
    echo json_encode(['success' => false, 'error' => 'User ID is required']);
    exit;
}

try {
    // Check if already a mentor
    $check = $db->prepare("SELECT id FROM trn_mentors WHERE user_id = :uid");
    $check->execute([':uid' => $user_id_assign]);
    $existing = $check->fetch(PDO::FETCH_ASSOC);

    if ($existing) {
        // Update max mentees and set status to 1 if inactive
        $upd = $db->prepare("UPDATE trn_mentors SET max_mentees = :max, status = 1 WHERE id = :id");
        $upd->execute([':max' => $max_mentees, ':id' => $existing['id']]);
    } else {
        // Insert new
        $ins = $db->prepare("INSERT INTO trn_mentors (user_id, max_mentees, status) VALUES (:uid, :max, 1)");
        $ins->execute([':uid' => $user_id_assign, ':max' => $max_mentees]);
    }

    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    error_log("Assign Mentor Error: " . $e->getMessage());
    echo json_encode(['success' => false, 'error' => 'Database error occurred']);
}
?>
