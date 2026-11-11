<?php
ob_start();
include('../includes/connection.php'); // PDO connection

// Check if token exists
if (isset($_COOKIE['auth_token'])) {
    $token = $_COOKIE['auth_tokens'];

    // Remove token from DB
    $stmt = $db->prepare("DELETE FROM user_sessions WHERE token = :token");
    $stmt->execute([':token' => $token]);

    // Expire the cookie
    setcookie('auth_token', '', [
        'expires' => time() - 3600,
        'path' => '/',
        'httponly' => true,
        'secure' => false, // Set to true if your site uses HTTPS
        ]);
}

// Redirect to login
header("Location: ../login.php");
exit();
?>
