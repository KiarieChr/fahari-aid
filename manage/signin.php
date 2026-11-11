<?php
// Ensure no output before headers
if (ob_get_level()) ob_end_clean();

// Set JSON header
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-cache, must-revalidate');

// Enable error reporting (disable in production)
error_reporting(E_ALL);
ini_set('display_errors', 0);

try {
    session_start();
    require_once('../includes/connection.php');
    
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Invalid request method', 405);
    }

    $username = trim($_POST['email-username'] ?? '');
    $password = trim($_POST['password'] ?? '');

    if (empty($username) || empty($password)) {
        throw new Exception('Username and password are required', 400);
    }

    // Query user
    $stmt = $db->prepare("SELECT * FROM users WHERE email = :username LIMIT 1");
    $stmt->bindParam(':username', $username, PDO::PARAM_STR);
    $stmt->execute();
    
    $user = $stmt->fetch(PDO::FETCH_OBJ);
    
    if (!$user) {
        throw new Exception('Invalid credentials', 401);
    }
    
    if (!password_verify($password, $user->password)) {
        throw new Exception('Invalid credentials', 401);
    }
    
    if ($user->status != 1) {
        throw new Exception('Account inactive', 403);
    }

    // Update last login
    $update = $db->prepare("UPDATE users SET last_login = NOW() WHERE id = :id");
    $update->execute([':id' => $user->id]);

    // Generate token
    $token = bin2hex(random_bytes(32));
    $session = $db->prepare("
        INSERT INTO user_sessions 
        (user_id, token, ip_address, user_agent, expires_at) 
        VALUES (:user_id, :token, :ip, :ua, DATE_ADD(NOW(), INTERVAL 1 DAY))
    ");
    $session->execute([
        ':user_id' => $user->id,
        ':token' => $token,
        ':ip' => $_SERVER['REMOTE_ADDR'],
        ':ua' => $_SERVER['HTTP_USER_AGENT']
    ]);

    // Set cookie
    setcookie('auth_token', $token, [
        'expires' => time() + 86400,
        'path' => '/',
        'httponly' => true,
        'secure' => isset($_SERVER['HTTPS']),
        'samesite' => 'Strict'
    ]);

    // Successful response - ensure no extra whitespace
    die(json_encode([
        'success' => true,
        'message' => 'Login successful',
        'redirect' => 'dashboard.php'
    ]));

} catch (Exception $e) {
    // Error response
    http_response_code($e->getCode() ?: 500);
    die(json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]));
}
?>