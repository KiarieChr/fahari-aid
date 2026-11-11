<?php
/**
 * Save Hierarchy Node API
 * POST /api/save_hierarchy_node.php
 * 
 * Request body:
 * {
 *   "action": "create" | "update" | "delete" | "move",
 *   "id": 1, (optional)
 *   "level_id": 1,
 *   "parent_id": 2, (nullable)
 *   "name": "Nairobi Region"
 * }
 */
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/middleware.php';

$user = authenticate();
requirePermission($db, $user, 'manage_settings'); // Assuming they need this to modify structure

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    apiError('Method not allowed', 405);
}

$body = getJsonBody();
$action = $body['action'] ?? '';
$id = isset($body['id']) ? (int)$body['id'] : null;
$level_id = isset($body['level_id']) ? (int)$body['level_id'] : null;
$parent_id = isset($body['parent_id']) && $body['parent_id'] !== '' ? (int)$body['parent_id'] : null;
$name = trim($body['name'] ?? '');

try {
    $db->beginTransaction();

    if ($action === 'create') {
        if (!$level_id || !$name) {
            apiError("level_id and name are required", 400);
        }
        $stmt = $db->prepare("INSERT INTO hierarchy_nodes (level_id, parent_id, name) VALUES (?, ?, ?)");
        $stmt->execute([$level_id, $parent_id, $name]);
        $message = "Node created successfully.";
    } 
    elseif ($action === 'update') {
        if (!$id || !$name) {
            apiError("id and name are required", 400);
        }
        $stmt = $db->prepare("UPDATE hierarchy_nodes SET name = ? WHERE id = ?");
        $stmt->execute([$name, $id]);
        $message = "Node updated successfully.";
    }
    elseif ($action === 'move') {
        if (!$id) {
            apiError("id is required", 400);
        }
        // Prevent moving a node to itself
        if ($id === $parent_id) {
            apiError("Cannot move a node to itself", 400);
        }
        // TODO: Prevent circular references in a production app
        $stmt = $db->prepare("UPDATE hierarchy_nodes SET parent_id = ? WHERE id = ?");
        $stmt->execute([$parent_id, $id]);
        $message = "Node moved successfully.";
    }
    elseif ($action === 'delete') {
        if (!$id) {
            apiError("id is required", 400);
        }
        // Delete all children recursively? Or just restrict deletion if it has children.
        // Let's restrict for safety.
        $check = $db->prepare("SELECT id FROM hierarchy_nodes WHERE parent_id = ? LIMIT 1");
        $check->execute([$id]);
        if ($check->fetch()) {
            apiError("Cannot delete node because it has child nodes.", 400);
        }
        
        $stmt = $db->prepare("DELETE FROM hierarchy_nodes WHERE id = ?");
        $stmt->execute([$id]);
        $message = "Node deleted successfully.";
    } 
    else {
        apiError("Invalid action", 400);
    }

    $db->commit();
    echo json_encode(['success' => true, 'message' => $message]);

} catch (PDOException $e) {
    $db->rollBack();
    error_log("Save hierarchy node error: " . $e->getMessage());
    apiError('Failed to save node', 500);
}
