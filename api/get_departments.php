<?php
/**
 * Get Departments API
 * GET /api/get_departments.php
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/middleware.php';

$user = authenticate();

try {
    // Fetch departments
    $sql = "SELECT id, name FROM departments ORDER BY name ASC";
    $stmt = $db->prepare($sql);
    $stmt->execute();
    $departments = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'data' => $departments
    ]);

} catch (PDOException $e) {
    error_log("Get departments error: " . $e->getMessage());
    // Return empty array if table doesn't exist
    echo json_encode([
        'success' => true,
        'data' => []
    ]);
}
