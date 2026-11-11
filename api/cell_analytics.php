<?php
/**
 * Cell Analytics API
 * GET /api/cell_analytics.php
 * Returns cell health metrics, attendance trends, and distribution data
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/middleware.php';

$user = authenticate();

try {
    // Total members & assignment stats
    $totalMembers = (int)$db->query("SELECT COUNT(*) FROM member WHERE delete_status IS NULL OR delete_status = '0'")->fetchColumn();
    $assignedMembers = (int)$db->query("SELECT COUNT(*) FROM member WHERE cell_id IS NOT NULL AND (delete_status IS NULL OR delete_status = '0')")->fetchColumn();
    $unassignedMembers = $totalMembers - $assignedMembers;

    // Cells overview
    $totalCells = (int)$db->query("SELECT COUNT(*) FROM cells")->fetchColumn();
    $activeCells = (int)$db->query("SELECT COUNT(*) FROM cells WHERE status = 1")->fetchColumn();

    // Cell size distribution
    $sizeDistribution = $db->query("
        SELECT 
            CASE
                WHEN cnt = 0 THEN 'Empty'
                WHEN cnt BETWEEN 1 AND 3 THEN '1-3'
                WHEN cnt BETWEEN 4 AND 7 THEN '4-7'
                WHEN cnt BETWEEN 8 AND 12 THEN '8-12'
                ELSE '13+'
            END AS size_range,
            COUNT(*) AS cell_count
        FROM (
            SELECT c.id, COUNT(m.id) AS cnt
            FROM cells c
            LEFT JOIN member m ON m.cell_id = c.id AND (m.delete_status IS NULL OR m.delete_status = '0')
            GROUP BY c.id
        ) sub
        GROUP BY size_range
        ORDER BY FIELD(size_range, 'Empty', '1-3', '4-7', '8-12', '13+')
    ")->fetchAll(PDO::FETCH_ASSOC);

    // Category distribution 
    $categoryDistribution = $db->query("
        SELECT COALESCE(category, 'General') AS category, COUNT(*) AS count
        FROM cells
        GROUP BY category
        ORDER BY count DESC
    ")->fetchAll(PDO::FETCH_ASSOC);

    // Top 10 cells by member count
    $topCells = $db->query("
        SELECT c.id, c.code, c.name, COUNT(m.id) AS member_count, c.capacity,
               CONCAT(ldr.first_name, ' ', ldr.last_name) AS leader_name
        FROM cells c
        LEFT JOIN member m ON m.cell_id = c.id AND (m.delete_status IS NULL OR m.delete_status = '0')
        LEFT JOIN member ldr ON c.cell_leader = ldr.id
        WHERE c.status = 1
        GROUP BY c.id
        ORDER BY member_count DESC
        LIMIT 10
    ")->fetchAll(PDO::FETCH_ASSOC);

    // Attendance trends (last 8 weeks)
    $attendanceTrends = $db->query("
        SELECT 
            DATE_FORMAT(meeting_date, '%Y-%m-%d') AS week_start,
            COUNT(DISTINCT cell_id) AS cells_reporting,
            SUM(CASE WHEN present = 1 THEN 1 ELSE 0 END) AS total_present,
            COUNT(*) AS total_recorded,
            ROUND(SUM(CASE WHEN present = 1 THEN 1 ELSE 0 END) / COUNT(*) * 100, 1) AS attendance_rate
        FROM cell_attendance
        WHERE meeting_date >= DATE_SUB(CURDATE(), INTERVAL 8 WEEK)
        GROUP BY YEARWEEK(meeting_date, 1)
        ORDER BY week_start ASC
    ")->fetchAll(PDO::FETCH_ASSOC);

    // Follow-up stats
    $followupStats = $db->query("
        SELECT 
            COUNT(*) AS total,
            SUM(status = 'pending') AS pending,
            SUM(status = 'completed') AS completed,
            SUM(status = 'no_response') AS no_response
        FROM followups
    ")->fetch(PDO::FETCH_ASSOC);

    // Cells needing attention (< 3 members or no recent attendance)
    $needsAttention = $db->query("
        SELECT c.id, c.code, c.name, COUNT(m.id) AS member_count,
               CONCAT(ldr.first_name, ' ', ldr.last_name) AS leader_name,
               (SELECT MAX(meeting_date) FROM cell_attendance ca WHERE ca.cell_id = c.id) AS last_attendance
        FROM cells c
        LEFT JOIN member m ON m.cell_id = c.id AND (m.delete_status IS NULL OR m.delete_status = '0')
        LEFT JOIN member ldr ON c.cell_leader = ldr.id
        WHERE c.status = 1
        GROUP BY c.id
        HAVING member_count < 3 OR last_attendance IS NULL OR last_attendance < DATE_SUB(CURDATE(), INTERVAL 4 WEEK)
        ORDER BY member_count ASC
        LIMIT 10
    ")->fetchAll(PDO::FETCH_ASSOC);

    apiSuccess([
        'overview' => [
            'total_members' => $totalMembers,
            'assigned_members' => $assignedMembers,
            'unassigned_members' => $unassignedMembers,
            'assignment_rate' => $totalMembers > 0 ? round($assignedMembers / $totalMembers * 100, 1) : 0,
            'total_cells' => $totalCells,
            'active_cells' => $activeCells,
            'avg_members_per_cell' => $activeCells > 0 ? round($assignedMembers / $activeCells, 1) : 0
        ],
        'size_distribution' => $sizeDistribution,
        'category_distribution' => $categoryDistribution,
        'top_cells' => $topCells,
        'attendance_trends' => $attendanceTrends,
        'followup_stats' => $followupStats,
        'needs_attention' => $needsAttention
    ]);

} catch (PDOException $e) {
    error_log("Cell analytics error: " . $e->getMessage());
    apiError('Failed to retrieve analytics', 500);
}
