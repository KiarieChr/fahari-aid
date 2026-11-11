<?php
/**
 * Get Unassigned Members API
 * GET /api/get_unassigned_members.php
 * 
 * Query params: search (optional), location (optional)
 * Returns members not assigned to any cell
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/middleware.php';

$user = authenticate();

try {
    $search = trim($_GET['search'] ?? '');
    $location = trim($_GET['location'] ?? '');

    $where = "WHERE (m.cell_id IS NULL) AND (m.delete_status IS NULL OR m.delete_status = '0')";
    $params = [];

    if ($search !== '') {
        $where .= " AND (m.first_name LIKE :search OR m.last_name LIKE :search OR m.phone_no LIKE :search OR m.email LIKE :search)";
        $params[':search'] = "%$search%";
    }

    if ($location !== '') {
        $where .= " AND m.location LIKE :location";
        $params[':location'] = "%$location%";
    }

    $stmt = $db->prepare("
        SELECT m.id, m.first_name, m.last_name, m.phone_no, m.email, m.location, m.gender
        FROM member m
        $where
        ORDER BY m.first_name ASC, m.last_name ASC
    ");
    $stmt->execute($params);
    $members = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Get distinct locations for filter dropdown
    $locStmt = $db->query("
        SELECT DISTINCT location FROM member 
        WHERE location IS NOT NULL AND location != '' AND (delete_status IS NULL OR delete_status = '0')
        ORDER BY location ASC
    ");
    $locations = array_column($locStmt->fetchAll(PDO::FETCH_ASSOC), 'location');

    // Total counts for stats
    $totalStmt = $db->query("SELECT COUNT(*) FROM member WHERE (delete_status IS NULL OR delete_status = '0')");
    $totalMembers = (int)$totalStmt->fetchColumn();

    $assignedStmt = $db->query("SELECT COUNT(*) FROM member WHERE cell_id IS NOT NULL AND (delete_status IS NULL OR delete_status = '0')");
    $assignedMembers = (int)$assignedStmt->fetchColumn();

    $cellCountStmt = $db->query("SELECT COUNT(*) FROM cells");
    $totalCells = (int)$cellCountStmt->fetchColumn();

    $atCapStmt = $db->query("
        SELECT COUNT(*) FROM cells c 
        WHERE (SELECT COUNT(*) FROM member m WHERE m.cell_id = c.id AND (m.delete_status IS NULL OR m.delete_status = '0')) >= c.capacity
    ");
    $atCapacity = (int)$atCapStmt->fetchColumn();

    apiSuccess([
        'members' => $members,
        'locations' => $locations,
        'stats' => [
            'total_members' => $totalMembers,
            'assigned' => $assignedMembers,
            'unassigned' => $totalMembers - $assignedMembers,
            'total_cells' => $totalCells,
            'at_capacity' => $atCapacity
        ]
    ]);

} catch (PDOException $e) {
    error_log("Get unassigned members error: " . $e->getMessage());
    apiError('Failed to retrieve unassigned members', 500);
}
