<?php
require_once __DIR__ . '/includes/connection.php';

$sqlFile = __DIR__ . '/db/migrations/004_cells_followups.sql';
$sql = file_get_contents($sqlFile);

// Split by semicolons, filter empty
$statements = array_filter(array_map('trim', explode(';', $sql)), function($s) {
    // Remove comments and whitespace-only
    $s = preg_replace('/--.*$/m', '', $s);
    return !empty(trim($s));
});

foreach ($statements as $stmt) {
    $clean = preg_replace('/--.*$/m', '', $stmt);
    $clean = trim($clean);
    if (empty($clean)) continue;
    
    try {
        $db->exec($clean);
        // Show first 80 chars of statement
        echo "OK: " . substr(preg_replace('/\s+/', ' ', $clean), 0, 80) . "..." . PHP_EOL;
    } catch (PDOException $e) {
        echo "SKIP: " . $e->getMessage() . PHP_EOL;
    }
}

echo PHP_EOL . "=== UPDATED CELLS TABLE ===" . PHP_EOL;
$stmt = $db->query('DESCRIBE cells');
while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    echo $row['Field'] . ' - ' . $row['Type'] . PHP_EOL;
}

echo PHP_EOL . "=== FOLLOWUPS TABLE ===" . PHP_EOL;
$stmt = $db->query('DESCRIBE followups');
while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    echo $row['Field'] . ' - ' . $row['Type'] . PHP_EOL;
}

echo PHP_EOL . "=== CELL_ATTENDANCE TABLE ===" . PHP_EOL;
$stmt = $db->query('DESCRIBE cell_attendance');
while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    echo $row['Field'] . ' - ' . $row['Type'] . PHP_EOL;
}
