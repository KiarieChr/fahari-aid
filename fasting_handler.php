<?php
// fasting_handler.php

// Start session if needed (for admin auth)
session_start();

// Database configuration
$host = 'localhost';
$dbname = 'nprfojqc_jenc';
$username = 'nprfojqc_mkdev';
$password = 'admin@2025';

// Set content type to JSON
header('Content-Type: application/json');

// Enable error reporting for development
error_reporting(E_ALL);
ini_set('display_errors', 1);

try {
    // Create PDO connection
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false
    ]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed: ' . $e->getMessage()]);
    exit;
}

// Get action from request
$action = $_POST['action'] ?? '';

switch ($action) {
    case 'lookup_member':
        lookupMember($pdo);
        break;
    case 'submit_commitment':
        submitCommitment($pdo);
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
        break;
}

function lookupMember($pdo)
{
    $email = trim($_POST['email'] ?? '');
    $phone = trim($_POST['phone'] ?? '');

    if (!$email && !$phone) {
        echo json_encode(['success' => false, 'message' => 'Please provide email or phone']);
        return;
    }

    try {
        // Prepare query
        $sql = "SELECT id, first_name, last_name, email, phone_no FROM member WHERE ";
        $params = [];

        if ($email && $phone) {
            $sql .= "(email = :email OR phone_no = :phone)";
            $params[':email'] = $email;
            $params[':phone'] = $phone;
        } elseif ($email) {
            $sql .= "email = :email";
            $params[':email'] = $email;
        } else {
            $sql .= "phone = :phone";
            $params[':phone'] = $phone;
        }

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $member = $stmt->fetch();

        if ($member) {
            echo json_encode([
                'success' => true,
                'member' => $member,
                'message' => 'Member found'
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'No member found with these details'
            ]);
        }
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    }
}

function submitCommitment($pdo)
{
    // Validate required fields
    $name = trim($_POST['name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $phone = trim($_POST['phone'] ?? '');
    $member_id = !empty($_POST['member_id']) ? intval($_POST['member_id']) : null;

    // Validate at least one day is selected
    $days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    $selectedDays = false;
    foreach ($days as $day) {
        if (isset($_POST[$day]) && $_POST[$day] == '1') {
            $selectedDays = true;
            break;
        }
    }

    if (!$name || !$email || !$phone || !$selectedDays) {
        echo json_encode(['success' => false, 'message' => 'Please fill all required fields and select at least one day']);
        return;
    }

    // Validate email format
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(['success' => false, 'message' => 'Please enter a valid email address']);
        return;
    }

    // Validate phone (basic validation)
    if (strlen($phone) < 10) {
        echo json_encode(['success' => false, 'message' => 'Please enter a valid phone number']);
        return;
    }

    try {
        // Check for duplicate commitment (same email)
        $checkStmt = $pdo->prepare("SELECT id FROM fasting_commitments WHERE email = :email");
        $checkStmt->execute([':email' => $email]);
        if ($checkStmt->fetch()) {
            echo json_encode(['success' => false, 'message' => 'A commitment with this email already exists']);
            return;
        }

        // If member_id is provided, verify it exists and fetch details
        if ($member_id) {
            $memberStmt = $pdo->prepare("SELECT first_name,last_name, email, phone_no FROM member WHERE id = :id");
            $memberStmt->execute([':id' => $member_id]);
            $member = $memberStmt->fetch();

            if (!$member) {
                $member_id = null; // Reset if invalid member_id
            } else {
                // Use member details instead of form values for consistency
                $name = $member['first_name'] . ' ' . $member['last_name'];
                $email = $member['email'];
                $phone = $member['phone_no'];
            }
        }

        // Prepare insert statement
        $sql = "INSERT INTO fasting_commitments (
                    member_id, name, email, phone,
                    monday, tuesday, wednesday, thursday, friday, saturday, sunday,
                    created_at
                ) VALUES (
                    :member_id, :name, :email, :phone,
                    :monday, :tuesday, :wednesday, :thursday, :friday, :saturday, :sunday,
                    NOW()
                )";

        $stmt = $pdo->prepare($sql);

        // Bind parameters
        $params = [
            ':member_id' => $member_id,
            ':name' => $name,
            ':email' => $email,
            ':phone' => $phone,
            ':monday' => isset($_POST['monday']) && $_POST['monday'] == '1' ? 1 : 0,
            ':tuesday' => isset($_POST['tuesday']) && $_POST['tuesday'] == '1' ? 1 : 0,
            ':wednesday' => isset($_POST['wednesday']) && $_POST['wednesday'] == '1' ? 1 : 0,
            ':thursday' => isset($_POST['thursday']) && $_POST['thursday'] == '1' ? 1 : 0,
            ':friday' => isset($_POST['friday']) && $_POST['friday'] == '1' ? 1 : 0,
            ':saturday' => isset($_POST['saturday']) && $_POST['saturday'] == '1' ? 1 : 0,
            ':sunday' => isset($_POST['sunday']) && $_POST['sunday'] == '1' ? 1 : 0
        ];

        $stmt->execute($params);

        echo json_encode([
            'success' => true,
            'message' => 'Thank you for your commitment! Your prayer and fasting schedule has been recorded.',
            'commitment_id' => $pdo->lastInsertId()
        ]);

    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    }
}
?>