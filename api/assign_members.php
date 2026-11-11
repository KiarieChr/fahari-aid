<?php
/**
 * Assign Members to Cell API
 * POST /api/assign_members.php
 * 
 * Body: { cell_id: int, member_ids: [int] }
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/middleware.php';

$user = authenticate();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    apiError('Method not allowed', 405);
}

$body = getJsonBody();

$cell_id = (int)($body['cell_id'] ?? 0);
$member_ids = $body['member_ids'] ?? [];

if (!$cell_id) {
    apiError('Cell ID is required');
}

if (empty($member_ids) || !is_array($member_ids)) {
    apiError('At least one member must be selected');
}

// Sanitize member_ids
$member_ids = array_map('intval', $member_ids);

try {
    // Verify cell exists
    $cellStmt = $db->prepare("SELECT id, capacity FROM cells WHERE id = :id");
    $cellStmt->execute([':id' => $cell_id]);
    $cell = $cellStmt->fetch(PDO::FETCH_ASSOC);

    if (!$cell) {
        apiError('Cell not found', 404);
    }

    // Check capacity
    $currentCount = $db->prepare("SELECT COUNT(*) FROM member WHERE cell_id = :cell_id AND (delete_status IS NULL OR delete_status = '0')");
    $currentCount->execute([':cell_id' => $cell_id]);
    $current = (int)$currentCount->fetchColumn();
    $remaining = (int)$cell['capacity'] - $current;

    if (count($member_ids) > $remaining) {
        apiError("Cell capacity exceeded. Only $remaining spots available.");
    }

    $db->beginTransaction();

    $stmt = $db->prepare("UPDATE member SET cell_id = :cell_id WHERE id = :member_id");
    $assigned = 0;

    foreach ($member_ids as $mid) {
        $stmt->execute([':cell_id' => $cell_id, ':member_id' => $mid]);
        $assigned += $stmt->rowCount();
    }

    $db->commit();

    apiSuccess([
        'assigned_count' => $assigned,
        'cell_id' => $cell_id
    ], "$assigned member(s) assigned successfully");

} catch (PDOException $e) {
    $db->rollBack();
    error_log("Assign members error: " . $e->getMessage());
    apiError('Failed to assign members', 500);
}
