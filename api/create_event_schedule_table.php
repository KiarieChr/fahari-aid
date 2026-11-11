<?php
/**
 * Create event_schedule table migration
 * Run once: GET /api/create_event_schedule_table.php
 */

require_once __DIR__ . '/config.php';

try {
    $db->exec("
        CREATE TABLE IF NOT EXISTS event_schedule (
            id INT AUTO_INCREMENT PRIMARY KEY,
            event_id INT NOT NULL,
            day_number INT NOT NULL DEFAULT 1,
            start_time TIME NOT NULL,
            end_time TIME NOT NULL,
            title VARCHAR(255) NOT NULL,
            description TEXT DEFAULT NULL,
            speaker VARCHAR(255) DEFAULT NULL,
            session_type ENUM('worship','teaching','prayer','break','meal','registration','panel','activity','announcement','other') NOT NULL DEFAULT 'other',
            location VARCHAR(255) DEFAULT NULL,
            sort_order INT NOT NULL DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (event_id) REFERENCES event(id) ON DELETE CASCADE,
            INDEX idx_event_day (event_id, day_number, sort_order)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");

    echo json_encode(['success' => true, 'message' => 'event_schedule table created']);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
