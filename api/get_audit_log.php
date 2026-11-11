<?php
/**
 * Get Audit Log
 * GET /api/get_audit_log.php?page=1&limit=20&table_name=&action=
 */
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/middleware.php';

$user = authenticate();

try {
    $page = max(1, (int)($_GET['page'] ?? 1));
    $limit = max(1, min(100, (int)($_GET['limit'] ?? 20)));
    $offset = ($page - 1) * $limit;
    $tableName = $_GET['table_name'] ?? '';
    $action = $_GET['action'] ?? '';

    $where = "WHERE 1=1";
    $params = [];

    if (!empty($tableName)) {
        $where .= " AND al.table_name = :table";
        $params[':table'] = $tableName;
    }
    if (!empty($action)) {
        $where .= " AND al.action = :action";
        $params[':action'] = $action;
    }

    $countStmt = $db->prepare("SELECT COUNT(*) FROM audit_log al $where");
    $countStmt->execute($params);
    $total = (int)$countStmt->fetchColumn();

    $sql = "SELECT al.*, u.email AS user_email
            FROM audit_log al
            LEFT JOIN users u ON u.id = al.user_id
            $where
            ORDER BY al.created_at DESC
            LIMIT :limit OFFSET :offset";
    $stmt = $db->prepare($sql);
    foreach ($params as $k => $v) $stmt->bindValue($k, $v);
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    $logs = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($logs as &$log) {
        $log['id'] = (int)$log['id'];
        $log['record_id'] = (int)$log['record_id'];
        $log['user_id'] = (int)$log['user_id'];
        $log['old_values'] = $log['old_values'] ? json_decode($log['old_values'], true) : null;
        $log['new_values'] = $log['new_values'] ? json_decode($log['new_values'], true) : null;
    }

    apiSuccess([
        'logs' => $logs,
        'pagination' => [
            'total' => $total,
            'total_pages' => max(1, ceil($total / $limit)),
            'page' => $page,
            'limit' => $limit,
        ]
    ], 'Audit log retrieved');

} catch (PDOException $e) {
    error_log("Audit log error: " . $e->getMessage());
    apiError('Failed to retrieve audit log', 500);
}
