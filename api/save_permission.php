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

    if ($action === 'create_category') {
        $name = trim($data['name'] ?? '');
        if (empty($name)) {
            apiError("Category name is required", 400);
        }
        $stmt = $db->prepare("INSERT INTO permission_category (name) VALUES (:name)");
        $stmt->execute([':name' => $name]);
        $id = $db->lastInsertId();

        $db->commit();
        echo json_encode(['success' => true, 'message' => 'Category created successfully', 'id' => $id]);
        exit;
    } 
    elseif ($action === 'delete_category') {
        $id = $data['id'] ?? null;
        if (!$id) {
            apiError("Category ID is required", 400);
        }

        // Deleting category also deletes permissions under it? Or just fails?
        // In the original code, it warns: "Deleting the category will automatically delete ALL permissions grouped under it!"
        // So we delete from role_permissions, then permissions, then category
        $db->prepare("
            DELETE rp FROM role_permissions rp
            INNER JOIN permissions p ON rp.permission_id = p.id
            WHERE p.category = :id
        ")->execute([':id' => $id]);
        
        $db->prepare("DELETE FROM permissions WHERE category = :id")->execute([':id' => $id]);
        $db->prepare("DELETE FROM permission_category WHERE id = :id")->execute([':id' => $id]);
        
        $db->commit();
        echo json_encode(['success' => true, 'message' => 'Category deleted successfully']);
        exit;
    }
    elseif ($action === 'create_permission') {
        $name = trim($data['name'] ?? '');
        $categoryId = $data['category_id'] ?? null;
        if (empty($name) || !$categoryId) {
            apiError("Permission name and category are required", 400);
        }
        $stmt = $db->prepare("INSERT INTO permissions (name, category) VALUES (:name, :category)");
        $stmt->execute([':name' => $name, ':category' => $categoryId]);
        $id = $db->lastInsertId();

        $db->commit();
        echo json_encode(['success' => true, 'message' => 'Permission created successfully', 'id' => $id]);
        exit;
    }
    elseif ($action === 'delete_permission') {
        $id = $data['id'] ?? null;
        if (!$id) {
            apiError("Permission ID is required", 400);
        }
        
        $db->prepare("DELETE FROM role_permissions WHERE permission_id = :id")->execute([':id' => $id]);
        $db->prepare("DELETE FROM permissions WHERE id = :id")->execute([':id' => $id]);
        
        $db->commit();
        echo json_encode(['success' => true, 'message' => 'Permission deleted successfully']);
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
