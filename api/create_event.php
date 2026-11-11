<?php
/**
 * Create Event API
 * POST /api/create_event.php
 * 
 * Body: { name, type, start_date, start_time, end_date, end_time, venue, description, target_attendees, facilitation_fee }
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/middleware.php';

$user = authenticate();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    apiError('Method not allowed', 405);
}

$body = getJsonBody();

// Validate required fields
$name = trim($body['name'] ?? '');
$type = trim($body['type'] ?? 'general');
$startDate = trim($body['start_date'] ?? '');
$startTime = trim($body['start_time'] ?? '');
$endDate = trim($body['end_date'] ?? '');
$endTime = trim($body['end_time'] ?? '');
$venue = trim($body['venue'] ?? '');
$description = trim($body['description'] ?? '');
$targetAttendees = (int)($body['target_attendees'] ?? 0);
$facilitationFee = (float)($body['facilitation_fee'] ?? 0);
$status = trim($body['status'] ?? 'published');

if ($name === '') {
    apiError('Event name is required');
}
if ($startDate === '') {
    apiError('Start date is required');
}
if ($endDate === '') {
    apiError('End date is required');
}

// Validate type against allowed values
$allowedTypes = ['conference', 'service', 'concert', 'workshop', 'outreach', 'prayer', 'training', 'general'];
if (!in_array($type, $allowedTypes)) {
    $type = 'general';
}

// Combine date and time for start_date datetime column
$startDateTime = $startDate . ($startTime ? ' ' . $startTime : ' 00:00:00');
$endDateTime = $endDate . ($endTime ? ' ' . $endTime : ' 23:59:59');

try {
    $stmt = $db->prepare("
        INSERT INTO event (ename, type, start_date, start_time, end_date, branch, notes, target_attendees, facilitation_fee, status)
        VALUES (:ename, :type, :start_date, :start_time, :end_date, :branch, :notes, :target_attendees, :facilitation_fee, :status)
    ");
    
    $stmt->execute([
        ':ename' => $name,
        ':type' => $type,
        ':start_date' => $startDateTime,
        ':start_time' => $startTime ?: null,
        ':end_date' => $endDateTime,
        ':branch' => $venue,
        ':notes' => $description,
        ':target_attendees' => $targetAttendees,
        ':facilitation_fee' => $facilitationFee,
        ':status' => $status
    ]);

    $eventId = $db->lastInsertId();

    apiSuccess([
        'event_id' => (int)$eventId,
        'name' => $name,
        'type' => $type
    ], 'Event created successfully', 201);

    // Audit log
    try {
        if (function_exists('logAudit')) {
            logAudit($db, $user['id'], 'created_event', 'event', $eventId);
        } else {
            $auditStmt = $db->prepare("INSERT INTO audit_log (user_id, action, table_name, record_id, created_at) VALUES (?, 'created_event', 'event', ?, NOW())");
            $auditStmt->execute([$user['id'], $eventId]);
        }
    } catch (Exception $e) {
        // Ignore audit log error
    }

} catch (PDOException $e) {
    error_log("Create event error: " . $e->getMessage());
    apiError('Failed to create event', 500);
}
