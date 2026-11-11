<?php
session_start();
require_once('../includes/connection.php');
include('../includes/checklogin.php');


header('Content-Type: application/json');

try {
    $role_id = (int)($_GET['role_id'] ?? 0);

    // Get all roles list (if no role_id specified)
    if (!$role_id) {
        $rolesStmt = $db->query("SELECT id, name FROM roles ORDER BY name");
        $users = [];
        $roles = $rolesStmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['success' => true, 'data' => ['users' => $users, 'roles' => $roles]]);
        exit;
    }

    // Get users in this role
    $stmt = $db->prepare("
        SELECT u.id, u.email,
               COALESCE(m.first_name, '') AS first_name,
               COALESCE(m.last_name, '')  AS last_name
        FROM users u
        JOIN user_roles ur ON ur.user_id = u.id AND ur.role_id = :role_id
        LEFT JOIN member m ON m.id = u.member_id
        WHERE u.status = 1
        ORDER BY first_name, last_name, u.email
    ");
    $stmt->execute([':role_id' => $role_id]);
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Build display name
    foreach ($users as &$u) {
        $fullName = trim($u['first_name'] . ' ' . $u['last_name']);
        $u['display_name'] = $fullName ?: $u['email'];
    }
    unset($u);

    // Also return all roles
    $rolesStmt = $db->query("SELECT id, name FROM roles ORDER BY name");
    $roles = $rolesStmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'data' => ['users' => $users, 'roles' => $roles]]);

} catch (PDOException $e) {
    error_log("Get users by role error: " . $e->getMessage());
    echo json_encode(['success' => false, 'error' => 'Failed to load users']);
}
