<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Content-Type: application/json; charset=UTF-8");

require_once 'middleware.php';

try {
    $authUser = authenticate();

    $raw_id = $_GET['user_id'] ?? '';
    
    if (empty($raw_id) || $raw_id === 'me' || $raw_id === 'u-1') {
        $user_id = $authUser->id;
    } else {
        $user_id = intval(preg_replace('/[^0-9]/', '', $raw_id));
    }
    
    if (!$user_id) {
        echo json_encode(["success" => false, "message" => "Valid User ID is required"]);
        exit;
    }

    // Permission Check
    if ($user_id != $authUser->id) {
        requirePermission($db, $authUser, 'view_users');
    }

    // 1. Fetch User and Member Details
    $user_query = "SELECT u.id as user_id, u.email, u.member_id, u.bio,
                          m.first_name, m.last_name, m.phone_no, m.bod, m.location, m.joined_on as join_date,
                          m.photo as profile_image, m.photo1 as banner_image, m.branch_id, m.country_code
                   FROM users u 
                   LEFT JOIN member m ON u.member_id = m.id 
                   WHERE u.id = :user_id";
    $stmt = $db->prepare($user_query);
    $stmt->execute([':user_id' => $user_id]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        echo json_encode(["success" => false, "message" => "User not found"]);
        exit;
    }

    // Calculate Demographic
    $ageCatsStmt = $db->query("SELECT * FROM age_categories ORDER BY min_age ASC");
    $ageCategories = $ageCatsStmt->fetchAll(PDO::FETCH_ASSOC);
    $user['demographic'] = 'Unknown';
    if (!empty($user['bod'])) {
        try {
            $dob = new DateTime($user['bod']);
            $now = new DateTime();
            $age = $now->diff($dob)->y;
            foreach ($ageCategories as $cat) {
                $min = (int)$cat['min_age'];
                $max = $cat['max_age'] !== null ? (int)$cat['max_age'] : 999;
                if ($age >= $min && $age <= $max) {
                    $user['demographic'] = $cat['name'];
                    break;
                }
            }
        } catch (Exception $e) {}
    }

    // Fetch Hierarchy Path
    $user['hierarchy_path'] = [];
    if (!empty($user['branch_id'])) {
        $currentNodeId = (int)$user['branch_id'];
        $path = [];
        while ($currentNodeId) {
            $nodeStmt = $db->prepare("SELECT id, name, parent_id FROM hierarchy_nodes WHERE id = ?");
            $nodeStmt->execute([$currentNodeId]);
            $node = $nodeStmt->fetch(PDO::FETCH_ASSOC);
            if ($node) {
                array_unshift($path, $node['name']);
                $currentNodeId = $node['parent_id'] ? (int)$node['parent_id'] : null;
            } else {
                break;
            }
        }
        $user['hierarchy_path'] = $path;
    }

    // Fetch Roles for the user
    $roles_query = "SELECT r.name FROM roles r 
                    JOIN user_roles ur ON ur.role_id = r.id 
                    WHERE ur.user_id = :user_id";
    $role_stmt = $db->prepare($roles_query);
    $role_stmt->execute([':user_id' => $user_id]);
    $roles = $role_stmt->fetchAll(PDO::FETCH_COLUMN);

    $user['roles'] = $roles;

    // 2. Fetch User Timeline Logs
    $timeline_query = "SELECT id, title, detail, created_at, 'timeline' as log_type 
                       FROM user_timeline 
                       WHERE user_id = :user_id 
                       ORDER BY created_at DESC LIMIT 20";
    $timeline_stmt = $db->prepare($timeline_query);
    $timeline_stmt->execute([':user_id' => $user_id]);
    $timeline_logs = $timeline_stmt->fetchAll(PDO::FETCH_ASSOC);

    // 3. Fetch Audit Logs for this user
    $audit_query = "SELECT id, CONCAT('Performed ', action, ' on ', table_name) as title, 
                           CONCAT('Record ID: ', record_id) as detail, created_at, 'audit' as log_type 
                    FROM audit_log 
                    WHERE user_id = :user_id 
                    ORDER BY created_at DESC LIMIT 20";
    $audit_stmt = $db->prepare($audit_query);
    $audit_stmt->execute([':user_id' => $user_id]);
    $audit_logs = $audit_stmt->fetchAll(PDO::FETCH_ASSOC);

    // Combine and sort logs
    $all_logs = array_merge($timeline_logs, $audit_logs);
    usort($all_logs, function($a, $b) {
        return strtotime($b['created_at']) - strtotime($a['created_at']);
    });
    
    // Take top 30
    $all_logs = array_slice($all_logs, 0, 30);

    echo json_encode([
        "success" => true,
        "user" => $user,
        "logs" => $all_logs
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
}
?>
