<?php
/**
 * Get Devotional Authors API
 * GET /api/get_devotional_authors.php
 * 
 * Returns list of authors for dropdown
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/middleware.php';

$user = authenticate();

try {
    $stmt = $db->query("SELECT id, name FROM devotional_authors ORDER BY name ASC");
    $authors = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'authors' => $authors
    ]);

} catch (PDOException $e) {
    error_log("Get devotional authors error: " . $e->getMessage());
    apiError('Failed to retrieve authors', 500);
}
