<?php
require_once 'config.php';
require_once 'middleware.php';

try {
    global $db;

    // Get all roles with user counts
    $stmtRoles = $db->query("
        SELECT r.id, r.name, 
               (SELECT COUNT(*) FROM user_roles ur WHERE ur.role_id = r.id) AS user_count
        FROM roles r
        ORDER BY r.id DESC
    ");
    $roles = $stmtRoles->fetchAll(PDO::FETCH_ASSOC);

    // Get all permissions
    $stmtPerms = $db->query("
        SELECT id, name as permission, category as category_id, created_at 
        FROM permissions 
        ORDER BY id DESC
    ");
    $permissions = $stmtPerms->fetchAll(PDO::FETCH_ASSOC);

    // Get all categories
    $stmtCats = $db->query("
        SELECT id, name 
        FROM permission_category 
        ORDER BY name ASC
    ");
    $categories = $stmtCats->fetchAll(PDO::FETCH_ASSOC);

    // Get role permissions mapping
    $stmtRolePerms = $db->query("
        SELECT role_id, permission_id 
        FROM role_permissions
    ");
    $rolePermissions = $stmtRolePerms->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'data' => [
            'roles' => $roles,
            'permissions' => $permissions,
            'categories' => $categories,
            'rolePermissions' => $rolePermissions
        ]
    ]);
} catch (PDOException $e) {
    apiError("Database error: " . $e->getMessage(), 500);
}
?>
