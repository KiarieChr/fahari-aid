<?php
require_once 'config.php';
require_once 'middleware.php';

$data = json_decode(file_get_contents("php://input"), true);
if (!$data) {
    apiError("Invalid input JSON", 400);
}

$action = $data['action'] ?? '';

try {
    global $db;
    $db->beginTransaction();

    if ($action === 'create') {
        $name = trim($data['name'] ?? '');
        if (empty($name)) {
            apiError("Role name is required", 400);
        }
        $stmt = $db->prepare("INSERT INTO roles (name) VALUES (:name)");
        $stmt->execute([':name' => $name]);
        $id = $db->lastInsertId();

        $db->commit();
        echo json_encode(['success' => true, 'message' => 'Role created successfully', 'id' => $id]);
        exit;
    } 
    elseif ($action === 'update') {
        $id = $data['id'] ?? null;
        $name = trim($data['name'] ?? '');
        if (!$id || empty($name)) {
            apiError("Role ID and name are required", 400);
        }
        $stmt = $db->prepare("UPDATE roles SET name = :name WHERE id = :id");
        $stmt->execute([':name' => $name, ':id' => $id]);
        
        $db->commit();
        echo json_encode(['success' => true, 'message' => 'Role updated successfully']);
        exit;
    }
    elseif ($action === 'delete') {
        $id = $data['id'] ?? null;
        if (!$id) {
            apiError("Role ID is required", 400);
        }
        
        // Ensure not admin
        $stmtCheck = $db->prepare("SELECT name FROM roles WHERE id = :id");
        $stmtCheck->execute([':id' => $id]);
        $roleName = $stmtCheck->fetchColumn();
        if (in_array($roleName, ['Administrator', 'General Admin'])) {
            apiError("Cannot delete system roles", 400);
        }

        // Delete from user_roles and role_permissions first
        $db->prepare("DELETE FROM user_roles WHERE role_id = :id")->execute([':id' => $id]);
        $db->prepare("DELETE FROM role_permissions WHERE role_id = :id")->execute([':id' => $id]);
        $db->prepare("DELETE FROM roles WHERE id = :id")->execute([':id' => $id]);
        
        $db->commit();
        echo json_encode(['success' => true, 'message' => 'Role deleted successfully']);
        exit;
    }
    elseif ($action === 'assign_permissions') {
        $roleId = $data['role_id'] ?? null;
        $permissionIds = $data['permission_ids'] ?? [];
        
        if (!$roleId) {
            apiError("Role ID is required", 400);
        }

        // Clear existing
        $db->prepare("DELETE FROM role_permissions WHERE role_id = :role_id")->execute([':role_id' => $roleId]);

        // Insert new
        if (!empty($permissionIds)) {
            $stmt = $db->prepare("INSERT INTO role_permissions (role_id, permission_id) VALUES (:role_id, :permission_id)");
            foreach ($permissionIds as $pid) {
                $stmt->execute([':role_id' => $roleId, ':permission_id' => $pid]);
            }
        }
        
        $db->commit();
        echo json_encode(['success' => true, 'message' => 'Permissions updated successfully']);
        exit;
    }
    else {
        apiError("Invalid action", 400);
    }

} catch (PDOException $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    apiError("Database error: " . $e->getMessage(), 500);
}
?>
