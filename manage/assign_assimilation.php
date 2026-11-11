<?php
session_start();
header('Content-Type: application/json');
require_once('../includes/connection.php');
include('../includes/checklogin.php');


if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

$body = json_decode(file_get_contents('php://input'), true);

$assimilation_id  = (int)($body['assimilation_id'] ?? 0);
$assigned_to      = (int)($body['assigned_to'] ?? 0);
$assigned_role_id = (int)($body['assigned_role_id'] ?? 0);

if (!$assimilation_id) { echo json_encode(['success'=>false, 'error'=>'assimilation_id is required']); exit; }
if (!$assigned_to)     { echo json_encode(['success'=>false, 'error'=>'assigned_to (user_id) is required']); exit; }

try {
    // Verify target user exists and is active
    $uStmt = $db->prepare("SELECT id, email FROM users WHERE id = :id AND status = 1");
    $uStmt->execute([':id' => $assigned_to]);
    $targetUser = $uStmt->fetch(PDO::FETCH_ASSOC);
    if (!$targetUser) { echo json_encode(['success'=>false, 'error'=>'Assigned user not found or inactive']); exit; }

    // Verify assimilation record exists
    $aStmt = $db->prepare("SELECT id, member_id FROM new_member_assimilation WHERE id = :id");
    $aStmt->execute([':id' => $assimilation_id]);
    $record = $aStmt->fetch(PDO::FETCH_ASSOC);
    if (!$record) { echo json_encode(['success'=>false, 'error'=>'Assimilation record not found']); exit; }

    // Update assignment
    $stmt = $db->prepare("
        UPDATE new_member_assimilation
        SET assigned_to = :uid, assigned_role_id = :rid, assigned_on = NOW(), updated_at = NOW()
        WHERE id = :id
    ");
    $stmt->execute([
        ':uid' => $assigned_to,
        ':rid' => $assigned_role_id ?: null,
        ':id'  => $assimilation_id,
    ]);

    // Audit Log
    $currentUserId = $user_id ?? 0;
    $auditStmt = $db->prepare("
        INSERT INTO audit_log (table_name, record_id, action, user_id, new_values)
        VALUES ('new_member_assimilation', :record_id, 'update', :user_id, :new_values)
    ");
    $auditStmt->execute([
        ':record_id' => $assimilation_id,
        ':user_id' => $currentUserId,
        ':new_values' => json_encode([
            'assigned_to' => $assigned_to,
            'assigned_role_id' => $assigned_role_id
        ])
    ]);

    echo json_encode([
        'success' => true,
        'data' => [
            'assimilation_id'   => $assimilation_id,
            'assigned_to'       => $assigned_to,
            'assigned_to_email' => $targetUser['email'],
        ]
    ]);

} catch (PDOException $e) {
    error_log("Assign assimilation error: " . $e->getMessage());
    echo json_encode(['success' => false, 'error' => 'Failed to assign follow-up']);
}
