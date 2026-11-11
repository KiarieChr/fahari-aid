<?php
header('Content-Type: application/json');
include('../includes/connection.php');

$response = ['success' => false, 'message' => 'An unexpected error occurred.'];

try {
    // Optional: if you want to accept event_id via GET, use this instead
    $event_id = $_GET['event_id'] ?? null;

    if (!$event_id) {
        // Get the most upcoming event
        $get_stmt = $db->prepare("SELECT * FROM event WHERE start_date >= CURDATE() ORDER BY start_date ASC LIMIT 1");
        $get_stmt->execute();
        $event = $get_stmt->fetch(PDO::FETCH_ASSOC);

        if (empty($event)) {
            echo json_encode(['success' => false, 'message' => "No upcoming event found."]);
            exit;
        }

        $event_id = $event['id'];
    } else {
        // Fetch event details for provided ID
        $get_stmt = $db->prepare("SELECT * FROM event WHERE id = :event_id");
        $get_stmt->execute([':event_id' => $event_id]);
        $event = $get_stmt->fetch(PDO::FETCH_ASSOC);

        if (empty($event)) {
            echo json_encode(['success' => false, 'message' => "Event not found."]);
            exit;
        }
    }

    $facilitation_fee = (float)$event['facilitation_fee'];

    // Get registered and sponsored counts
    $get_attendees = $db->prepare("
        SELECT 
            COUNT(*) AS total_registrations,
            COUNT(CASE WHEN sponsorship = 'sponsored-fully' AND sponsorship IS NOT NULL THEN 1 END) AS total_sponsorship_requests
        FROM event_registration 
        WHERE event_id = :event_id
    ");
    $get_attendees->execute([':event_id' => $event_id]);
    $attendees = $get_attendees->fetch(PDO::FETCH_ASSOC);

    $registered = (int)$attendees['total_registrations'];
    $sponsored = (int)$attendees['total_sponsorship_requests'];

    // Totals
    $total_collection = $registered * $facilitation_fee;
    $sponsored_collection = $sponsored * $facilitation_fee;

    // Payments made
    $get_paid_facilitations = $db->prepare("SELECT SUM(amount) AS total_collected FROM registration_fee WHERE event_id = :event_id");
    $get_paid_facilitations->execute([':event_id' => $event_id]);
    $collections = $get_paid_facilitations->fetch(PDO::FETCH_ASSOC);

    $collected = (float)($collections['total_collected'] ?? 0);
    $pending = $total_collection - $collected;

    // Encode response
    $response = [
        'success' => true,
        'message' => 'Event statistics computed successfully.',
        'event' => [
            'id' => $event_id,
            'name' => $event['ename'] ?? '',
            'facilitation_fee' => $facilitation_fee
        ],
        'stats' => [
            'registered' => $registered,
            'sponsored' => $sponsored,
            'total_collection' => $total_collection,
            'sponsored_collection' => $sponsored_collection,
            'collected' => $collected,
            'pending' => $pending
        ]
    ];

} catch (Exception $e) {
    $response['success'] = false;
    $response['message'] = 'Error: ' . $e->getMessage();
}

// Output JSON
echo json_encode($response, JSON_PRETTY_PRINT);
