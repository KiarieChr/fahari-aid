<?php
ob_start();
require_once('../includes/checklogin.php');
ob_clean();
header('Content-Type: application/json; charset=utf-8');

try {
    // Add journal_entry_id column to collections table if it doesn't exist
    $db->exec("ALTER TABLE collections ADD COLUMN IF NOT EXISTS journal_entry_id INT(11) NULL DEFAULT NULL AFTER amount");

    echo json_encode(['success' => true, 'message' => 'Column journal_entry_id added (or already existed) in collections table.']);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
