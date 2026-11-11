<?php
/**
 * Run the accounting system migration via PHP/PDO
 */
require __DIR__ . '/../includes/connection.php';

$sql = file_get_contents(__DIR__ . '/migrations/003_accounting_system.sql');

// Split by semicolons but respect multi-line statements
$statements = array_filter(array_map('trim', preg_split('/;\s*$/m', $sql)));

$success = 0;
$failed = 0;
$errors = [];

foreach ($statements as $stmt) {
    // Skip empty or comment-only statements
    $clean = trim(preg_replace('/--[^\n]*/', '', $stmt));
    $clean = trim(preg_replace('/\/\*.*?\*\//s', '', $clean));
    if (empty($clean)) continue;

    try {
        $db->exec($stmt);
        $success++;
        // Show what we did
        $firstLine = strtok($stmt, "\n");
        echo "OK: " . substr($firstLine, 0, 80) . "\n";
    } catch (PDOException $e) {
        $failed++;
        $firstLine = strtok($stmt, "\n");
        $errors[] = substr($firstLine, 0, 80) . " => " . $e->getMessage();
        echo "FAIL: " . substr($firstLine, 0, 80) . "\n  => " . $e->getMessage() . "\n";
    }
}

echo "\n=== MIGRATION SUMMARY ===\n";
echo "Success: $success\n";
echo "Failed: $failed\n";

if ($failed > 0) {
    echo "\nErrors:\n";
    foreach ($errors as $e) echo "  - $e\n";
}

// Verify
echo "\n=== VERIFICATION ===\n";
try {
    $count = $db->query("SELECT COUNT(*) FROM account")->fetchColumn();
    echo "Accounts in chart: $count\n";
} catch (Exception $e) {
    echo "account table: " . $e->getMessage() . "\n";
}

try {
    $count = $db->query("SELECT COUNT(*) FROM journal_entry")->fetchColumn();
    echo "Journal entries: $count\n";
} catch (Exception $e) {
    echo "journal_entry table: " . $e->getMessage() . "\n";
}

try {
    $count = $db->query("SELECT COUNT(*) FROM accounting_period")->fetchColumn();
    echo "Accounting periods: $count\n";
} catch (Exception $e) {
    echo "accounting_period table: " . $e->getMessage() . "\n";
}

try {
    $count = $db->query("SELECT COUNT(*) FROM audit_log")->fetchColumn();
    echo "Audit log entries: $count\n";
} catch (Exception $e) {
    echo "audit_log table: " . $e->getMessage() . "\n";
}

try {
    $count = $db->query("SELECT COUNT(*) FROM payment_account_map")->fetchColumn();
    echo "Payment-account mappings: $count\n";
} catch (Exception $e) {
    echo "payment_account_map table: " . $e->getMessage() . "\n";
}
