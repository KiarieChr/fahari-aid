<?php
/**
 * Get All Cells API
 * GET /api/get_cells.php
 * 
 * Query params: search (optional), status (optional: active|inactive)
 * Returns all cells with leader info and member counts
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/middleware.php';

$user = authenticate();

try {
    $search = trim($_GET['search'] ?? '');
    $status = $_GET['status'] ?? '';

    $where = "WHERE 1=1";
    $params = [];

    if ($search !== '') {
        $where .= " AND (c.code LIKE :search OR c.name LIKE :search OR CONCAT(m.first_name, ' ', m.last_name) LIKE :search)";
        $params[':search'] = "%$search%";
    }

    if ($status === 'active') {
        $where .= " AND c.status = 1";
    } elseif ($status === 'inactive') {
        $where .= " AND c.status = 0";
    }

    // Get cells with leader info and member count
    $stmt = $db->prepare("
        SELECT 
            c.id, c.code, c.name, c.category, c.meeting_day, c.meeting_time,
            c.location, c.capacity, c.status, c.created_at,
            c.cell_leader,
            m.first_name AS leader_first_name,
            m.last_name AS leader_last_name,
            m.phone_no AS leader_phone,
            (SELECT COUNT(*) FROM member mem WHERE mem.cell_id = c.id AND (mem.delete_status IS NULL OR mem.delete_status = '0')) AS member_count
        FROM cells c
        LEFT JOIN member m ON c.cell_leader = m.id
        $where
        ORDER BY c.id DESC
    ");
    $stmt->execute($params);
    $cells = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($cells as &$cell) {
        $cell['id'] = (int)$cell['id'];
        $cell['capacity'] = (int)$cell['capacity'];
        $cell['status'] = (int)$cell['status'];
        $cell['member_count'] = (int)$cell['member_count'];
        $cell['leader_name'] = trim(($cell['leader_first_name'] ?? '') . ' ' . ($cell['leader_last_name'] ?? ''));
    }

    // Stats
    $totalCells = count($cells);
    $activeCells = count(array_filter($cells, fn($c) => $c['status'] === 1));
    $totalMembers = array_sum(array_column($cells, 'member_count'));
    $needsAttention = count(array_filter($cells, fn($c) => $c['member_count'] < 3 && $c['status'] === 1));

    apiSuccess([
        'cells' => $cells,
        'stats' => [
            'total_cells' => $totalCells,
            'active_cells' => $activeCells,
            'total_members_in_cells' => $totalMembers,
            'needs_attention' => $needsAttention,
            'avg_per_cell' => $totalCells > 0 ? round($totalMembers / $totalCells, 1) : 0
        ]
    ]);

} catch (PDOException $e) {
    error_log("Get cells error: " . $e->getMessage());
    apiError('Failed to retrieve cells', 500);
}
