<?php
/**
 * Get Followups API
 * GET /api/get_followups.php
 * 
 * Query params: status (pending|completed|no_response), type, cell_id, limit, page
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/middleware.php';

$user = authenticate();

try {
    $status = $_GET['status'] ?? '';
    $type = $_GET['type'] ?? '';
    $cell_id = (int)($_GET['cell_id'] ?? 0);
    $limit = max(1, min(50, (int)($_GET['limit'] ?? 20)));
    $page = max(1, (int)($_GET['page'] ?? 1));
    $offset = ($page - 1) * $limit;

    $where = "WHERE 1=1";
    $params = [];

    if ($status !== '' && in_array($status, ['pending', 'completed', 'no_response'])) {
        $where .= " AND f.status = :status";
        $params[':status'] = $status;
    }

    if ($type !== '' && in_array($type, ['general', 'attendance', 'welfare', 'new_member'])) {
        $where .= " AND f.followup_type = :type";
        $params[':type'] = $type;
    }

    if ($cell_id > 0) {
        $where .= " AND m.cell_id = :cell_id";
        $params[':cell_id'] = $cell_id;
    }

    // Count total
    $countStmt = $db->prepare("
        SELECT COUNT(*) FROM followups f
        JOIN member m ON f.member_id = m.id
        $where
    ");
    $countStmt->execute($params);
    $total = (int)$countStmt->fetchColumn();

    // Fetch followups
    $stmt = $db->prepare("
        SELECT 
            f.id, f.member_id, f.message, f.followup_type, f.status,
            f.sent_via_sms, f.sent_via_email, f.notes,
            f.sent_at, f.completed_at,
            m.first_name, m.last_name, m.phone_no, m.email, m.cell_id,
            COALESCE(u.email, 'System') AS sent_by_name
        FROM followups f
        JOIN member m ON f.member_id = m.id
        LEFT JOIN users u ON f.sent_by = u.id
        $where
        ORDER BY f.sent_at DESC
        LIMIT $limit OFFSET $offset
    ");
    $stmt->execute($params);
    $followups = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Stats
    $statsStmt = $db->query("
        SELECT 
            COUNT(*) AS total,
            COUNT(CASE WHEN status = 'pending' THEN 1 END) AS pending,
            COUNT(CASE WHEN status = 'completed' THEN 1 END) AS completed,
            COUNT(CASE WHEN status = 'no_response' THEN 1 END) AS no_response
        FROM followups
    ");
    $stats = $statsStmt->fetch(PDO::FETCH_ASSOC);

    apiSuccess([
        'followups' => $followups,
        'stats' => $stats,
        'pagination' => [
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
            'has_more' => ($page * $limit) < $total
        ]
    ]);

} catch (PDOException $e) {
    error_log("Get followups error: " . $e->getMessage());
    apiError('Failed to retrieve followups', 500);
}
