<?php
/**
 * Visitors API
 * GET /api/get_visitors.php
 */
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/middleware.php';

$user = authenticate();

try {
    $stmt = $db->query("
        SELECT 
            m.id, 
            CONCAT(m.first_name, ' ', m.last_name) as name,
            m.phone_no as phone,
            m.email,
            m.bod as dob,
            TIMESTAMPDIFF(YEAR, m.bod, CURDATE()) as age,
            COALESCE(m.location, '1') as branchId,
            a.created_at as firstVisit,
            (SELECT MAX(login_time) FROM attendance WHERE member_id = m.id) as lastVisit,
            (SELECT COUNT(*) FROM attendance WHERE member_id = m.id) as visits,
            a.assimilation_status as stage,
            COALESCE(u.email, 'Unassigned') as assignedTo,
            m.department as invitedBy,
            a.decision_type as notes
        FROM new_member_assimilation a
        JOIN member m ON a.member_id = m.id
        LEFT JOIN users u ON a.assigned_to = u.id
        WHERE a.created_at >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)
        ORDER BY a.created_at DESC
    ");
    $records = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $formatted = array_map(function($r) {
        $age = $r['dob'] ? (int)$r['age'] : 0;
        $demographic = "Unknown";
        if ($r['dob']) {
            if ($age < 13) {
                $demographic = "Child";
            } elseif ($age < 18) {
                $demographic = "Youth";
            } else {
                $demographic = "Adult";
            }
        }

        $stageMap = [
            'uncontacted' => 'new',
            'attempted' => 'follow-up',
            'contacted' => 'contacted',
            'cell_assigned' => 'connected'
        ];
        $stage = $stageMap[$r['stage']] ?? 'new';

        return [
            'id' => (string)$r['id'],
            'name' => $r['name'],
            'phone' => $r['phone'],
            'email' => $r['email'],
            'age' => $age,
            'demographic' => $demographic,
            'branchId' => (string)$r['branchId'],
            'firstVisit' => $r['firstVisit'] ? date('Y-m-d', strtotime($r['firstVisit'])) : date('Y-m-d'),
            'lastVisit' => $r['lastVisit'] ? date('Y-m-d', strtotime($r['lastVisit'])) : date('Y-m-d'),
            'visits' => max(1, (int)$r['visits']),
            'stage' => $stage,
            'assignedTo' => $r['assignedTo'] !== 'Unassigned' ? explode('@', $r['assignedTo'])[0] : 'Unassigned',
            'invitedBy' => $r['invitedBy'],
            'notes' => $r['notes']
        ];
    }, $records);

    apiSuccess(['data' => $formatted], 'Visitors retrieved');
} catch (Exception $e) {
    error_log("Get visitors error: " . $e->getMessage());
    apiError('Failed to retrieve visitors', 500);
}
