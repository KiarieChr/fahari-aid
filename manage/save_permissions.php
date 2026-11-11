<?php
require '../includes/connection.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $role_id = $_POST['role_id'] ?? null;
    $permissions = $_POST['permissions'] ?? [];

    if (!$role_id) {
        http_response_code(400);
        echo json_encode(["error" => "Missing role_id"]);
        exit;
    }

    // Filter only numeric permission IDs (exclude category IDs like "cat_1")
    $permission_ids = array_filter($permissions, function($id) {
        return is_numeric($id);
    });

    try {
        $db->beginTransaction();

        // Prepare insert and check statements
        $checkStmt = $db->prepare("SELECT COUNT(*) FROM role_permissions WHERE role_id = :role_id AND permission_id = :permission_id");
        $insertStmt = $db->prepare("INSERT INTO role_permissions (role_id, permission_id) VALUES (:role_id, :permission_id)");

        foreach ($permission_ids as $perm_id) {
            // Check if the permission already exists for this role
            $checkStmt->execute([
                ':role_id' => $role_id,
                ':permission_id' => $perm_id
            ]);
            $exists = $checkStmt->fetchColumn();

            if (!$exists) {
                // Insert only if it doesn't exist
                $insertStmt->execute([
                    ':role_id' => $role_id,
                    ':permission_id' => $perm_id
                ]);
            }
        }

        $db->commit();
        echo json_encode(["success" => true]);

    } catch (Exception $e) {
        $db->rollBack();
        http_response_code(500);
        echo json_encode(["error" => "Failed to save permissions", "details" => $e->getMessage()]);
    }
}
?>