<?php
/**
 * Migration: Standardize event types
 * Updates existing events from 'events' to proper type values
 * Sets default for type column to 'general'
 */

require_once __DIR__ . '/../../includes/connection.php';

header('Content-Type: text/plain');

try {
    // Set the column default to 'general'
    $db->exec("ALTER TABLE event MODIFY COLUMN type VARCHAR(50) DEFAULT 'general'");
    echo "OK: Set type column default to 'general'\n";

    // Update existing rows that have type='events' (the old meaningless default)
    // Map based on event name keywords
    $mappings = [
        'training' => ['training', 'leadership'],
        'conference' => ['conference'],
        'prayer' => ['prayer', 'prayers', 'fasting'],
        'concert' => ['concert', 'worship night'],
        'outreach' => ['outreach', 'crusade', 'evangelical'],
    ];

    $updated = 0;
    foreach ($mappings as $type => $keywords) {
        foreach ($keywords as $keyword) {
            $stmt = $db->prepare("UPDATE event SET type = :type WHERE (type = 'events' OR type IS NULL) AND LOWER(ename) LIKE :keyword");
            $stmt->execute([':type' => $type, ':keyword' => '%' . $keyword . '%']);
            $updated += $stmt->rowCount();
        }
    }
    echo "OK: Auto-mapped $updated events by name keywords\n";

    // Set remaining 'events' type to 'general'
    $stmt = $db->exec("UPDATE event SET type = 'general' WHERE type = 'events' OR type IS NULL");
    echo "OK: Set $stmt remaining events to 'general'\n";

    // Show final state
    $rows = $db->query("SELECT id, ename, type FROM event ORDER BY id")->fetchAll(PDO::FETCH_ASSOC);
    echo "\n=== FINAL EVENT TYPES ===\n";
    foreach ($rows as $r) {
        echo "  [{$r['id']}] {$r['ename']} => {$r['type']}\n";
    }

} catch (PDOException $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
