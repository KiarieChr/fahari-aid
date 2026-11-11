<?php
/**
 * Logout API Endpoint
 * POST /api/auth/logout.php
 * 
 * Requires: Authorization: Bearer <token>
 * 
 * Optional body:
 * {
 *   "refresh_token": "...",
 *   "all_devices": false
 * }
 */

require_once __DIR__ . '/../middleware.php';

// Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    apiError('Method not allowed', 405);
}

// Authenticate user
$user = authenticate();

// Get request body
$body = getJsonBody();
$refreshToken = trim($body['refresh_token'] ?? '');
$allDevices = $body['all_devices'] ?? false;

try {
    if ($allDevices) {
        // Revoke all refresh tokens for this user
        $stmt = $db->prepare("UPDATE refresh_tokens SET revoked = 1 WHERE user_id = :user_id");
        $stmt->execute([':user_id' => $user->id]);
        
        apiSuccess(null, 'Logged out from all devices');
    } else if (!empty($refreshToken)) {
        // Revoke specific refresh token
        $tokenHash = hash('sha256', $refreshToken);
        $stmt = $db->prepare("
            UPDATE refresh_tokens 
            SET revoked = 1 
            WHERE user_id = :user_id AND token = :token
        ");
        $stmt->execute([
            ':user_id' => $user->id,
            ':token' => $tokenHash
        ]);
        
        apiSuccess(null, 'Logged out successfully');
    } else {
        // No refresh token provided, just acknowledge logout
        // The access token will expire naturally
        apiSuccess(null, 'Logged out successfully');
    }
    
} catch (PDOException $e) {
    error_log("Logout error: " . $e->getMessage());
    apiError('An error occurred during logout', 500);
}
