<?php
/**
 * Delete Devotional API
 * DELETE /api/delete_devotional.php
 * 
 * Request body:
 * {
 *   "id": 1
 * }
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/middleware.php';

if (!in_array($_SERVER['REQUEST_METHOD'], ['DELETE', 'POST'])) {
    apiError('Method not allowed', 405);
}

$user = authenticate();

$body = getJsonBody();
$id = (int)($body['id'] ?? 0);

if ($id <= 0) {
    apiError('Devotional ID is required', 400);
}

try {
    // Check exists
    $stmt = $db->prepare("SELECT id FROM devotionals WHERE id = :id");
    $stmt->execute([':id' => $id]);
    if (!$stmt->fetch()) {
        apiError('Devotional not found', 404);
    }

    // Delete category mappings first
    try {
        $stmt = $db->prepare("DELETE FROM devotional_category_map WHERE devotional_id = :id");
        $stmt->execute([':id' => $id]);
    } catch (PDOException $e) {
        // Table may not exist yet
    }

    // Delete devotional
    $stmt = $db->prepare("DELETE FROM devotionals WHERE id = :id");
    $stmt->execute([':id' => $id]);

    apiSuccess(null, 'Devotional deleted successfully');

} catch (PDOException $e) {
    error_log("Delete devotional error: " . $e->getMessage());
    apiError('Failed to delete devotional', 500);
}
