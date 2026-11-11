<?php
/**
 * API Middleware
 * Handles authentication for protected routes
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/jwt.php';

/**
 * Authenticate request using JWT
 * Call this at the start of protected endpoints
 */
function authenticate() {
    global $db;
    
    // Get Authorization header
    $authHeader = getAuthorizationHeader();
    
    if (!$authHeader) {
        apiError('No authorization header provided', 401);
    }
    
    // Extract token from "Bearer <token>"
    if (!preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        apiError('Invalid authorization header format', 401);
    }
    
    $token = $matches[1];
    
    // Validate JWT
    $result = JWT::validate($token);
    
    if (!$result['valid']) {
        apiError($result['error'], 401);
    }
    
    $payload = $result['payload'];
    
    // Check if user still exists and is active
    $stmt = $db->prepare("SELECT id, email, member_id, status FROM users WHERE id = :id");
    $stmt->execute([':id' => $payload['user_id']]);
    $user = $stmt->fetch(PDO::FETCH_OBJ);
    
    if (!$user) {
        apiError('User not found', 401);
    }
    
    if ($user->status != 1) {
        apiError('Account is inactive', 403);
    }
    
    // Get user roles
    $roleStmt = $db->prepare("SELECT role_id FROM user_roles WHERE user_id = :user_id");
    $roleStmt->execute([':user_id' => $user->id]);
    $user->roles = array_column($roleStmt->fetchAll(PDO::FETCH_ASSOC), 'role_id');
    
    // Return authenticated user
    return $user;
}

/**
 * Get Authorization header
 */
function getAuthorizationHeader() {
    $headers = null;
    
    if (isset($_SERVER['Authorization'])) {
        $headers = trim($_SERVER['Authorization']);
    } elseif (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $headers = trim($_SERVER['HTTP_AUTHORIZATION']);
    } elseif (function_exists('apache_request_headers')) {
        $requestHeaders = apache_request_headers();
        $requestHeaders = array_combine(
            array_map('ucwords', array_keys($requestHeaders)),
            array_values($requestHeaders)
        );
        if (isset($requestHeaders['Authorization'])) {
            $headers = trim($requestHeaders['Authorization']);
        }
    }
    
    // Fallback to URL parameter for things like PDF downloads
    if (!$headers && isset($_GET['token'])) {
        $headers = 'Bearer ' . trim($_GET['token']);
    }
    
    return $headers;
}

/**
 * Optional authentication - returns user if valid token, null otherwise
 */
function optionalAuth() {
    global $db;
    
    $authHeader = getAuthorizationHeader();
    
    if (!$authHeader) {
        return null;
    }
    
    if (!preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        return null;
    }
    
    $token = $matches[1];
    $result = JWT::validate($token);
    
    if (!$result['valid']) {
        return null;
    }
    
    $payload = $result['payload'];
    
    try {
        $stmt = $db->prepare("SELECT id, email, member_id, status FROM users WHERE id = :id AND status = 1");
        $stmt->execute([':id' => $payload['user_id']]);
        $user = $stmt->fetch(PDO::FETCH_OBJ);
        
        if ($user) {
            // Get user roles
            try {
                $roleStmt = $db->prepare("SELECT role_id FROM user_roles WHERE user_id = :user_id");
                $roleStmt->execute([':user_id' => $user->id]);
                $user->roles = array_column($roleStmt->fetchAll(PDO::FETCH_ASSOC), 'role_id');
            } catch (PDOException $e) {
                $user->roles = [];
            }
        }
        
        return $user;
    } catch (PDOException $e) {
        return null;
    }
}

/**
 * Check if user has required role
 */
function requireRole($user, $allowedRoles) {
    if (empty($user->roles) || !array_intersect($user->roles, $allowedRoles)) {
        apiError('Insufficient permissions', 403);
    }
}

/**
 * Check if user has any of the required roles
 */
function hasRole($user, $roleId) {
    return in_array($roleId, $user->roles ?? []);
}

require_once __DIR__ . '/../manage/functions.php';

/**
 * Check if user has specific permission
 */
function requirePermission($db, $user, $permissionName) {
    if (!userHasPermission($db, $user->id, $permissionName)) {
        apiError('Insufficient permissions. Required: ' . $permissionName, 403);
    }
}
