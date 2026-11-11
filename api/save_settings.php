<?php
require_once 'config.php';
require_once 'middleware.php';

try {
    global $db;
    $data = getJsonBody();
    
    $db->beginTransaction();

    if (isset($data['organization'])) {
        $org = $data['organization'];
        $stmt = $db->prepare("UPDATE organization_settings SET org_name = ?, head_office = ?, currency = ?, church_type = ?, denomination_name = ?, denomination_desc = ? WHERE id = 1");
        $stmt->execute([
            $org['org_name'] ?? '',
            $org['head_office'] ?? '',
            $org['currency'] ?? 'KES',
            $org['church_type'] ?? 'Interdenominational',
            $org['denomination_name'] ?? '',
            $org['denomination_desc'] ?? ''
        ]);
    }

    if (isset($data['hierarchyLevels']) && is_array($data['hierarchyLevels'])) {
        foreach ($data['hierarchyLevels'] as $level) {
            $stmt = $db->prepare("INSERT INTO hierarchy_levels (level_order, name) VALUES (?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name)");
            $stmt->execute([$level['level_order'], $level['name']]);
        }
        
        $max_order = count($data['hierarchyLevels']);
        $stmt = $db->prepare("DELETE FROM hierarchy_levels WHERE level_order > ?");
        $stmt->execute([$max_order]);
    }

    if (isset($data['ageCategories']) && is_array($data['ageCategories'])) {
        $db->exec("DELETE FROM age_categories");
        foreach ($data['ageCategories'] as $cat) {
            $stmt = $db->prepare("INSERT INTO age_categories (name, min_age, max_age) VALUES (?, ?, ?)");
            $stmt->execute([$cat['name'], $cat['min_age'], $cat['max_age'] ?? null]);
        }
    }

    $db->commit();
    echo json_encode(['success' => true, 'message' => 'Settings saved successfully.']);
} catch (PDOException $e) {
    if (isset($db)) $db->rollBack();
    apiError("Database error: " . $e->getMessage(), 500);
}
?>
