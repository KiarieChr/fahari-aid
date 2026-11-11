<?php
/**
 * Create Meeting Type API
 * POST /api/create_meeting_type.php
 * 
 * Body: { name }
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/middleware.php';

$user = authenticate();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    apiError('Method not allowed', 405);
}

$data = getJsonBody();
$name = trim($data['name'] ?? '');

if (empty($name)) {
    apiError('Meeting type name is required');
}

try {
    // Check for duplicate
    $check = $db->prepare("SELECT id FROM meeting_types WHERE name = :name");
    $check->execute([':name' => $name]);
    if ($check->fetch()) {
        apiError('A meeting type with this name already exists');
    }

    $stmt = $db->prepare("INSERT INTO meeting_types (name) VALUES (:name)");
    $stmt->execute([':name' => $name]);
    
    $id = (int)$db->lastInsertId();

    apiSuccess(['id' => $id, 'name' => $name], 'Meeting type created successfully');

} catch (PDOException $e) {
    error_log("Create meeting type error: " . $e->getMessage());
    apiError('Failed to create meeting type', 500);
}
