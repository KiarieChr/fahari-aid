<?php
/**
 * Get Public Event Details API
 * GET /api/get_event_details.php?id=X
 * 
 * Returns public event information for registration
 */

require_once __DIR__ . '/config.php';

$eventId = isset($_GET['id']) ? (int)$_GET['id'] : 0;

if (!$eventId) {
    apiError('Event ID is required', 400);
}

try {
    $stmt = $db->prepare("
        SELECT 
            id, 
            ename as name, 
            notes as description, 
            start_date, 
            end_date, 
            branch as venue,
            target_attendees,
            facilitation_fee
        FROM event 
        WHERE id = :event_id
    ");
    $stmt->execute([':event_id' => $eventId]);
    $event = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$event) {
        apiError('Event not found', 404);
    }
    
    // Check if event is in the past
    $isPast = strtotime($event['start_date']) < time();
    $event['is_past'] = $isPast;
    $event['registration_open'] = !$isPast;
    
    apiSuccess($event, 'Event details retrieved');
    
} catch (PDOException $e) {
    error_log("Get Event Details error: " . $e->getMessage());
    apiError('Failed to retrieve event details', 500);
}
