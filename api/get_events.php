<?php
/**
 * Get Events API
 * GET /api/get_events.php
 */
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/middleware.php';

$user = authenticate();

try {
    $stmt = $db->query("
        SELECT 
            e.id, 
            e.ename as title,
            LOWER(COALESCE(e.type, 'general')) as raw_type,
            e.start_date as startsAt,
            e.end_date as endsAt,
            COALESCE(e.branch, 'Main Campus') as location,
            COALESCE(e.target_attendees, 0) as capacity,
            e.notes as description,
            COUNT(DISTINCT r.id) as registered
        FROM event e
        LEFT JOIN event_registration r ON e.id = r.event_id
        GROUP BY e.id
        ORDER BY e.start_date DESC
        LIMIT 100
    ");
    $events = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $formatted = array_map(function($e) {
        $rawType = $e['raw_type'];
        $type = 'other';
        if (strpos($rawType, 'service') !== false) $type = 'service';
        elseif (strpos($rawType, 'conference') !== false) $type = 'conference';
        elseif (strpos($rawType, 'outreach') !== false) $type = 'outreach';
        elseif (strpos($rawType, 'youth') !== false) $type = 'youth';
        elseif (strpos($rawType, 'meeting') !== false) $type = 'meeting';

        // Fix missing end dates
        $startsAt = $e['startsAt'] ? date('Y-m-d\TH:i:s\Z', strtotime($e['startsAt'])) : date('Y-m-d\TH:i:s\Z');
        $endsAt = $e['endsAt'] && $e['endsAt'] !== '0000-00-00 00:00:00' 
            ? date('Y-m-d\TH:i:s\Z', strtotime($e['endsAt'])) 
            : date('Y-m-d\TH:i:s\Z', strtotime($startsAt . ' +2 hours'));

        return [
            'id' => (string)$e['id'],
            'title' => $e['title'] ?: 'Untitled Event',
            'type' => $type,
            'startsAt' => $startsAt,
            'endsAt' => $endsAt,
            'location' => $e['location'],
            'branchId' => '1',
            'organizer' => 'Fahari Eklesia',
            'description' => $e['description'] ?: 'No description provided.',
            'registered' => (int)$e['registered'],
            'capacity' => max((int)$e['capacity'], (int)$e['registered'])
        ];
    }, $events);

    apiSuccess(['data' => $formatted], 'Events retrieved');
} catch (Exception $e) {
    error_log("Get events error: " . $e->getMessage());
    apiError('Failed to retrieve events', 500);
}
