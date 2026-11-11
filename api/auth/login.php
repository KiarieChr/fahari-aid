<?php
/**
 * Login API Endpoint
 * POST /api/auth/login.php
 * 
 * Request body:
 * {
 *   "email": "user@example.com",
 *   "password": "password123"
 * }
 */

// Enable error reporting for debugging
ini_set('display_errors', 0);
error_reporting(E_ALL);

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../jwt.php';

// Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    apiError('Method not allowed', 405);
}

// Get request body
$body = getJsonBody();

$email = trim($body['email'] ?? '');
$password = trim($body['password'] ?? '');

// Validate input
if (empty($email) || empty($password)) {
    apiError('Email and password are required', 400);
}

try {
    // Query user
    $stmt = $db->prepare("
        SELECT u.*, m.first_name, m.last_name, m.phone_no, m.cell_id
        FROM users u 
        LEFT JOIN member m ON u.member_id = m.id 
        WHERE u.email = :email 
        LIMIT 1
    ");
    $stmt->execute([':email' => $email]);
    $user = $stmt->fetch(PDO::FETCH_OBJ);
    
    if (!$user) {
        apiError('Invalid email or password', 401);
    }
    
    // Verify password
    if (!password_verify($password, $user->password)) {
        apiError('Invalid email or password', 401);
    }
    
    // Check if account is active
    if (isset($user->status) && $user->status != 1) {
        apiError('Your account is inactive. Please contact support.', 403);
    }
    
    // Get user roles (if user_roles table exists)
    $userRoles = [];
    try {
        // Try with 'name' column first (actual schema)
        $roleStmt = $db->prepare("
            SELECT r.id, r.name 
            FROM roles r 
            JOIN user_roles ur ON r.id = ur.role_id 
            WHERE ur.user_id = :user_id
        ");
        $roleStmt->execute([':user_id' => $user->id]);
        $userRoles = $roleStmt->fetchAll(PDO::FETCH_OBJ);
    } catch (PDOException $e) {
        // Try with 'role_name' column if 'name' doesn't exist
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
            // No roles table or user_roles - continue without roles
            error_log("Roles query failed: " . $e2->getMessage());
        }
    }
    // Get permissions
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
    
    // Generate JWT token
    $accessToken = JWT::generate([
        'user_id' => $user->id,
        'email' => $user->email,
        'member_id' => $user->member_id,
        'roles' => array_column($userRoles, 'id')
    ]);
    
    // Generate refresh token
    $refreshToken = JWT::generateRefreshToken();
    $refreshExpiry = date('Y-m-d H:i:s', strtotime('+' . REFRESH_TOKEN_EXPIRE_DAYS . ' days'));
    
    // Store refresh token in database (if table exists)
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
        // refresh_tokens table doesn't exist - continue without storing
        error_log("Refresh token storage failed: " . $e->getMessage());
    }
    
    // Update last login
    try {
        $db->prepare("UPDATE users SET last_login = NOW() WHERE id = :id")
           ->execute([':id' => $user->id]);
    } catch (PDOException $e) {
        // last_login column might not exist
    }
    
    // Return tokens and user data
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
    ], 'Login successful');
    
} catch (PDOException $e) {
    error_log("Login error: " . $e->getMessage());
    apiError('Database error: ' . $e->getMessage(), 500);
}