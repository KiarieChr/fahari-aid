<?php

ob_start();
// Set a test cookie that expires in 5 minutes
  setcookie('auth_tokens', 565, [
                            'expires' => time() + 86400,
                            'path' => '/',
                            'httponly' => true,
                            'secure' => isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on',
                            'samesite' => 'Lax'
                        ]);
header("location: test.php");
?>