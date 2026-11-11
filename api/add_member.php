<?php
/**
 * Add Member API
 * POST /api/add_member.php
 * 
 * Public endpoint for adding a new member (e.g. from meeting attendance page)
 * Optionally marks attendance for a meeting_id
 * 
 * Request body:
 * {
 *   "first_name": "John",
 *   "last_name": "Doe",
 *   "email": "john@example.com",
 *   "phone_no": "0712345678",
 *   "residence": "Nairobi",
 *   "invited_by": "Pastor James",
 *   "marital_status": "Single",
 *   "emp_status": "Employed",
 *   "dob": "1990-01-15",
 *   "meeting_id": 1  (optional)
 * }
 */

require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    apiError('Method not allowed', 405);
}

$body = getJsonBody();

// Validate required fields
$required = ['first_name', 'last_name', 'email', 'phone_no', 'residence', 'invited_by', 'marital_status', 'emp_status', 'dob'];
foreach ($required as $field) {
    if (empty($body[$field])) {
        apiError("Field '$field' is required", 400);
    }
}

$fname = trim($body['first_name']);
$lname = trim($body['last_name']);
$email = trim($body['email']);
$phoneNo = trim($body['phone_no']);
$residence = trim($body['residence']);
$invitedBy = trim($body['invited_by']);
$maritalStatus = trim($body['marital_status']);
$empStatus = trim($body['emp_status']);
$dob = trim($body['dob']);
$meetingId = isset($body['meeting_id']) ? (int)$body['meeting_id'] : null;

// Validate email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    apiError('Invalid email format', 400);
}

// Format DOB if needed (accept YYYY-MM-DD or MM/DD/YYYY)
if (preg_match('/^\d{2}\/\d{2}\/\d{4}$/', $dob)) {
    $date = DateTime::createFromFormat('m/d/Y', $dob);
    if ($date) {
        $dob = $date->format('Y-m-d');
    } else {
        apiError('Invalid date format', 400);
    }
} elseif (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $dob)) {
    apiError('Invalid date format. Use YYYY-MM-DD', 400);
}

try {
    // Check if member already exists
    $stmt = $db->prepare("SELECT id FROM member WHERE phone_no = :phone OR email = :email LIMIT 1");
    $stmt->execute([':phone' => $phoneNo, ':email' => $email]);
    $existing = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($existing) {
        $memberId = $existing['id'];

        // If meeting_id provided, mark attendance
        if ($meetingId) {
            $meetStmt = $db->prepare("SELECT id, name FROM meeting WHERE id = :id");
            $meetStmt->execute([':id' => $meetingId]);
            $meeting = $meetStmt->fetch(PDO::FETCH_ASSOC);

            if ($meeting) {
                // Check not already marked
                $chk = $db->prepare("SELECT id FROM attendance WHERE member_id = :mid AND meeting_id = :mtid LIMIT 1");
                $chk->execute([':mid' => $memberId, ':mtid' => $meetingId]);
                if (!$chk->fetch()) {
                    $att = $db->prepare("INSERT INTO attendance (member_id, meeting_id, login_time) VALUES (:mid, :mtid, NOW())");
                    $att->execute([':mid' => $memberId, ':mtid' => $meetingId]);
                }
            }

            echo json_encode([
                'success' => true,
                'message' => 'Welcome back! Your attendance has been marked.',
                'type' => 'success',
                'title' => 'Welcome Back!',
                'redirect' => $meeting['meeting_link'] ?? null
            ]);
            exit;
        }

        echo json_encode([
            'success' => true,
            'message' => 'Member already exists in the system.',
            'type' => 'info',
            'title' => 'Member Exists'
        ]);
        exit;
    }

    // Insert new member
    $stmt = $db->prepare("
        INSERT INTO member (first_name, last_name, email, phone_no, location, department, marital, emp_status, bod, joined_on, delete_status)
        VALUES (:fname, :lname, :email, :phone, :location, :invited_by, :marital, :emp_status, :dob, NOW(), 'Active')
    ");
    $stmt->execute([
        ':fname' => $fname,
        ':lname' => $lname,
        ':email' => $email,
        ':phone' => $phoneNo,
        ':location' => $residence,
        ':invited_by' => $invitedBy,
        ':marital' => $maritalStatus,
        ':emp_status' => $empStatus,
        ':dob' => $dob
    ]);

    $memberId = $db->lastInsertId();

    // If meeting_id provided, mark attendance
    $redirect = null;
    if ($meetingId) {
        $meetStmt = $db->prepare("SELECT id, name FROM meeting WHERE id = :id");
        $meetStmt->execute([':id' => $meetingId]);
        $meeting = $meetStmt->fetch(PDO::FETCH_ASSOC);

        if ($meeting) {
            $att = $db->prepare("INSERT INTO attendance (member_id, meeting_id, login_time) VALUES (:mid, :mtid, NOW())");
            $att->execute([':mid' => $memberId, ':mtid' => $meetingId]);
        }
    }

    // Auto-create assimilation record for the new member
    try {
        $assimStmt = $db->prepare("
            INSERT IGNORE INTO new_member_assimilation (member_id, decision_type, assimilation_status, created_at)
            VALUES (:member_id, :decision_type, 'uncontacted', NOW())
        ");
        $decisionType = in_array($body['decision_type'] ?? '', ['raised_hand','connection_card','personal_invite','online_form','salvation_decision','other'])
            ? $body['decision_type']
            : 'connection_card';
        $assimStmt->execute([':member_id' => $memberId, ':decision_type' => $decisionType]);
    } catch (PDOException $assimEx) {
        // Non-fatal: log but don't block member creation
        error_log("Assimilation record creation warning: " . $assimEx->getMessage());
    }

    echo json_encode([
        'success' => true,
        'message' => $meetingId ? 'Member registered and attendance marked!' : 'Member added successfully!',
        'type' => 'success',
        'title' => 'Success!',
        'member_id' => $memberId,
        'redirect' => $redirect
    ]);

} catch (PDOException $e) {
    if ($e->getCode() == 23000) {
        http_response_code(409);
        echo json_encode([
            'success' => false,
            'message' => 'This email or phone number already exists.',
            'type' => 'error',
            'title' => 'Duplicate Entry'
        ]);
    } else {
        error_log("Add member API error: " . $e->getMessage());
        apiError('Failed to add member', 500);
    }
}
