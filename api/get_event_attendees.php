<?php
/**
 * Get Event Attendees API
 * GET /api/get_event_attendees.php?event_id=X
 * 
 * Returns list of registered attendees for an event
 */

require_once __DIR__ . '/config.php';

// Get event_id from query params
$eventId = isset($_GET['event_id']) ? (int)$_GET['event_id'] : 0;

if (!$eventId) {
    apiError('Event ID is required', 400);
}

try {
    // Get event details
    $eventStmt = $db->prepare("SELECT id, ename, start_date FROM event WHERE id = :event_id");
    $eventStmt->execute([':event_id' => $eventId]);
    $event = $eventStmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$event) {
        apiError('Event not found', 404);
    }
    
    // Get attendees
    $stmt = $db->prepare("
        SELECT 
            id,
            names,
            phone_no,
            email,
            residence,
            category,
            travelling_from,
            sponsorship,
            created_at
        FROM event_registration
        WHERE event_id = :event_id
        ORDER BY id DESC
    ");
    $stmt->execute([':event_id' => $eventId]);
    $attendees = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Count by sponsorship status
    $sponsored = 0;
    $noSponsor = 0;
    foreach ($attendees as $a) {
        if ($a['sponsorship'] === 'sponsored-fully' || $a['sponsorship'] === 'half-sponsored') {
            $sponsored++;
        } else {
            $noSponsor++;
        }
    }
    
    // Generate public registration link
    $baseUrl = 'http://jesusenthroned_net.local/pages/registration.php';
    $registrationLink = $baseUrl . '?id=' . $eventId;
    
    apiSuccess([
        'event' => $event,
        'attendees' => $attendees,
        'total' => count($attendees),
        'sponsored_count' => $sponsored,
        'self_funded_count' => $noSponsor,
        'registration_link' => $registrationLink
    ], 'Attendees retrieved successfully');
    
} catch (PDOException $e) {
    error_log("Get Event Attendees error: " . $e->getMessage());
    apiError('Failed to retrieve attendees', 500);
}
