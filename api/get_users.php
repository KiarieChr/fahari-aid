<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Content-Type: application/json; charset=UTF-8");

require_once 'middleware.php';

try {
    $authUser = authenticate();
    
    // Permission Check
    requirePermission($db, $authUser, 'view_users');

    $page = max(1, (int)($_GET['page'] ?? 1));
    $limit = max(1, min(500, (int)($_GET['limit'] ?? 100))); // higher default limit for grid
    $offset = ($page - 1) * $limit;
    
    $search = trim($_GET['search'] ?? '');
    $department_id = $_GET['department_id'] ?? '';
    $branch_id = $_GET['branch_id'] ?? '';
    $min_age = $_GET['min_age'] ?? '';
    $max_age = $_GET['max_age'] ?? '';
    $role_id = $_GET['role_id'] ?? '';

    $where = "WHERE 1=1";
    $params = [];

    // Search filter
    if (!empty($search)) {
        $where .= " AND (m.first_name LIKE :search OR m.last_name LIKE :search OR m.phone_no LIKE :search OR u.email LIKE :search)";
        $params[':search'] = "%$search%";
    }
    
    // Department filter
    if (!empty($department_id) && $department_id !== 'all') {
        $where .= " AND m.department_id = :department_id";
        $params[':department_id'] = $department_id;
    }
    
    // Branch filter
    if (!empty($branch_id) && $branch_id !== 'all') {
        $where .= " AND m.branch_id = :branch_id";
        $params[':branch_id'] = $branch_id;
    }
    
    // Age filters
    if ($min_age !== '') {
        $where .= " AND TIMESTAMPDIFF(YEAR, m.bod, CURDATE()) >= :min_age";
        $params[':min_age'] = (int)$min_age;
    }
    if ($max_age !== '') {
        $where .= " AND TIMESTAMPDIFF(YEAR, m.bod, CURDATE()) <= :max_age";
        $params[':max_age'] = (int)$max_age;
    }

    // Role filter
    if (!empty($role_id) && $role_id !== 'all') {
        $where .= " AND u.id IN (SELECT user_id FROM user_roles WHERE role_id = :role_id)";
        $params[':role_id'] = $role_id;
    }

    // Count total
    $countSql = "
        SELECT COUNT(*) as total 
        FROM users u 
        LEFT JOIN member m ON u.member_id = m.id
        $where
    ";
    $countStmt = $db->prepare($countSql);
    $countStmt->execute($params);
    $total = (int)$countStmt->fetch()['total'];

    // Fetch users
    $users_query = "
        SELECT 
            u.id as user_id, 
            u.email, 
            u.status,
            m.first_name, 
            m.last_name, 
            m.phone_no, 
            m.location,
            m.photo as profile_image
        FROM users u 
        LEFT JOIN member m ON u.member_id = m.id
        $where
        ORDER BY m.first_name ASC, u.email ASC
        LIMIT :limit OFFSET :offset
    ";
    
    $stmt = $db->prepare($users_query);
    foreach ($params as $key => $val) {
        $stmt->bindValue($key, $val);
    }
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Fetch roles for these users
    if (count($users) > 0) {
        $userIds = array_column($users, 'user_id');
        $placeholders = implode(',', array_fill(0, count($userIds), '?'));
        
        $roles_query = "
            SELECT ur.user_id, r.name as role_name 
            FROM user_roles ur
            JOIN roles r ON ur.role_id = r.id
            WHERE ur.user_id IN ($placeholders)
        ";
        $roles_stmt = $db->prepare($roles_query);
        $roles_stmt->execute($userIds);
        $roles_data = $roles_stmt->fetchAll(PDO::FETCH_ASSOC);

        $roles_map = [];
        foreach ($roles_data as $row) {
            $uid = $row['user_id'];
            if (!isset($roles_map[$uid])) {
                $roles_map[$uid] = [];
            }
            $roles_map[$uid][] = $row['role_name'];
        }

        foreach ($users as &$u) {
            $u['roles'] = $roles_map[$u['user_id']] ?? [];
        }
    }

    echo json_encode([
        "success" => true,
        "data" => $users,
        "pagination" => [
            "total" => $total,
            "page" => $page,
            "limit" => $limit,
            "totalPages" => ceil($total / $limit)
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
}
?>
