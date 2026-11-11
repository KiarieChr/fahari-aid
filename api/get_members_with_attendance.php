<?php
/**
 * Get Members List API with Attendance
 * GET /api/get_members_with_attendance.php
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

    // Count total members for pagination
    $countSql = "SELECT COUNT(*) as total FROM member m $where";
    $countStmt = $db->prepare($countSql);
    $countStmt->execute($params);
    $total = (int)$countStmt->fetch()['total'];
    
    // Count total meetings once
    $meetingCountStmt = $db->query("SELECT COUNT(id) as total FROM meeting");
    $total_meetings = (int)$meetingCountStmt->fetch()['total'];

    // Fetch members with attendance subquery
    $sql = "
        SELECT m.id, m.first_name, m.last_name, m.phone_no, m.email, 
               'Active' AS status, m.cell_id,
               (SELECT COUNT(DISTINCT a.meeting_id) FROM attendance a WHERE a.member_id = m.id) as attended_count,
               :total_meetings as total_meetings
        FROM member m
        $where
        ORDER BY m.first_name ASC, m.last_name ASC
        LIMIT :limit OFFSET :offset
    ";
    $stmt = $db->prepare($sql);
    foreach ($params as $key => $val) {
        $stmt->bindValue($key, $val);
    }
    $stmt->bindValue(':total_meetings', $total_meetings, PDO::PARAM_INT);
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    $members = $stmt->fetchAll(PDO::FETCH_ASSOC);

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
