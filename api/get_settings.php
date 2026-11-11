<?php
require_once 'config.php';
require_once 'middleware.php';

try {
    global $db;
    $stmt = $db->query("SELECT * FROM organization_settings WHERE id = 1");
    $org = $stmt->fetch(PDO::FETCH_ASSOC);

    $stmt2 = $db->query("SELECT * FROM hierarchy_levels ORDER BY level_order ASC");
    $levels = $stmt2->fetchAll(PDO::FETCH_ASSOC);

    $stmt3 = $db->query("SELECT * FROM age_categories ORDER BY min_age ASC");
    $ageCategories = $stmt3->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'data' => [
            'organization' => $org,
            'hierarchyLevels' => $levels,
            'ageCategories' => $ageCategories
        ]
    ]);
} catch (PDOException $e) {
    apiError("Database error: " . $e->getMessage(), 500);
}
?>
