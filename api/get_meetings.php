<?php
/**
 * Get Meetings List API
 * GET /api/get_meetings.php
 * 
 * Query params: status (upcoming|completed|cancelled), page, limit
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/middleware.php';

$user = authenticate();

try {
    $status = $_GET['status'] ?? '';
    $page = max(1, (int)($_GET['page'] ?? 1));
    $limit = max(1, min(100, (int)($_GET['limit'] ?? 10)));
    $offset = ($page - 1) * $limit;

    $where = "WHERE 1=1";
    $params = [];

    if ($status === 'upcoming') {
        $where .= " AND m.start_time >= NOW()";
    } elseif ($status === 'completed') {
        $where .= " AND m.end_time < NOW()";
    }

    // Count total
    $countSql = "SELECT COUNT(*) as total FROM meeting m $where";
    $countStmt = $db->prepare($countSql);
    $countStmt->execute($params);
    $total = (int)$countStmt->fetch()['total'];

    // Fetch meetings
    $sql = "
        SELECT 
            m.id,
            m.name AS title,
            COALESCE(
                (SELECT mt.name FROM meeting_types mt WHERE mt.id = m.meeting_type),
                'General'
            ) AS category,
            DATE(m.start_time) AS date,
            TIME_FORMAT(m.start_time, '%H:%i') AS time,
            TIME_FORMAT(m.end_time, '%H:%i') AS end_time,
            COALESCE(
                (SELECT CONCAT(mb.first_name, ' ', mb.last_name) FROM users u JOIN member mb ON u.member_id = mb.id WHERE u.id = m.facilitator),
                (SELECT CONCAT(mb.first_name, ' ', mb.last_name) FROM member mb WHERE mb.id = m.facilitator),
                'N/A'
            ) AS facilitator,
            (SELECT COUNT(*) FROM attendance a WHERE a.meeting_id = m.id) AS attendee_count,
            m.meeting_link,
            m.banner,
            m.description,
            CASE 
                WHEN m.end_time < NOW() THEN 'Completed'
                ELSE 'Upcoming'
            END AS status
        FROM meeting m
        $where
        ORDER BY m.start_time DESC
        LIMIT :limit OFFSET :offset
    ";

    $stmt = $db->prepare($sql);
    foreach ($params as $key => $val) {
        $stmt->bindValue($key, $val);
    }
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    $meetings = $stmt->fetchAll(PDO::FETCH_ASSOC);

    apiSuccess([
        'meetings' => $meetings,
        'pagination' => [
            'total' => $total,
            'total_pages' => ceil($total / $limit),
            'page' => $page,
            'limit' => $limit
        ]
    ], 'Meetings retrieved');

} catch (PDOException $e) {
    error_log("Get meetings error: " . $e->getMessage());
    apiError('Failed to retrieve meetings', 500);
}
