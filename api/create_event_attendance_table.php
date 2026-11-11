<?php
/**
 * Create event_attendance table
 * Run once to set up the table
 */

require_once __DIR__ . '/config.php';

try {
    $db->exec("
        CREATE TABLE IF NOT EXISTS event_attendance (
            id INT AUTO_INCREMENT PRIMARY KEY,
            event_id INT NOT NULL,
            registration_id INT NOT NULL,
            check_in_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            check_in_method ENUM('manual', 'qr') NOT NULL DEFAULT 'manual',
            checked_in_by INT DEFAULT NULL,
            notes VARCHAR(255) DEFAULT NULL,
            FOREIGN KEY (event_id) REFERENCES event(id) ON DELETE CASCADE,
            FOREIGN KEY (registration_id) REFERENCES event_registration(id) ON DELETE CASCADE,
            UNIQUE KEY unique_attendance (event_id, registration_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");
    
    // Add qr_token column to event_registration for QR codes
    try {
        $db->exec("ALTER TABLE event_registration ADD COLUMN qr_token VARCHAR(64) DEFAULT NULL AFTER sponsorship");
        echo "Added qr_token column to event_registration\n";
    } catch (PDOException $e) {
        if (strpos($e->getMessage(), 'Duplicate column') !== false) {
            echo "qr_token column already exists\n";
        } else {
            throw $e;
        }
    }
    
    // Generate qr_tokens for existing registrations that don't have one
    $stmt = $db->query("SELECT id FROM event_registration WHERE qr_token IS NULL OR qr_token = ''");
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $count = 0;
    foreach ($rows as $row) {
        $token = bin2hex(random_bytes(16));
        $update = $db->prepare("UPDATE event_registration SET qr_token = :token WHERE id = :id");
        $update->execute([':token' => $token, ':id' => $row['id']]);
        $count++;
    }
    
    echo "event_attendance table created successfully\n";
    echo "Generated QR tokens for $count existing registrations\n";
    
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
