<?php
/**
 * Register API Endpoint
 * POST /api/auth/register.php
 * 
 * Request body:
 * {
 *   "phone_no": "0712345678",
 *   "email": "user@example.com",
 *   "password": "password123",
 *   "dob": "1990-01-01",
 *   "location": "Nairobi",
 *   "emp_status": "Employed"
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

$phone_no = trim($body['phone_no'] ?? '');
$email = trim($body['email'] ?? '');
$password = trim($body['password'] ?? '');
$dob = trim($body['dob'] ?? '');
$location = trim($body['location'] ?? '');
$emp_status = trim($body['emp_status'] ?? '');

// Validate required fields
if (empty($phone_no)) {
    apiError('Phone number is required', 400);
}

if (empty($email)) {
    apiError('Email is required', 400);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    apiError('Invalid email format', 400);
}

if (empty($password)) {
    apiError('Password is required', 400);
}

if (strlen($password) < 6) {
    apiError('Password must be at least 6 characters', 400);
}

try {
    // Check if member exists with this phone number
    $stmt = $db->prepare("SELECT * FROM member WHERE phone_no = :phone_no");
    $stmt->execute([':phone_no' => $phone_no]);
    $member = $stmt->fetch(PDO::FETCH_OBJ);
    
    if (!$member) {
        apiError('Phone number not found. Please contact the person who referred you.', 404);
    }
    
    // Check if user already registered with this email
    $stmt = $db->prepare("SELECT id FROM users WHERE email = :email");
    $stmt->execute([':email' => $email]);
    
    if ($stmt->rowCount() > 0) {
        apiError('An account with this email already exists', 409);
    }
    
    // Check if member already has a user account
    $stmt = $db->prepare("SELECT id FROM users WHERE member_id = :member_id");
    $stmt->execute([':member_id' => $member->id]);
    
    if ($stmt->rowCount() > 0) {
        apiError('This member already has an account registered', 409);
    }
    
    // Hash password
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    
    // Create user account
    $stmt = $db->prepare("
        INSERT INTO users (member_id, email, password, status, created_at) 
        VALUES (:member_id, :email, :password, 1, NOW())
    ");
    $stmt->execute([
        ':member_id' => $member->id,
        ':email' => $email,
        ':password' => $hashedPassword
    ]);
    
    $userId = $db->lastInsertId();
    
    // Update member details if provided
    if (!empty($dob) || !empty($location) || !empty($emp_status)) {
        $updateFields = [];
        $updateParams = [':member_id' => $member->id];
        
        if (!empty($dob)) {
            $updateFields[] = "bod = :bod";
            $updateParams[':bod'] = $dob;
        }
        if (!empty($location)) {
            $updateFields[] = "location = :location";
            $updateParams[':location'] = $location;
        }
        if (!empty($emp_status)) {
            $updateFields[] = "emp_status = :emp_status";
            $updateParams[':emp_status'] = $emp_status;
        }
        
        if (!empty($updateFields)) {
            $sql = "UPDATE member SET " . implode(', ', $updateFields) . " WHERE id = :member_id";
            $db->prepare($sql)->execute($updateParams);
        }
    }
    
    // Generate tokens for auto-login
    $accessToken = JWT::generate([
        'user_id' => $userId,
        'email' => $email,
        'member_id' => $member->id,
        'role_id' => null
    ]);
    
    $refreshToken = JWT::generateRefreshToken();
    $refreshExpiry = date('Y-m-d H:i:s', strtotime('+' . REFRESH_TOKEN_EXPIRE_DAYS . ' days'));
    
    // Store refresh token
    $stmt = $db->prepare("
        INSERT INTO refresh_tokens (user_id, token, expires_at, ip_address, user_agent)
        VALUES (:user_id, :token, :expires_at, :ip_address, :user_agent)
    ");
    $stmt->execute([
        ':user_id' => $userId,
        ':token' => hash('sha256', $refreshToken),
        ':expires_at' => $refreshExpiry,
        ':ip_address' => $_SERVER['REMOTE_ADDR'],
        ':user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? ''
    ]);
    
    apiSuccess([
        'access_token' => $accessToken,
        'refresh_token' => $refreshToken,
        'token_type' => 'Bearer',
        'expires_in' => JWT_EXPIRE_HOURS * 3600,
        'user' => [
            'id' => $userId,
            'email' => $email,
            'firstname' => $member->first_name,
            'lastname' => $member->last_name,
            'phone' => $member->phone_no,
            'member_id' => $member->id
        ]
    ], 'Registration successful', 201);
    
} catch (PDOException $e) {
    error_log("Registration error: " . $e->getMessage());
    apiError('An error occurred during registration', 500);
}
