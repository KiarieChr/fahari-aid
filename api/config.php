<?php
/**
 * API Configuration
 * Central configuration for API settings, CORS, and JWT
 */

// Prevent direct access
if (!defined('API_ACCESS')) {
    define('API_ACCESS', true);
}

// Enable error logging to a local file
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/error_log');
error_reporting(E_ALL);

// CORS Configuration
$allowed_origins = [
    'http://localhost:5173',      // Vite dev server
    'http://localhost:3000',  
    'http://localhost:8081',     // Alternative dev port
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000',
    'http://localhost:8080/jen/api',
    'https://jen.royalsoftwares.co.ke/api',  // Production frontend
    'https://jesusenthroned.net',         // Main domain
    'https://www.jesusenthroned.net',     // WWW subdomain
    'https://jesusenthroned.royalsoftwares.co.ke',
    'https://www.jesusenthroned.royalsoftwares.co.ke',
    'https://www.jen.royalsoftwares.co.ke',
    
];

// Include database connection (This sets $is_valid_tenant dynamically)
require_once __DIR__ . '/../includes/connection.php';

// Get request origin
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';

// Set CORS headers dynamically for localhost development and configured production domains
$is_localhost = preg_match('/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/', $origin);
if ($is_localhost || in_array($origin, $allowed_origins) || (isset($is_valid_tenant) && $is_valid_tenant)) {
    header("Access-Control-Allow-Origin: $origin");
}
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Max-Age: 86400");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// JWT Configuration
define('JWT_SECRET', 'your-super-secret-key-change-in-production-' . md5(__DIR__));
define('JWT_ISSUER', 'jesusenthroned.net');
define('JWT_AUDIENCE', 'jesusenthroned.net');
define('JWT_EXPIRE_HOURS', 24);
define('REFRESH_TOKEN_EXPIRE_DAYS', 30);

// Paystack Configuration
define('PAYSTACK_SECRET_KEY', 'sk_test_replace_with_your_actual_secret_key');

// M-Pesa Daraja API Configuration
// Sign up at https://developer.safaricom.co.ke/ to get sandbox credentials
define('MPESA_ENV',             'sandbox');  // 'sandbox' | 'production'
define('MPESA_CONSUMER_KEY',    'replace_with_your_consumer_key');
define('MPESA_CONSUMER_SECRET', 'replace_with_your_consumer_secret');
define('MPESA_SHORTCODE',       '174379');   // sandbox default; your paybill in production
define('MPESA_PASSKEY',         'replace_with_your_lipa_na_mpesa_passkey');
// Must be a publicly reachable HTTPS URL (use ngrok in local dev):
define('MPESA_CALLBACK_URL',    'https://yourdomain.com/jen/api/mpesa_stk_callback.php');

// Error handling for API
function apiError($message, $code = 400) {
    http_response_code($code);
    echo json_encode([
        'success' => false,
        'error' => $message
    ]);
    exit();
}

// Success response helper
function apiSuccess($data, $message = 'Success', $code = 200) {
    http_response_code($code);
    echo json_encode([
        'success' => true,
        'message' => $message,
        'data' => $data
    ]);
    exit();
}

// Get JSON body
function getJsonBody() {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        return [];
    }
    return $data;
}
