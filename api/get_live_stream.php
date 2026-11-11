<?php
/**
 * Get Live Stream API
 * GET /api/get_live_stream.php
 * 
 * Returns the currently active live stream, if any
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/middleware.php';

$user = authenticate();

try {
    $stream = null;

    try {
        $stmt = $db->query("
            SELECT title, stream_url
            FROM live_streams
            WHERE is_active = 1 
            AND (end_time IS NULL OR end_time > NOW())
            ORDER BY created_at DESC
            LIMIT 1
        ");
        $stream = $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    } catch (PDOException $e) {
        // live_streams table doesn't exist yet
        $stream = null;
    }

    echo json_encode([
        'success' => true,
        'stream' => $stream
    ]);

} catch (PDOException $e) {
    error_log("Live stream error: " . $e->getMessage());
    apiError('Failed to retrieve live stream', 500);
}
