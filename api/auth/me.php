<?php
/**
 * Get Current User API Endpoint
 * GET /api/auth/me.php
 * 
 * Requires: Authorization: Bearer <token>
 */

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../middleware.php';

// Only allow GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    apiError('Method not allowed', 405);
}

// Authenticate user
$user = authenticate();

try {
    // Get full user data with member info
    $stmt = $db->prepare("
        SELECT 
            u.id,
            u.email,
            u.member_id,
            u.status,
            u.last_login,
            u.bio,
            m.first_name,
            m.last_name,
            m.phone_no,
            m.cell_id,
            m.bod,
            m.location,
            m.emp_status
        FROM users u
        LEFT JOIN member m ON u.member_id = m.id
        WHERE u.id = :user_id
    ");
    $stmt->execute([':user_id' => $user->id]);
    $userData = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$userData) {
        apiError('User not found', 404);
    }
    
    // Get user roles (handle missing tables gracefully)
    $roles = [];
    try {
        $roleStmt = $db->prepare("
            SELECT r.id, r.name, r.description
            FROM roles r
            JOIN user_roles ur ON r.id = ur.role_id
            WHERE ur.user_id = :user_id
        ");
        $roleStmt->execute([':user_id' => $user->id]);
        $roles = $roleStmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        // Roles table might not exist or have different structure
        error_log("Roles query error: " . $e->getMessage());
    }
    
    // Get permissions (if tables exist)
    $permissions = [];
    try {
        if (!empty($roles)) {
            $roleIds = array_column($roles, 'id');
            $placeholders = implode(',', array_fill(0, count($roleIds), '?'));
            $permStmt = $db->prepare("
                SELECT DISTINCT p.id, p.name
                FROM permissions p
                JOIN role_permissions rp ON p.id = rp.permission_id
                WHERE rp.role_id IN ($placeholders)
            ");
            $permStmt->execute($roleIds);
            $permissions = $permStmt->fetchAll(PDO::FETCH_ASSOC);
        }
    } catch (PDOException $e) {
        // Permissions tables might not exist
        error_log("Permissions query error: " . $e->getMessage());
    }
    
    // Get cell info if assigned
    $cellCode = null;
    if (!empty($userData['cell_id'])) {
        try {
            $cellStmt = $db->prepare("SELECT code FROM cells WHERE id = :cell_id");
            $cellStmt->execute([':cell_id' => $userData['cell_id']]);
            $cell = $cellStmt->fetch();
            $cellCode = $cell ? $cell['code'] : null;
        } catch (PDOException $e) {
            // Cell table issue
        }
    }
    
    apiSuccess([
        'user' => [
            'id' => $userData['id'],
            'email' => $userData['email'],
            'member_id' => $userData['member_id'],
            'firstname' => $userData['first_name'] ?? '',
            'lastname' => $userData['last_name'] ?? '',
            'phone' => $userData['phone_no'] ?? '',
            'cell_id' => $userData['cell_id'],
            'cell_code' => $cellCode,
            'dob' => $userData['bod'] ?? null,
            'location' => $userData['location'] ?? '',
            'emp_status' => $userData['emp_status'] ?? '',
            'bio' => $userData['bio'] ?? '',
            'status' => $userData['status'],
            'last_login' => $userData['last_login'],
            'roles' => $roles
        ],
        'permissions' => $permissions
    ], 'User data retrieved');
    
} catch (PDOException $e) {
    error_log("Me API error: " . $e->getMessage());
    apiError('Failed to retrieve user data: ' . $e->getMessage(), 500);
}
