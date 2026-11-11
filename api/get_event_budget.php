<?php
/**
 * Get Event Budget API
 * GET /api/get_event_budget.php?event_id=X[&version=N]
 * 
 * Returns budget with items, receipts, and audit trail.
 * If no version specified, returns the latest version.
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/middleware.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    apiError('Method not allowed', 405);
}

$user = authenticate();

$eventId = (int)($_GET['event_id'] ?? 0);
if ($eventId <= 0) {
    apiError('Event ID is required', 400);
}

$version = isset($_GET['version']) ? (int)$_GET['version'] : null;

try {
    // Get event details
    $stmt = $db->prepare("SELECT id, ename, start_date, end_date FROM event WHERE id = :id");
    $stmt->execute([':id' => $eventId]);
    $event = $stmt->fetch();
    if (!$event) {
        apiError('Event not found', 404);
    }

    // Get budget — specific version or latest
    if ($version) {
        $stmt = $db->prepare("
            SELECT eb.*, CONCAT(m1.first_name, ' ', COALESCE(m1.last_name, '')) AS created_by_name, CONCAT(m2.first_name, ' ', COALESCE(m2.last_name, '')) AS approved_by_name
            FROM event_budget eb
            LEFT JOIN users u ON u.id = eb.created_by
            LEFT JOIN member m1 ON m1.id = u.member_id
            LEFT JOIN users a ON a.id = eb.approved_by
            LEFT JOIN member m2 ON m2.id = a.member_id
            WHERE eb.event_id = :event_id AND eb.version = :version
            LIMIT 1
        ");
        $stmt->execute([':event_id' => $eventId, ':version' => $version]);
    } else {
        $stmt = $db->prepare("
            SELECT eb.*, CONCAT(m1.first_name, ' ', COALESCE(m1.last_name, '')) AS created_by_name, CONCAT(m2.first_name, ' ', COALESCE(m2.last_name, '')) AS approved_by_name
            FROM event_budget eb
            LEFT JOIN users u ON u.id = eb.created_by
            LEFT JOIN member m1 ON m1.id = u.member_id
            LEFT JOIN users a ON a.id = eb.approved_by
            LEFT JOIN member m2 ON m2.id = a.member_id
            WHERE eb.event_id = :event_id
            ORDER BY eb.version DESC
            LIMIT 1
        ");
        $stmt->execute([':event_id' => $eventId]);
    }
    $budget = $stmt->fetch();

    if (!$budget) {
        // Return empty state
        apiSuccess([
            'event' => $event,
            'budget' => null,
            'versions' => [],
            'items' => [],
            'audit' => [],
            'category_summary' => [],
            'gl_accounts' => getGlSubAccounts($db)
        ]);
        return;
    }

    // Get all versions for the dropdown
    $stmt = $db->prepare("
        SELECT id, version, status, budget_name, total_estimated, total_actual, created_at
        FROM event_budget WHERE event_id = :event_id ORDER BY version DESC
    ");
    $stmt->execute([':event_id' => $eventId]);
    $versions = $stmt->fetchAll();

    // Get items with receipts
    $stmt = $db->prepare("
        SELECT ebi.*, acc.account_code, acc.account_name
        FROM event_budget_item ebi
        LEFT JOIN account acc ON acc.id = ebi.gl_account_id
        WHERE ebi.event_budget_id = :budget_id
        ORDER BY ebi.category ASC, ebi.id ASC
    ");
    $stmt->execute([':budget_id' => $budget['id']]);
    $items = $stmt->fetchAll();

    // Get receipts for each item
    $itemIds = array_column($items, 'id');
    $receipts = [];
    if (!empty($itemIds)) {
        $placeholders = implode(',', array_fill(0, count($itemIds), '?'));
        $stmt = $db->prepare("
            SELECT ebr.*, CONCAT(m.first_name, ' ', COALESCE(m.last_name, '')) AS uploaded_by_name
            FROM event_budget_receipt ebr
            LEFT JOIN users u ON u.id = ebr.uploaded_by
            LEFT JOIN member m ON m.id = u.member_id
            WHERE ebr.budget_item_id IN ($placeholders)
            ORDER BY ebr.uploaded_at DESC
        ");
        $stmt->execute($itemIds);
        $receiptRows = $stmt->fetchAll();
        foreach ($receiptRows as $r) {
            $receipts[$r['budget_item_id']][] = $r;
        }
    }

    // Attach receipts to items
    foreach ($items as &$item) {
        $item['receipts'] = $receipts[$item['id']] ?? [];
    }
    unset($item);

    // Category summary
    $categorySummary = [];
    foreach ($items as $item) {
        $cat = $item['category'];
        if (!isset($categorySummary[$cat])) {
            $categorySummary[$cat] = ['category' => $cat, 'estimated' => 0, 'actual' => 0, 'count' => 0, 'paid' => 0];
        }
        $categorySummary[$cat]['estimated'] += (float)$item['estimated_amount'];
        $categorySummary[$cat]['actual'] += (float)($item['actual_amount'] ?? 0);
        $categorySummary[$cat]['count']++;
        if ($item['status'] === 'paid') $categorySummary[$cat]['paid']++;
    }

    // Audit trail
    $stmt = $db->prepare("
        SELECT eba.*, CONCAT(m.first_name, ' ', COALESCE(m.last_name, '')) AS performed_by_name
        FROM event_budget_audit eba
        LEFT JOIN users u ON u.id = eba.performed_by
        LEFT JOIN member m ON m.id = u.member_id
        WHERE eba.event_budget_id = :budget_id
        ORDER BY eba.performed_at DESC
        LIMIT 50
    ");
    $stmt->execute([':budget_id' => $budget['id']]);
    $audit = $stmt->fetchAll();

    apiSuccess([
        'event' => $event,
        'budget' => $budget,
        'versions' => $versions,
        'items' => $items,
        'category_summary' => array_values($categorySummary),
        'audit' => $audit,
        'gl_accounts' => getGlSubAccounts($db)
    ]);

} catch (PDOException $e) {
    error_log("Get event budget error: " . $e->getMessage());
    apiError('Failed to retrieve budget', 500);
}

function getGlSubAccounts(PDO $db): array {
    $stmt = $db->query("
        SELECT id, account_code, account_name, description
        FROM account
        WHERE parent_id = (SELECT id FROM account WHERE account_code = '5030')
          AND is_active = 1
        ORDER BY account_code
    ");
    return $stmt->fetchAll();
}
