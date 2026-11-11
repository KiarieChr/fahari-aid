<?php
/**
 * Get New Members List with Assimilation Status
 * GET /api/get_new_members_list.php
 * Params: page, limit, status, search
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/middleware.php';

$user = authenticate();

try {
    $page   = max(1, (int)($_GET['page']  ?? 1));
    $limit  = max(1, min(100, (int)($_GET['limit'] ?? 25)));
    $offset = ($page - 1) * $limit;
    $status = $_GET['status'] ?? '';
    $search = trim($_GET['search'] ?? '');

    $where  = "WHERE a.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)";
    $params = [];

    if ($status && in_array($status, ['uncontacted','attempted','contacted','cell_assigned'])) {
        $where .= " AND a.assimilation_status = :status";
        $params[':status'] = $status;
    }

    if ($search !== '') {
        $where .= " AND (m.first_name LIKE :search OR m.last_name LIKE :search OR m.phone_no LIKE :search)";
        $params[':search'] = "%$search%";
    }

    // Total count
    $cStmt = $db->prepare("
        SELECT COUNT(*)
        FROM new_member_assimilation a
        JOIN member m ON m.id = a.member_id
        $where
    ");
    $cStmt->execute($params);
    $total = (int)$cStmt->fetchColumn();

    // Fetch list
    $stmt = $db->prepare("
        SELECT
            a.id AS assimilation_id,
            a.assimilation_status,
            a.decision_type,
            a.assigned_to,
            a.sla_breached,
            a.created_at,
            TIMESTAMPDIFF(HOUR, a.created_at, NOW()) AS hours_since_added,
            m.id AS member_id,
            m.first_name, m.last_name,
            m.phone_no, m.email,
            m.joined_on,
            COALESCE(CONCAT(u.email), 'Unassigned') AS assigned_to_name,
            (SELECT COUNT(*) FROM assimilation_followups f WHERE f.assimilation_id = a.id) AS followup_count,
            (SELECT f2.logged_at FROM assimilation_followups f2 WHERE f2.assimilation_id = a.id ORDER BY f2.logged_at DESC LIMIT 1) AS last_contact_at
        FROM new_member_assimilation a
        JOIN member m ON m.id = a.member_id
        LEFT JOIN users u ON u.id = a.assigned_to
        $where
        ORDER BY a.created_at DESC
        LIMIT $limit OFFSET $offset
    ");
    $stmt->execute($params);
    $members = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Map status to color code
    $statusColors = [
        'uncontacted'  => 'red',
        'attempted'    => 'yellow',
        'contacted'    => 'green',
        'cell_assigned'=> 'blue',
    ];

    foreach ($members as &$row) {
        $row['status_color'] = $statusColors[$row['assimilation_status']] ?? 'grey';
        $row['sla_breached']  = (bool)$row['sla_breached'];
    }
    unset($row);

    apiSuccess([
        'members'    => $members,
        'pagination' => [
            'total'    => $total,
            'page'     => $page,
            'limit'    => $limit,
            'has_more' => ($page * $limit) < $total,
        ],
    ]);

} catch (PDOException $e) {
    error_log("Get new members list error: " . $e->getMessage());
    apiError('Failed to load new members list', 500);
}
