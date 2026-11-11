<?php
/**
 * Get Upcoming Events API
 * GET /api/get_upcoming_events.php
 * 
 * Query params: featured=1 (optional), limit (default 4)
 */

require_once __DIR__ . '/config.php';

try {
    $featured = (int)($_GET['featured'] ?? 0);
    $limit = max(1, min(20, (int)($_GET['limit'] ?? 4)));
    $today = date('Y-m-d');

    // Get the primary featured/upcoming event
    $stmt = $db->prepare("
        SELECT 
            e.id, e.ename AS name, e.notes AS description,
            e.start_date, e.end_date, e.branch AS location,
            e.image, e.target_attendees,
            COALESCE(e.type, 'general') AS type,
            DATE_FORMAT(e.start_date, '%M %d, %Y') AS date_formatted,
            DATEDIFF(e.start_date, CURDATE()) AS days_until
        FROM event e
        WHERE e.start_date >= :today
        ORDER BY e.start_date ASC
        LIMIT 1
    ");
    $stmt->execute([':today' => $today]);
    $featuredEvent = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($featuredEvent) {
        $featuredEvent['days_until'] = max(0, (int)$featuredEvent['days_until']);
    }

    // Get list of upcoming events
    $stmt = $db->prepare("
        SELECT 
            e.id, e.ename AS name, e.image,
            COALESCE(e.type, 'general') AS type,
            DATE_FORMAT(e.start_date, '%M %d, %Y') AS date_formatted,
            DATEDIFF(e.start_date, CURDATE()) AS days_until
        FROM event e
        WHERE e.start_date >= :today
        ORDER BY e.start_date ASC
        LIMIT :limit
    ");
    $stmt->bindValue(':today', $today);
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->execute();
    $events = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($events as &$event) {
        $event['days_until'] = max(0, (int)$event['days_until']);
    }

    echo json_encode([
        'success' => true,
        'event' => $featuredEvent,
        'events' => $events
    ]);

} catch (PDOException $e) {
    error_log("Get upcoming events error: " . $e->getMessage());
    apiError('Failed to retrieve upcoming events', 500);
}
