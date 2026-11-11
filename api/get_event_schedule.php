<?php
/**
 * Get Event Schedule API
 * GET /api/get_event_schedule.php?event_id=X
 * 
 * Returns schedule sessions grouped by day
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/middleware.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    apiError('Method not allowed', 405);
}

$user = authenticate();

$eventId = isset($_GET['event_id']) ? (int)$_GET['event_id'] : 0;
if ($eventId <= 0) {
    apiError('Event ID is required', 400);
}

try {
    // Get event details
    $stmt = $db->prepare("
        SELECT id, ename, start_date, end_date, branch as venue, target_attendees, notes
        FROM event WHERE id = :id
    ");
    $stmt->execute([':id' => $eventId]);
    $event = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$event) {
        apiError('Event not found', 404);
    }

    // Calculate number of days
    $startDate = new DateTime($event['start_date']);
    $endDate = new DateTime($event['end_date'] ?: $event['start_date']);
    $totalDays = max(1, $endDate->diff($startDate)->days + 1);

    // Get all schedule items
    $stmt = $db->prepare("
        SELECT id, day_number, start_time, end_time, title, description, speaker,
               session_type, location, sort_order
        FROM event_schedule
        WHERE event_id = :event_id
        ORDER BY day_number ASC, sort_order ASC, start_time ASC
    ");
    $stmt->execute([':event_id' => $eventId]);
    $sessions = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Group by day
    $byDay = [];
    foreach ($sessions as $s) {
        $day = (int)$s['day_number'];
        if (!isset($byDay[$day])) {
            $byDay[$day] = [];
        }
        $byDay[$day][] = $s;
    }

    // Stats
    $totalSessions = count($sessions);
    $types = array_count_values(array_column($sessions, 'session_type'));
    $speakers = array_filter(array_unique(array_column($sessions, 'speaker')));

    // Calculate total scheduled time
    $totalMinutes = 0;
    foreach ($sessions as $s) {
        $start = strtotime($s['start_time']);
        $end = strtotime($s['end_time']);
        if ($end > $start) {
            $totalMinutes += ($end - $start) / 60;
        }
    }

    apiSuccess([
        'event' => $event,
        'total_days' => $totalDays,
        'sessions' => $sessions,
        'by_day' => $byDay,
        'stats' => [
            'total_sessions' => $totalSessions,
            'total_days_with_sessions' => count($byDay),
            'total_scheduled_minutes' => $totalMinutes,
            'session_types' => $types,
            'speakers' => array_values($speakers),
            'speaker_count' => count($speakers)
        ]
    ]);

} catch (PDOException $e) {
    error_log("Get event schedule error: " . $e->getMessage());
    apiError('Failed to retrieve schedule', 500);
}
