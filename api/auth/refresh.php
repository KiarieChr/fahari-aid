<?php
/**
 * Refresh Token API Endpoint
 * POST /api/auth/refresh.php
 * 
 * Request body:
 * {
 *   "refresh_token": "..."
 * }
 */

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../jwt.php';

// Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    apiError('Method not allowed', 405);
}

// Get request body
$body = getJsonBody();
$refreshToken = trim($body['refresh_token'] ?? '');

if (empty($refreshToken)) {
    apiError('Refresh token is required', 400);
}

try {
    // Hash the token to match stored version
    $tokenHash = hash('sha256', $refreshToken);
    
    // Find valid refresh token
    $stmt = $db->prepare("
        SELECT rt.*, u.email, u.member_id, u.status
        FROM refresh_tokens rt
        JOIN users u ON rt.user_id = u.id
        WHERE rt.token = :token 
        AND rt.expires_at > NOW()
        AND rt.revoked = 0
    ");
    $stmt->execute([':token' => $tokenHash]);
    $tokenRecord = $stmt->fetch(PDO::FETCH_OBJ);
    
    if (!$tokenRecord) {
        apiError('Invalid or expired refresh token', 401);
    }
    
    if ($tokenRecord->status != 1) {
        apiError('User account is inactive', 403);
    }
    
    // Revoke old refresh token (rotation)
    $db->prepare("UPDATE refresh_tokens SET revoked = 1 WHERE id = :id")
       ->execute([':id' => $tokenRecord->id]);
    
    // Generate new tokens
    $newAccessToken = JWT::generate([
        'user_id' => $tokenRecord->user_id,
        'email' => $tokenRecord->email,
        'member_id' => $tokenRecord->member_id,
        'role_id' => $tokenRecord->role_id
    ]);
    
    $newRefreshToken = JWT::generateRefreshToken();
    $refreshExpiry = date('Y-m-d H:i:s', strtotime('+' . REFRESH_TOKEN_EXPIRE_DAYS . ' days'));
    
    // Store new refresh token
    $stmt = $db->prepare("
        INSERT INTO refresh_tokens (user_id, token, expires_at, ip_address, user_agent)
        VALUES (:user_id, :token, :expires_at, :ip_address, :user_agent)
    ");
    $stmt->execute([
        ':user_id' => $tokenRecord->user_id,
        ':token' => hash('sha256', $newRefreshToken),
        ':expires_at' => $refreshExpiry,
        ':ip_address' => $_SERVER['REMOTE_ADDR'],
        ':user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? ''
    ]);
    
    apiSuccess([
        'access_token' => $newAccessToken,
        'refresh_token' => $newRefreshToken,
        'token_type' => 'Bearer',
        'expires_in' => JWT_EXPIRE_HOURS * 3600
    ], 'Token refreshed successfully');
    
} catch (PDOException $e) {
    error_log("Refresh token error: " . $e->getMessage());
    apiError('An error occurred', 500);
}
