<?php
/**
 * Login As User API Endpoint
 * POST /api/auth/login_as_user.php
 * 
 * Request body:
 * {
 *   "user_id": 123
 * }
 */

ini_set('display_errors', 0);
error_reporting(E_ALL);

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../jwt.php';
require_once __DIR__ . '/../middleware.php';

// Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    apiError('Method not allowed', 405);
}

// 1. Authenticate the Admin
$authUser = authenticate();

// Check if user has permission
// We check if they are Super Admin (role 1) or Admin (role 3) or have explicit permission
$hasRole = in_array(1, $authUser->roles ?? []) || in_array(3, $authUser->roles ?? []);
$hasPermission = false;

// Fallback to checking explicit permission if not admin
if (!$hasRole) {
    require_once __DIR__ . '/../../manage/functions.php';
    if (function_exists('userHasPermission')) {
        $hasPermission = userHasPermission($db, $authUser->id, 'login_as_user');
    }
}

if (!$hasRole && !$hasPermission) {
    apiError('Insufficient permissions to login as another user', 403);
}

// 2. Get request body
$body = getJsonBody();
$target_user_id = intval($body['user_id'] ?? 0);

if (!$target_user_id) {
    apiError('Target user ID is required', 400);
}

try {
    // 3. Query target user
    $stmt = $db->prepare("
        SELECT u.*, m.first_name, m.last_name, m.phone_no, m.cell_id
        FROM users u 
        LEFT JOIN member m ON u.member_id = m.id 
        WHERE u.id = :id 
        LIMIT 1
    ");
    $stmt->execute([':id' => $target_user_id]);
    $user = $stmt->fetch(PDO::FETCH_OBJ);
    
    if (!$user) {
        apiError('Target user not found', 404);
    }
    
    // Check if account is active
    if (isset($user->status) && $user->status != 1) {
        apiError('The target account is inactive.', 403);
    }
    
    // 4. Audit Log
    try {
        $auditStmt = $db->prepare("
            INSERT INTO audit_log (table_name, record_id, action, old_values, new_values, user_id, ip_address)
            VALUES (:table, :record_id, :action, :old_val, :new_val, :user_id, :ip)
        ");
        $auditStmt->execute([
            ':table' => 'users',
            ':record_id' => $user->id,
            ':action' => 'login_as_user',
            ':old_val' => null,
            ':new_val' => json_encode(['login_by_admin_id' => $authUser->id]),
            ':user_id' => $authUser->id,
            ':ip' => $_SERVER['REMOTE_ADDR'] ?? ''
        ]);
    } catch (PDOException $e) {
        // Continue even if audit fails
        error_log("Audit log failed: " . $e->getMessage());
    }

    // 5. Get user roles
    $userRoles = [];
    try {
        $roleStmt = $db->prepare("
            SELECT r.id, r.name 
            FROM roles r 
            JOIN user_roles ur ON r.id = ur.role_id 
            WHERE ur.user_id = :user_id
        ");
        $roleStmt->execute([':user_id' => $user->id]);
        $userRoles = $roleStmt->fetchAll(PDO::FETCH_OBJ);
    } catch (PDOException $e) {
        try {
            $roleStmt = $db->prepare("
                SELECT r.id, r.role_name as name 
                FROM roles r 
                JOIN user_roles ur ON r.id = ur.role_id 
                WHERE ur.user_id = :user_id
            ");
            $roleStmt->execute([':user_id' => $user->id]);
            $userRoles = $roleStmt->fetchAll(PDO::FETCH_OBJ);
        } catch (PDOException $e2) {
            error_log("Roles query failed: " . $e2->getMessage());
        }
    }

    // 6. Get permissions
    $permissions = [];
    try {
        if (!empty($userRoles)) {
            $roleIds = array_column($userRoles, 'id');
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
        error_log("Permissions query failed: " . $e->getMessage());
    }
    
    // 7. Generate JWT token
    $accessToken = JWT::generate([
        'user_id' => $user->id,
        'email' => $user->email,
        'member_id' => $user->member_id,
        'roles' => array_column($userRoles, 'id')
    ]);
    
    // Generate refresh token
    $refreshToken = JWT::generateRefreshToken();
    $refreshExpiry = date('Y-m-d H:i:s', strtotime('+' . REFRESH_TOKEN_EXPIRE_DAYS . ' days'));
    
    // Store refresh token
    try {
        $stmt = $db->prepare("
            INSERT INTO refresh_tokens (user_id, token, expires_at, ip_address, user_agent)
            VALUES (:user_id, :token, :expires_at, :ip_address, :user_agent)
        ");
        $stmt->execute([
            ':user_id' => $user->id,
            ':token' => hash('sha256', $refreshToken),
            ':expires_at' => $refreshExpiry,
            ':ip_address' => $_SERVER['REMOTE_ADDR'] ?? '',
            ':user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? ''
        ]);
    } catch (PDOException $e) {
        error_log("Refresh token storage failed: " . $e->getMessage());
    }
    
    // 8. Return tokens and user data
    apiSuccess([
        'access_token' => $accessToken,
        'refresh_token' => $refreshToken,
        'token_type' => 'Bearer',
        'expires_in' => JWT_EXPIRE_HOURS * 3600,
        'user' => [
            'id' => $user->id,
            'email' => $user->email,
            'firstname' => $user->first_name ?? '',
            'lastname' => $user->last_name ?? '',
            'phone' => $user->phone_no ?? '',
            'member_id' => $user->member_id,
            'roles' => $userRoles,
            'permissions' => $permissions,
            'cell_id' => $user->cell_id ?? null
        ]
    ], 'Login as user successful');
    
} catch (PDOException $e) {
    error_log("Login As User error: " . $e->getMessage());
    apiError('Database error: ' . $e->getMessage(), 500);
}