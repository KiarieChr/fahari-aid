<?php
// commitment-handler.php
// Turn off error display, log them instead
ini_set('display_errors', 0);
ini_set('log_errors', 1);
error_reporting(E_ALL);

// Start output buffering to catch any stray output
ob_start();

include('../includes/connection.php');

// Set JSON header
header('Content-Type: application/json');

// Function to send consistent JSON response
function sendJsonResponse($success, $message, $data = []) {
    $response = [
        'success' => $success,
        'message' => $message
    ];
    
    if (!empty($data)) {
        $response = array_merge($response, $data);
    }
    
    // Clear any output buffers
    while (ob_get_level()) {
        ob_end_clean();
    }
    
    echo json_encode($response);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';
    
    if ($action === 'verify_member') {
        verifyMember();
    } elseif ($action === 'save_commitment') {
        saveCommitment();
    } else {
        sendJsonResponse(false, 'Invalid action');
    }
} else {
    sendJsonResponse(false, 'Invalid request method. Use POST.');
}

function verifyMember() {
    global $db;
    
    $phone = $_POST['phone'] ?? '';
    $email = $_POST['email'] ?? '';
    
    // At least one should be provided
    if (empty($phone) && empty($email)) {
        sendJsonResponse(false, 'Please provide either phone number or email');
    }
    
    try {
        // Query to find member by phone OR email
        $sql = "SELECT id, CONCAT(first_name, ' ', last_name) as full_name, phone_no, email, location FROM member 
                WHERE (phone_no = :phone OR email = :email) 
                LIMIT 1";
        
        $stmt = $db->prepare($sql);
        $stmt->execute([
            ':phone' => $phone,
            ':email' => $email
        ]);
        
        $member = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($member) {
            sendJsonResponse(true, 'Member found in database', ['member' => $member]);
        } else {
            sendJsonResponse(false, 'No existing member found with provided phone or email');
        }
    } catch (PDOException $e) {
        error_log("Database error in verifyMember: " . $e->getMessage());
        sendJsonResponse(false, 'Database error occurred');
    }
}

function saveCommitment() {
    global $db;
    
    $memberId = $_POST['member_id'] ?? null;
    $fullName = $_POST['full_name'] ?? '';
    $phone = $_POST['phone'] ?? '';
    $email = $_POST['email'] ?? '';
    $residence = $_POST['residence'] ?? '';
    $committedOn = $_POST['committed_on'] ?? null;
    
    // Validate required fields
    if (empty($fullName)) {
        sendJsonResponse(false, 'Full name is required');
    }
    
    if (empty($phone) || strlen($phone) < 10) {
        sendJsonResponse(false, 'Valid phone number is required (at least 10 digits)');
    }
    
    // If member_id is empty string, set to null for database
    if ($memberId === '') {
        $memberId = null;
    }
    
    // Validate email if provided
    if (!empty($email) && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        sendJsonResponse(false, 'Invalid email format');
    }
    
    try {
        // Check if phone already exists in committed_members
        $checkSql = "SELECT id FROM committed_members WHERE phone = :phone LIMIT 1";
        $checkStmt = $db->prepare($checkSql);
        $checkStmt->execute([':phone' => $phone]);
        
        if ($checkStmt->rowCount() > 0) {
            sendJsonResponse(false, 'A commitment with this phone number already exists');
        }
        
        // Insert into committed_members table
        $sql = "INSERT INTO committed_members 
                (member_id, full_name, phone, email, residence, committed_on, created_at) 
                VALUES (:member_id, :full_name, :phone, :email, :residence, :committed_on, NOW())";
        
        $stmt = $db->prepare($sql);
        $result = $stmt->execute([
            ':member_id' => $memberId,
            ':full_name' => $fullName,
            ':phone' => $phone,
            ':email' => $email,
            ':residence' => $residence,
            ':committed_on' => $committedOn ?: null
        ]);
        
        if ($result) {
            $lastInsertId = $db->lastInsertId();
            
            sendJsonResponse(true, 'Commitment saved successfully', [
                'commitment_id' => $lastInsertId,
                'member_id' => $memberId ?: 'Not assigned'
            ]);
        } else {
            sendJsonResponse(false, 'Failed to save commitment');
        }
    } catch (PDOException $e) {
        error_log("Database error in saveCommitment: " . $e->getMessage());
        
        // Check for duplicate entry error
        if (strpos($e->getMessage(), 'Duplicate entry') !== false) {
            sendJsonResponse(false, 'This phone number or email already exists in our records');
        } else {
            sendJsonResponse(false, 'Database error: ' . $e->getMessage());
        }
    }
}

// If there's any output before this point, capture and log it
$output = ob_get_clean();
if (!empty($output) && !headers_sent()) {
    error_log("Stray output in commitment-handler.php: " . $output);
    sendJsonResponse(false, 'Server error occurred');
}

// If accessed directly without proper request
sendJsonResponse(false, 'Invalid request');
?>