<?php
/**
 * Get Calendar Events API
 * GET /api/get_calendar_events.php
 * 
 * Query params: year, month, exclude (optional, e.g. 'planning')
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/middleware.php';

// Optional auth — portal gets filters, website doesn't need auth
$user = optionalAuth();

try {
    $year = (int)($_GET['year'] ?? date('Y'));
    $month = (int)($_GET['month'] ?? date('n'));
    $exclude = $_GET['exclude'] ?? '';

    // Build date range for the month
    $startDate = sprintf('%04d-%02d-01', $year, $month);
    $endDate = date('Y-m-t', strtotime($startDate));

    $where = "WHERE e.start_date BETWEEN :start_date AND :end_date";
    $params = [':start_date' => $startDate, ':end_date' => $endDate];

    if ($exclude === 'planning') {
        $where .= " AND (e.status IS NULL OR e.status != 'planning')";
    }

    $stmt = $db->prepare("
        SELECT 
            e.id,
            e.ename AS title,
            CONCAT(e.start_date, ' ', COALESCE(e.start_time, '00:00')) AS start,
            e.start_date AS date,
            COALESCE(e.type, 'general') AS label
        FROM event e
        $where
        ORDER BY e.start_date ASC, e.start_time ASC
    ");
    $stmt->execute($params);
    $events = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Also fetch meetings as calendar items
    try {
        $meetStmt = $db->prepare("
            SELECT 
                m.id,
                m.name AS title,
                DATE_FORMAT(m.start_time, '%Y-%m-%d %H:%i') AS start,
                DATE(m.start_time) AS date,
                'word session' AS label
            FROM meeting m
            WHERE DATE(m.start_time) BETWEEN :start_date AND :end_date
            ORDER BY m.start_time ASC
        ");
        $meetStmt->execute([':start_date' => $startDate, ':end_date' => $endDate]);
        $meetingEvents = $meetStmt->fetchAll(PDO::FETCH_ASSOC);

        // Give meeting IDs a prefix to avoid collision with event IDs
        foreach ($meetingEvents as &$me) {
            $me['id'] = 'mtg_' . $me['id'];
        }

        $events = array_merge($events, $meetingEvents);
    } catch (PDOException $e) {
        // Meetings table might not have expected columns
    }

    // Sort all events by date
    usort($events, function ($a, $b) {
        return strcmp($a['start'], $b['start']);
    });

    // Build available filter labels
    $filters = array_values(array_unique(array_column($events, 'label')));

    echo json_encode([
        'success' => true,
        'events' => $events,
        'filters' => $filters
    ]);

} catch (PDOException $e) {
    error_log("Calendar events error: " . $e->getMessage());
    apiError('Failed to retrieve calendar events', 500);
}
