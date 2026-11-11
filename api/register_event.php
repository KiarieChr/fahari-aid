<?php
/**
 * Event Registration API
 * POST /api/register_event.php
 * 
 * Public API endpoint for event registration
 */

require_once __DIR__ . '/config.php';

// Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    apiError('Method not allowed', 405);
}

try {
    $data = getJsonBody();
    
    // Validate required fields
    $required = ['names', 'phone_no', 'email', 'residence', 'gender', 'event_id'];
    foreach ($required as $field) {
        if (empty($data[$field])) {
            apiError("Field '$field' is required", 400);
        }
    }
    
    $names = trim($data['names']);
    $phone_no = trim($data['phone_no']);
    $email = trim($data['email']);
    $residence = trim($data['residence']);
    $gender = trim($data['gender']);
    $event_id = (int)$data['event_id'];
    $area_travel_from = trim($data['area_travel_from'] ?? '');
    $guardian_telno = trim($data['guardian_telno'] ?? '');
    $attendees = trim($data['attendees'] ?? '');
    $sponsorship = trim($data['sponsorship'] ?? 'no-sponsor');
    $category = trim($data['category'] ?? '');
    $specialNeeds = trim($data['special_needs'] ?? '');
    $serve = !empty($data['serve']) ? 1 : 0;
    $prayer = trim($data['prayer'] ?? '');
    
    // Validate email format
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        apiError('Invalid email format', 400);
    }
    
    // Check if event exists
    $eventStmt = $db->prepare("SELECT id, ename, start_date FROM event WHERE id = :event_id");
    $eventStmt->execute([':event_id' => $event_id]);
    $event = $eventStmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$event) {
        apiError('Event not found', 404);
    }
    
    // Check if already registered
    $checkStmt = $db->prepare("
        SELECT id FROM event_registration 
        WHERE email = :email AND event_id = :event_id 
        LIMIT 1
    ");
    $checkStmt->execute([':email' => $email, ':event_id' => $event_id]);
    
    if ($checkStmt->fetch()) {
        apiError('You have already registered for this event', 409);
    }
    
    // Generate unique QR token for this registration
    $qr_token = bin2hex(random_bytes(16));
    
    // Insert registration
    $insertStmt = $db->prepare("
        INSERT INTO event_registration 
        (names, gender, email, phone_no, residence, event_id, travelling_from, serve, special_needs, category, prayer, attendees, guardian_telno, sponsorship, qr_token) 
        VALUES 
        (:names, :gender, :email, :phone_no, :residence, :event_id, :travelling_from, :serve, :special_needs, :category, :prayer, :attendees, :guardian_telno, :sponsorship, :qr_token)
    ");
    
    $insertStmt->execute([
        ':names' => $names,
        ':gender' => $gender,
        ':email' => $email,
        ':phone_no' => $phone_no,
        ':residence' => $residence,
        ':event_id' => $event_id,
        ':travelling_from' => $area_travel_from,
        ':serve' => $serve,
        ':special_needs' => $specialNeeds,
        ':category' => $category,
        ':prayer' => $prayer,
        ':attendees' => $attendees,
        ':guardian_telno' => $guardian_telno,
        ':sponsorship' => $sponsorship,
        ':qr_token' => $qr_token,
    ]);
    
    $registrationId = $db->lastInsertId();
    
    apiSuccess([
        'registration_id' => $registrationId,
        'event' => [
            'id' => $event['id'],
            'name' => $event['ename'],
            'date' => $event['start_date']
        ],
        'attendee' => [
            'name' => $names,
            'email' => $email
        ]
    ], 'Registration successful! We look forward to seeing you at the event.');
    
} catch (PDOException $e) {
    error_log("Registration API error: " . $e->getMessage());
    apiError('Registration failed. Please try again.', 500);
}
