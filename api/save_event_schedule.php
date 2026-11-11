<?php
/**
 * Save Event Schedule API (Add / Update / Delete sessions)
 * POST /api/save_event_schedule.php
 * 
 * Add: { "event_id": 1, "day_number": 1, "start_time": "09:00", "end_time": "10:00", "title": "...", ... }
 * Update: { "id": 5, "event_id": 1, ... }
 * Delete: { "action": "delete", "id": 5 }
 * Bulk: { "action": "bulk_save", "event_id": 1, "sessions": [...] }
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/middleware.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    apiError('Method not allowed', 405);
}

$user = authenticate();
$body = getJsonBody();

$action = $body['action'] ?? 'save';

try {
    // ─── DELETE ───
    if ($action === 'delete') {
        $id = (int)($body['id'] ?? 0);
        if ($id <= 0) apiError('Session ID required', 400);

        $stmt = $db->prepare("DELETE FROM event_schedule WHERE id = :id");
        $stmt->execute([':id' => $id]);

        apiSuccess(['deleted' => $stmt->rowCount() > 0], 'Session deleted');
    }

    // ─── BULK SAVE ───
    if ($action === 'bulk_save') {
        $eventId = (int)($body['event_id'] ?? 0);
        $sessions = $body['sessions'] ?? [];
        if ($eventId <= 0) apiError('Event ID required', 400);

        // Delete existing and re-insert
        $db->beginTransaction();
        $db->prepare("DELETE FROM event_schedule WHERE event_id = :eid")->execute([':eid' => $eventId]);

        $insertStmt = $db->prepare("
            INSERT INTO event_schedule (event_id, day_number, start_time, end_time, title, description, speaker, session_type, location, sort_order)
            VALUES (:event_id, :day, :start, :end, :title, :desc, :speaker, :type, :location, :sort)
        ");

        $count = 0;
        foreach ($sessions as $idx => $s) {
            if (empty($s['title']) || empty($s['start_time']) || empty($s['end_time'])) continue;
            $insertStmt->execute([
                ':event_id' => $eventId,
                ':day' => (int)($s['day_number'] ?? 1),
                ':start' => $s['start_time'],
                ':end' => $s['end_time'],
                ':title' => trim($s['title']),
                ':desc' => trim($s['description'] ?? ''),
                ':speaker' => trim($s['speaker'] ?? ''),
                ':type' => $s['session_type'] ?? 'other',
                ':location' => trim($s['location'] ?? ''),
                ':sort' => $s['sort_order'] ?? $idx
            ]);
            $count++;
        }

        $db->commit();
        apiSuccess(['saved' => $count], "Saved {$count} sessions");
    }

    // ─── SINGLE SAVE (add/update) ───
    $eventId = (int)($body['event_id'] ?? 0);
    $id = (int)($body['id'] ?? 0);

    if ($eventId <= 0) apiError('Event ID is required', 400);

    $required = ['day_number', 'start_time', 'end_time', 'title'];
    foreach ($required as $f) {
        if (empty($body[$f])) apiError("Field '{$f}' is required", 400);
    }

    $fields = [
        ':event_id' => $eventId,
        ':day' => (int)$body['day_number'],
        ':start' => $body['start_time'],
        ':end' => $body['end_time'],
        ':title' => trim($body['title']),
        ':desc' => trim($body['description'] ?? ''),
        ':speaker' => trim($body['speaker'] ?? ''),
        ':type' => $body['session_type'] ?? 'other',
        ':location' => trim($body['location'] ?? ''),
        ':sort' => (int)($body['sort_order'] ?? 0)
    ];

    if ($id > 0) {
        // Update
        $stmt = $db->prepare("
            UPDATE event_schedule SET
                event_id = :event_id, day_number = :day, start_time = :start, end_time = :end,
                title = :title, description = :desc, speaker = :speaker,
                session_type = :type, location = :location, sort_order = :sort
            WHERE id = :id
        ");
        $fields[':id'] = $id;
        $stmt->execute($fields);
        apiSuccess(['id' => $id], 'Session updated');
    } else {
        // Insert
        $stmt = $db->prepare("
            INSERT INTO event_schedule (event_id, day_number, start_time, end_time, title, description, speaker, session_type, location, sort_order)
            VALUES (:event_id, :day, :start, :end, :title, :desc, :speaker, :type, :location, :sort)
        ");
        $stmt->execute($fields);
        apiSuccess(['id' => (int)$db->lastInsertId()], 'Session added');
    }

} catch (PDOException $e) {
    if ($db->inTransaction()) $db->rollBack();
    error_log("Save event schedule error: " . $e->getMessage());
    apiError('Failed to save schedule', 500);
}
