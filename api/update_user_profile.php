<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json; charset=UTF-8");

require_once 'middleware.php';

try {
    $authUser = authenticate();

    $raw_id = $_POST['user_id'] ?? '';
    
    if (empty($raw_id) || $raw_id === 'me' || $raw_id === 'u-1') {
        $user_id = $authUser->id;
    } else {
        $user_id = intval(preg_replace('/[^0-9]/', '', $raw_id));
    }
    
    if (!$user_id) {
        echo json_encode(["success" => false, "message" => "Valid User ID is required"]);
        exit;
    }

    // Permission Check (Super Admin, Administrator, or explicit edit_user permission)
    if ($user_id != $authUser->id) {
        $hasRole = in_array(1, $authUser->roles ?? []) || in_array(3, $authUser->roles ?? []);
        $hasPermission = false;
        if (!$hasRole) {
            require_once __DIR__ . '/../manage/functions.php';
            if (function_exists('userHasPermission')) {
                $hasPermission = userHasPermission($db, $authUser->id, 'edit_user');
            }
        }
        if (!$hasRole && !$hasPermission) {
            echo json_encode(["success" => false, "message" => "Insufficient permissions to edit this user"]);
            exit;
        }
    }

    // Get the member_id for this user
    $m_stmt = $db->prepare("SELECT member_id FROM users WHERE id = :uid");
    $m_stmt->execute([':uid' => $user_id]);
    $member_id = $m_stmt->fetchColumn();

    if (!$member_id) {
        echo json_encode(["success" => false, "message" => "Member record not found for user"]);
        exit;
    }

    // 1. Update Member Details
    $first_name = $_POST['first_name'] ?? null;
    $last_name = $_POST['last_name'] ?? null;
    $phone_no = $_POST['phone_no'] ?? null;
    $location = $_POST['location'] ?? null;
    $bod = $_POST['bod'] ?? null;
    $country_code = $_POST['country_code'] ?? null;
    $branch_id = $_POST['branch_id'] !== '' ? $_POST['branch_id'] : null;

    $member_updates = [];
    $member_params = [':mid' => $member_id];

    if ($first_name !== null) { $member_updates[] = "first_name = :fn"; $member_params[':fn'] = $first_name; }
    if ($last_name !== null) { $member_updates[] = "last_name = :ln"; $member_params[':ln'] = $last_name; }
    if ($phone_no !== null) { $member_updates[] = "phone_no = :phone"; $member_params[':phone'] = $phone_no; }
    if ($location !== null) { $member_updates[] = "location = :loc"; $member_params[':loc'] = $location; }
    if ($bod !== null) { $member_updates[] = "bod = :bod"; $member_params[':bod'] = $bod ?: null; }
    if ($country_code !== null) { $member_updates[] = "country_code = :cc"; $member_params[':cc'] = $country_code; }
    if (isset($_POST['branch_id'])) { $member_updates[] = "branch_id = :branch_id"; $member_params[':branch_id'] = $branch_id; }

    // 2. Handle File Uploads for Member
    $upload_dir = '../assets/user_img/';
    if (!file_exists($upload_dir)) {
        mkdir($upload_dir, 0777, true);
    }

    if (isset($_FILES['profile_image']) && $_FILES['profile_image']['error'] === UPLOAD_ERR_OK) {
        $ext = pathinfo($_FILES['profile_image']['name'], PATHINFO_EXTENSION);
        $filename = 'profile_' . $user_id . '_' . time() . '.' . $ext;
        if (move_uploaded_file($_FILES['profile_image']['tmp_name'], $upload_dir . $filename)) {
            $member_updates[] = "photo = :photo";
            $member_params[':photo'] = $filename;
        }
    }

    if (isset($_FILES['banner_image']) && $_FILES['banner_image']['error'] === UPLOAD_ERR_OK) {
        $ext = pathinfo($_FILES['banner_image']['name'], PATHINFO_EXTENSION);
        $filename = 'banner_' . $user_id . '_' . time() . '.' . $ext;
        if (move_uploaded_file($_FILES['banner_image']['tmp_name'], $upload_dir . $filename)) {
            $member_updates[] = "photo1 = :photo1";
            $member_params[':photo1'] = $filename;
        }
    }

    if (count($member_updates) > 0) {
        $update_member = "UPDATE member SET " . implode(", ", $member_updates) . " WHERE id = :mid";
        $stmt = $db->prepare($update_member);
        $stmt->execute($member_params);
    }

    // 3. Update User Details (Bio)
    $user_updates = [];
    $user_params = [':uid' => $user_id];
    
    if (isset($_POST['bio'])) {
        $user_updates[] = "bio = :bio";
        $user_params[':bio'] = $_POST['bio'];
    }
    
    // Password Update Logic
    if (!empty($_POST['password'])) {
        $user_updates[] = "password = :password";
        $user_params[':password'] = password_hash($_POST['password'], PASSWORD_DEFAULT);
    }

    if (count($user_updates) > 0) {
        $update_users = "UPDATE users SET " . implode(", ", $user_updates) . " WHERE id = :uid";
        $u_stmt = $db->prepare($update_users);
        $u_stmt->execute($user_params);
    }
    
    // 4. Log the update
    if ($user_id == $authUser->id) {
        $detail = "You updated your profile information.";
        $log_stmt = $db->prepare("INSERT INTO user_timeline (user_id, title, detail) VALUES (:uid, 'Profile Updated', :detail)");
        $log_stmt->execute([':uid' => $user_id, ':detail' => $detail]);
    } else {
        $detail = "Your profile information was updated by an administrator.";
        $log_stmt = $db->prepare("INSERT INTO user_timeline (user_id, title, detail) VALUES (:uid, 'Profile Updated', :detail)");
        $log_stmt->execute([':uid' => $user_id, ':detail' => $detail]);
        
        // Log in audit_log for the admin
        $audit_stmt = $db->prepare("INSERT INTO audit_log (user_id, action, table_name, record_id) VALUES (:admin_id, 'UPDATE', 'users_profile', :uid)");
        $audit_stmt->execute([':admin_id' => $authUser->id, ':uid' => $user_id]);
    }

    echo json_encode(["success" => true, "message" => "Profile updated successfully"]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error updating profile: " . $e->getMessage()]);
}
?>
