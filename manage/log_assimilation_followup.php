<?php
session_start();
header('Content-Type: application/json');
require_once('../includes/connection.php');
include('../includes/checklogin.php');

$currentUserId = $user_id ?? 0;



if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

$body = json_decode(file_get_contents('php://input'), true);

$assimilation_id = (int)($body['assimilation_id'] ?? 0);
$contact_type    = $body['contact_type'] ?? '';
$reached         = (int)(!empty($body['reached']));
$outcome_tags    = $body['outcome_tags'] ?? [];
$next_steps      = $body['next_steps'] ?? [];
$cell_leader_id  = !empty($body['cell_leader_id']) ? (int)$body['cell_leader_id'] : null;
$notes           = trim($body['notes'] ?? '');

if (!$assimilation_id) { echo json_encode(['success'=>false, 'error'=>'assimilation_id is required']); exit; }
if (!in_array($contact_type, ['phone_call','sms_whatsapp','home_visit','coffee_meetup'])) {
    echo json_encode(['success'=>false, 'error'=>'Invalid contact_type']); exit;
}

try {
    $db->beginTransaction();

    // Verify assimilation record exists
    $checkStmt = $db->prepare("SELECT id, assimilation_status FROM new_member_assimilation WHERE id = :id");
    $checkStmt->execute([':id' => $assimilation_id]);
    $record = $checkStmt->fetch(PDO::FETCH_ASSOC);
    if (!$record) {
        $db->rollBack();
        echo json_encode(['success'=>false, 'error'=>'Assimilation record not found']);
        exit;
    }

    // Insert follow-up log
    $insertStmt = $db->prepare("
        INSERT INTO assimilation_followups
            (assimilation_id, logged_by, contact_type, reached, outcome_tags, next_steps, cell_leader_id, notes)
        VALUES
            (:aid, :logged_by, :ctype, :reached, :outcomes, :steps, :cell_leader, :notes)
    ");
    $insertStmt->execute([
        ':aid'         => $assimilation_id,
        ':logged_by'   => $currentUserId,
        ':ctype'       => $contact_type,
        ':reached'     => $reached,
        ':outcomes'    => json_encode($outcome_tags),
        ':steps'       => json_encode($next_steps),
        ':cell_leader' => $cell_leader_id,
        ':notes'       => $notes,
    ]);
    $followupId = (int)$db->lastInsertId();

    // Audit Log
    $auditStmt = $db->prepare("
        INSERT INTO audit_log (table_name, record_id, action, user_id, new_values)
        VALUES ('assimilation_followups', :record_id, 'create', :user_id, :new_values)
    ");
    $auditStmt->execute([
        ':record_id' => $followupId,
        ':user_id' => $currentUserId,
        ':new_values' => json_encode([
            'assimilation_id' => $assimilation_id,
            'contact_type' => $contact_type,
            'reached' => $reached,
            'outcome_tags' => $outcome_tags
        ])
    ]);

    // Update assimilation status based on outcome
    $newStatus = $record['assimilation_status'];
    if ($reached) {
        // Check if being assigned to cell
        if (in_array('Connect to Cell Leader', (array)$next_steps) || $cell_leader_id) {
            $newStatus = 'cell_assigned';
            $db->prepare("UPDATE new_member_assimilation SET cell_assigned_at = NOW() WHERE id = :id AND cell_assigned_at IS NULL")
               ->execute([':id' => $assimilation_id]);
        } else {
            $newStatus = 'contacted';
        }
        // Set first_contact_at if not already set
        $db->prepare("UPDATE new_member_assimilation SET first_contact_at = NOW() WHERE id = :id AND first_contact_at IS NULL")
           ->execute([':id' => $assimilation_id]);
    } else {
        if ($record['assimilation_status'] === 'uncontacted') {
            $newStatus = 'attempted';
        }
    }

    // Save updated status
    $updateStmt = $db->prepare("
        UPDATE new_member_assimilation
        SET assimilation_status = :status, updated_at = NOW()
        WHERE id = :id
    ");
    $updateStmt->execute([':status' => $newStatus, ':id' => $assimilation_id]);

    $db->commit();

    echo json_encode([
        'success' => true,
        'data' => [
            'followup_id'    => $followupId,
            'new_status'     => $newStatus,
        ]
    ]);

} catch (PDOException $e) {
    $db->rollBack();
    error_log("Log assimilation followup error: " . $e->getMessage());
    echo json_encode(['success' => false, 'error' => 'Failed to log follow-up']);
}
