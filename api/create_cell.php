<?php
/**
 * Create Cell API
 * POST /api/create_cell.php
 * 
 * Body: { cellName, category, leader (member_id), day, time, location, capacity }
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/middleware.php';

$user = authenticate();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    apiError('Method not allowed', 405);
}

$body = getJsonBody();

$leader = (int)($body['leader'] ?? 0);
$cellName = trim($body['cellName'] ?? '');
$category = trim($body['category'] ?? 'General');
$day = trim($body['day'] ?? '');
$time = trim($body['time'] ?? '');
$location = trim($body['location'] ?? '');
$capacity = max(1, (int)($body['capacity'] ?? 15));

if (!$leader) {
    apiError('Cell leader is required');
}

try {
    $db->beginTransaction();

    // Generate unique cell code (JEN-001 pattern)
    $stmtt = $db->query("SELECT code FROM cells ORDER BY id DESC LIMIT 1");
    $last_code = $stmtt->fetchColumn();

    if ($last_code === false) {
        $code = "JEN-001";
    } else {
        $split = explode('-', $last_code);
        $no = (int)($split[1] ?? 0);
        $code = "JEN-" . str_pad($no + 1, 3, '0', STR_PAD_LEFT);
    }

    // Insert cell
    $stmt = $db->prepare("
        INSERT INTO cells (code, name, category, meeting_day, meeting_time, location, capacity, cell_leader)
        VALUES (:code, :name, :category, :day, :time, :location, :capacity, :leader)
    ");
    $stmt->execute([
        ':code' => $code,
        ':name' => $cellName ?: $code,
        ':category' => $category,
        ':day' => $day,
        ':time' => $time ?: null,
        ':location' => $location,
        ':capacity' => $capacity,
        ':leader' => $leader,
    ]);

    $cellId = (int)$db->lastInsertId();

    // Assign leader to the cell
    $stmt = $db->prepare("UPDATE member SET cell_id = :cell_id WHERE id = :member_id");
    $stmt->execute([':cell_id' => $cellId, ':member_id' => $leader]);

    $db->commit();

    apiSuccess([
        'id' => $cellId,
        'code' => $code,
        'name' => $cellName ?: $code
    ], 'Cell created successfully', 201);

} catch (PDOException $e) {
    $db->rollBack();
    error_log("Create cell error: " . $e->getMessage());
    apiError('Failed to create cell', 500);
}
