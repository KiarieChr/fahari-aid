<?php
require_once 'config.php';
require_once 'middleware.php';

try {
    global $db;
    $data = getJsonBody();
    
    if (empty($data['first_name']) || empty($data['phone_no'])) {
        apiError("First Name and Phone are required.", 400);
    }

    $first_name = trim($data['first_name']);
    $last_name = isset($data['last_name']) ? trim($data['last_name']) : '';
    $phone_no = trim($data['phone_no']);
    $email = isset($data['email']) ? trim($data['email']) : '';
    $gender = isset($data['gender']) ? trim($data['gender']) : '';
    $marital = isset($data['marital']) ? trim($data['marital']) : '';
    $bod = !empty($data['bod']) ? trim($data['bod']) : null;
    $country_code = isset($data['country_code']) ? trim($data['country_code']) : '';
    $location = isset($data['location']) ? trim($data['location']) : ''; // Full location string (e.g. Kenya > Nairobi)
    $branch_id = isset($data['branch_id']) ? trim($data['branch_id']) : '1';
    
    $is_committed = isset($data['is_committed']) ? (bool)$data['is_committed'] : false;
    $is_visitor = isset($data['is_visitor']) ? (bool)$data['is_visitor'] : false;

    // Check if member already exists
    $stmt = $db->prepare("SELECT id FROM member WHERE phone_no = :phone OR (email = :email AND email != '') LIMIT 1");
    $stmt->execute([':phone' => $phone_no, ':email' => $email]);
    if ($stmt->fetch()) {
        apiError("A member with this phone number or email already exists.", 409);
    }

    // Build full name
    $full_name = trim($first_name . ' ' . $last_name);

    $db->beginTransaction();

    // Insert into member
    $stmt = $db->prepare("
        INSERT INTO member (first_name, last_name, phone_no, email, gender, marital, bod, country_code, location, address, branch_id, joined_on, delete_status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), 'Active')
    ");
    $stmt->execute([
        $first_name,
        $last_name,
        $phone_no,
        $email,
        $gender,
        $marital,
        $bod,
        $country_code,
        $location,
        $location, // Also save as address
        $branch_id
    ]);

    $member_id = $db->lastInsertId();

    // If committed member, insert into committed_members
    if ($is_committed) {
        $stmt_cmt = $db->prepare("INSERT INTO committed_members (member_id, full_name, phone, email, residence, committed_on) VALUES (?, ?, ?, ?, ?, NOW())");
        $stmt_cmt->execute([
            $member_id,
            $full_name,
            $phone_no,
            $email,
            $location
        ]);
    }

    // If visitor, insert into new_member_assimilation
    if ($is_visitor) {
        $stmt_vis = $db->prepare("INSERT INTO new_member_assimilation (member_id, assimilation_status, decision_type, created_at) VALUES (?, 'uncontacted', 'visitor', NOW())");
        $stmt_vis->execute([$member_id]);
    }

    $db->commit();

    echo json_encode(["success" => true, "message" => "Member created successfully.", "member_id" => $member_id]);
    
} catch(PDOException $e) {
    if (isset($db)) $db->rollBack();
    error_log("Create member API error: " . $e->getMessage());
    apiError("Database error: " . $e->getMessage(), 500);
}
?>
