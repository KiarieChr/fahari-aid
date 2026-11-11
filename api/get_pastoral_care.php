<?php
/**
 * Pastoral Care API
 * GET /api/get_pastoral_care.php
 */
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/middleware.php';

$user = authenticate();

try {
    $stmt = $db->query("
        SELECT 
            p.id, 
            p.type, 
            CONCAT(m.first_name, ' ', m.last_name) as personName,
            p.branch_id as branchId,
            COALESCE(u.email, 'Unassigned') as assignedTo,
            p.opened_on as openedOn,
            p.status,
            p.confidential,
            p.summary
        FROM pastoral_care p
        JOIN member m ON p.member_id = m.id
        LEFT JOIN users u ON p.assigned_to = u.id
        ORDER BY p.opened_on DESC
    ");
    $records = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $formatted = array_map(function($r) {
        return [
            'id' => (string)$r['id'],
            'type' => $r['type'],
            'personName' => $r['personName'],
            'branchId' => (string)$r['branchId'],
            'assignedTo' => $r['assignedTo'] ? explode('@', $r['assignedTo'])[0] : 'Unassigned',
            'openedOn' => $r['openedOn'],
            'status' => $r['status'],
            'confidential' => (bool)$r['confidential'],
            'summary' => $r['summary']
        ];
    }, $records);

    apiSuccess(['data' => $formatted], 'Pastoral care retrieved');
} catch (Exception $e) {
    error_log("Get pastoral care error: " . $e->getMessage());
    apiError('Failed to retrieve pastoral care records', 500);
}
