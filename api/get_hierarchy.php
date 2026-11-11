<?php
/**
 * Get Hierarchy API
 * GET /api/get_hierarchy.php
 */
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/middleware.php';

$user = authenticate();

try {
    // 1. Fetch Hierarchy Levels
    $stmt1 = $db->query("SELECT * FROM hierarchy_levels ORDER BY level_order ASC");
    $levels = $stmt1->fetchAll(PDO::FETCH_ASSOC);

    // 2. Fetch Hierarchy Nodes
    $stmt2 = $db->query("SELECT * FROM hierarchy_nodes ORDER BY id ASC");
    $nodes = $stmt2->fetchAll(PDO::FETCH_ASSOC);

    // 3. Build Tree
    function buildTree(array &$elements, $parentId = null) {
        $branch = array();
        foreach ($elements as &$element) {
            if ($element['parent_id'] == $parentId) {
                $children = buildTree($elements, $element['id']);
                if ($children) {
                    $element['children'] = $children;
                }
                $branch[] = $element;
            }
        }
        return $branch;
    }

    $tree = buildTree($nodes);

    echo json_encode([
        'success' => true,
        'data' => [
            'levels' => $levels,
            'nodes' => $nodes,
            'tree' => $tree
        ]
    ]);

} catch (PDOException $e) {
    error_log("Get hierarchy error: " . $e->getMessage());
    apiError('Failed to retrieve hierarchy data', 500);
}
