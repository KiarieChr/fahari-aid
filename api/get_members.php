<?php
/**
 * Get Members List API
 * GET /api/get_members.php
 * 
 * Query params: type (regular|committed), page, limit, search
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/middleware.php';

$user = authenticate();

try {
    $type = $_GET['type'] ?? 'regular';
    $page = max(1, (int)($_GET['page'] ?? 1));
    $limit = max(1, min(500, (int)($_GET['limit'] ?? 20)));
    $search = trim($_GET['search'] ?? '');
    $offset = ($page - 1) * $limit;
    
    $department_id = $_GET['department_id'] ?? '';
    $branch_id = $_GET['branch_id'] ?? '';
    $min_age = $_GET['min_age'] ?? '';
    $max_age = $_GET['max_age'] ?? '';

    $where = "WHERE 1=1";
    $params = [];

    // Filter by type
    if ($type === 'committed') {
        try {
            // Check if committed_members table exists and join
            $where .= " AND m.id IN (SELECT member_id FROM committed_members)";
        } catch (PDOException $e) {
            // If table doesn't exist, return empty
        }
    }

    // Filter soft-deleted (delete_status = 'Active' means active member)
    $where .= " AND m.delete_status = 'Active'";

    // Search filter
    if (!empty($search)) {
        $where .= " AND (m.first_name LIKE :search OR m.last_name LIKE :search OR m.phone_no LIKE :search OR m.email LIKE :search)";
        $params[':search'] = "%$search%";
    }
    
    // Department filter
    if (!empty($department_id)) {
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

    $min_attendance = $_GET['min_attendance'] ?? '';
    $max_attendance = $_GET['max_attendance'] ?? '';
    
    $having = "";
    if ($min_attendance !== '' || $max_attendance !== '') {
        $havingClauses = [];
        if ($min_attendance !== '') {
            $havingClauses[] = "attendance_rate >= :min_attendance";
            $params[':min_attendance'] = (float)$min_attendance;
        }
        if ($max_attendance !== '') {
            $havingClauses[] = "attendance_rate <= :max_attendance";
            $params[':max_attendance'] = (float)$max_attendance;
        }
        $having = "HAVING " . implode(" AND ", $havingClauses);
    }

    // Count total
    if ($having !== '') {
        $countSql = "SELECT COUNT(*) as total FROM (
            SELECT COALESCE(ROUND((SELECT COUNT(DISTINCT a.meeting_id) FROM attendance a WHERE a.member_id = m.id) / NULLIF((SELECT COUNT(id) FROM meeting), 0) * 100, 1), 0) AS attendance_rate
            FROM member m $where $having
        ) AS t";
    } else {
        $countSql = "SELECT COUNT(*) as total FROM member m $where";
    }
    
    $countStmt = $db->prepare($countSql);
    $countStmt->execute($params);
    $total = (int)$countStmt->fetch()['total'];

    // Fetch members
    $sql = "
        SELECT m.id, m.first_name, m.last_name, m.phone_no, m.email, m.bod, m.joined_on,
               'Active' AS status, m.cell_id, m.branch_id,
               COALESCE(ROUND((SELECT COUNT(DISTINCT a.meeting_id) FROM attendance a WHERE a.member_id = m.id) / NULLIF((SELECT COUNT(id) FROM meeting), 0) * 100, 1), 0) AS attendance_rate,
               (SELECT 1 FROM new_member_assimilation nma WHERE nma.member_id = m.id AND nma.decision_type = 'visitor' LIMIT 1) AS is_visitor
        FROM member m
        $where
        $having
        ORDER BY m.id DESC
        LIMIT :limit OFFSET :offset
    ";
    $stmt = $db->prepare($sql);
    foreach ($params as $key => $val) {
        $stmt->bindValue($key, $val);
    }
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    $members = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Fetch Age Categories and Calculate Demographics
    $ageCatsStmt = $db->query("SELECT * FROM age_categories ORDER BY min_age ASC");
    $ageCategories = $ageCatsStmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($members as &$m) {
        $m['demographic'] = 'Unknown';
        $m['is_visitor'] = !empty($m['is_visitor']);
        if (!empty($m['bod'])) {
            try {
                $dob = new DateTime($m['bod']);
                $now = new DateTime();
                $age = $now->diff($dob)->y;
                
                foreach ($ageCategories as $cat) {
                    $min = (int)$cat['min_age'];
                    $max = $cat['max_age'] !== null ? (int)$cat['max_age'] : 999;
                    if ($age >= $min && $age <= $max) {
                        $m['demographic'] = $cat['name'];
                        break;
                    }
                }
            } catch (Exception $e) {
                // Ignore invalid dates
            }
        }
    }

    echo json_encode([
        'success' => true,
        'data' => $members,
        'pagination' => [
            'total' => $total,
            'total_pages' => ceil($total / $limit),
            'page' => $page,
            'limit' => $limit
        ]
    ]);

} catch (PDOException $e) {
    error_log("Get members error: " . $e->getMessage());
    apiError('Failed to retrieve members', 500);
}
