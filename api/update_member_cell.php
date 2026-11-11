<?php
/**
 * Update Member Cell API
 * POST /api/update_member_cell.php
 * 
 * Body: { member_id: int, cell_id: int|null, action: 'reassign'|'remove' }
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/middleware.php';

$user = authenticate();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    apiError('Method not allowed', 405);
}

$body = getJsonBody();

$member_id = (int)($body['member_id'] ?? 0);
$action = $body['action'] ?? '';

if (!$member_id) {
    apiError('Member ID is required');
}

if (!in_array($action, ['reassign', 'remove'])) {
    apiError('Action must be "reassign" or "remove"');
}

try {
    if ($action === 'remove') {
        $stmt = $db->prepare("UPDATE member SET cell_id = NULL WHERE id = :member_id");
        $stmt->execute([':member_id' => $member_id]);

        apiSuccess(['member_id' => $member_id], 'Member removed from cell');
    } else {
        $cell_id = (int)($body['cell_id'] ?? 0);
        if (!$cell_id) {
            apiError('Cell ID is required for reassignment');
        }

        // Verify cell exists
        $cellStmt = $db->prepare("SELECT id FROM cells WHERE id = :id");
        $cellStmt->execute([':id' => $cell_id]);
        if (!$cellStmt->fetch()) {
            apiError('Target cell not found', 404);
        }

        $stmt = $db->prepare("UPDATE member SET cell_id = :cell_id WHERE id = :member_id");
        $stmt->execute([':cell_id' => $cell_id, ':member_id' => $member_id]);

        apiSuccess(['member_id' => $member_id, 'cell_id' => $cell_id], 'Member reassigned successfully');
    }

} catch (PDOException $e) {
    error_log("Update member cell error: " . $e->getMessage());
    apiError('Failed to update member cell', 500);
}
