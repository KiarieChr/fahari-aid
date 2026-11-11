<?php
/**
 * Get Past Events API
 * GET /api/get_past_events.php
 * 
 * Query params: limit (default 6), page (default 1)
 */

require_once __DIR__ . '/config.php';

try {
    $limit = max(1, min(50, (int)($_GET['limit'] ?? 6)));
    $page = max(1, (int)($_GET['page'] ?? 1));
    $offset = ($page - 1) * $limit;
    $today = date('Y-m-d');

    // Count total past events
    $countStmt = $db->prepare("SELECT COUNT(*) as total FROM event WHERE start_date < :today");
    $countStmt->execute([':today' => $today]);
    $total = (int)$countStmt->fetch()['total'];

    // Fetch past events with attendee count
    $stmt = $db->prepare("
        SELECT 
            e.id, e.ename AS name, e.image,
            COALESCE(e.type, 'general') AS type,
            DATE_FORMAT(e.start_date, '%M %d, %Y') AS date_formatted,
            (SELECT COUNT(*) FROM event_registration er WHERE er.event_id = e.id) AS attendee_count
        FROM event e
        WHERE e.start_date < :today
        ORDER BY e.start_date DESC
        LIMIT :limit OFFSET :offset
    ");
    $stmt->bindValue(':today', $today);
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    $events = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($events as &$event) {
        $event['attendee_count'] = (int)$event['attendee_count'];
    }

    echo json_encode([
        'success' => true,
        'events' => $events,
        'pagination' => [
            'has_more' => ($page * $limit) < $total,
            'page' => $page,
            'limit' => $limit
        ]
    ]);

} catch (PDOException $e) {
    error_log("Get past events error: " . $e->getMessage());
    apiError('Failed to retrieve past events', 500);
}
