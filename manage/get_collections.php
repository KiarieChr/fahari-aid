<?php
// manage/get_collections.php
ob_start();
require_once('../includes/checklogin.php');
ob_clean();
header('Content-Type: application/json; charset=utf-8');

try {
    // Find current active accounting period to set default dates (current financial year)
    $activePeriodStmt = $db->query("SELECT start_date, end_date FROM accounting_period WHERE is_closed = 0 ORDER BY start_date DESC LIMIT 1");
    $activePeriod = $activePeriodStmt->fetch(PDO::FETCH_ASSOC);
    $defaultStart = $activePeriod ? $activePeriod['start_date'] : date('Y-01-01');
    $defaultEnd = $activePeriod ? $activePeriod['end_date'] : date('Y-12-31');

    $startDate = !empty($_GET['start_date']) ? $_GET['start_date'] : $defaultStart;
    $endDate = !empty($_GET['end_date']) ? $_GET['end_date'] : $defaultEnd;

    // Use a subquery/union structure to select collections and non-duplicated pledge redemptions
    $sql = "
        SELECT 
            c.id, 
            c.payee, 
            c.payment_mode, 
            c.amount, 
            c.recorded_on, 
            c.payment_for,
            c.transaction_id,
            c.description,
            c.journal_entry_id,
            IF(c.journal_entry_id IS NOT NULL, 1, 0) AS is_posted,
            'collection' AS source_type
        FROM collections c
        WHERE 1=1
    ";

    $params = [];

    if ($startDate) {
        $sql .= " AND DATE(c.recorded_on) >= :start_date";
        $params[':start_date'] = $startDate;
    }
    if ($endDate) {
        $sql .= " AND DATE(c.recorded_on) <= :end_date";
        $params[':end_date'] = $endDate;
    }

    $sql .= " UNION ALL ";

    $sql .= "
        SELECT 
            CONCAT('PR-', pr.id) AS id, 
            p.full_name AS payee, 
            'MPESA' AS payment_mode, 
            pr.redeemed_amount AS amount, 
            pr.recorded_on, 
            'Pledge Redemption' AS payment_for, 
            pr.mpesa_code AS transaction_id,
            CONCAT('Redemption of commitment by ', p.full_name) AS description,
            pr.journal_entry_id,
            IF(pr.journal_entry_id IS NOT NULL, 1, 0) AS is_posted,
            'pledge_redeem' AS source_type
        FROM pledges_redeem pr
        JOIN pledges p ON pr.pledge_id = p.id
        LEFT JOIN collections c ON c.collection_type = 'pledges' AND c.doc_reference = pr.id
        WHERE c.id IS NULL
    ";

    if ($startDate) {
        $sql .= " AND DATE(pr.recorded_on) >= :start_date2";
        $params[':start_date2'] = $startDate;
    }
    if ($endDate) {
        $sql .= " AND DATE(pr.recorded_on) <= :end_date2";
        $params[':end_date2'] = $endDate;
    }

    $sql .= " ORDER BY recorded_on DESC";

    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $collections = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Format fields
    foreach ($collections as &$col) {
        $col['amount'] = (float)$col['amount'];
    }

    // Calculate Dashboard Stats (Aggregated)
    // 1. Today's Collections
    $stmtToday = $db->query("
        SELECT COALESCE(SUM(amount), 0) FROM (
            SELECT amount FROM collections WHERE DATE(recorded_on) = CURDATE()
            UNION ALL
            SELECT pr.redeemed_amount AS amount FROM pledges_redeem pr
            LEFT JOIN collections c ON c.collection_type = 'pledges' AND c.doc_reference = pr.id
            WHERE c.id IS NULL AND DATE(pr.recorded_on) = CURDATE()
        ) t
    ");
    $totalToday = (float)$stmtToday->fetchColumn();

    // 2. This Month's Collections
    $stmtMonth = $db->query("
        SELECT COALESCE(SUM(amount), 0) FROM (
            SELECT amount FROM collections WHERE YEAR(recorded_on) = YEAR(CURDATE()) AND MONTH(recorded_on) = MONTH(CURDATE())
            UNION ALL
            SELECT pr.redeemed_amount AS amount FROM pledges_redeem pr
            LEFT JOIN collections c ON c.collection_type = 'pledges' AND c.doc_reference = pr.id
            WHERE c.id IS NULL AND YEAR(pr.recorded_on) = YEAR(CURDATE()) AND MONTH(pr.recorded_on) = MONTH(CURDATE())
        ) t
    ");
    $totalMonth = (float)$stmtMonth->fetchColumn();

    // 3. Total Pledge Redemptions
    $stmtPledges = $db->query("
        SELECT COALESCE(SUM(amount), 0) FROM (
            SELECT amount FROM collections WHERE collection_type = 'pledges' OR payment_for = 'Pledge Redemption'
            UNION ALL
            SELECT pr.redeemed_amount AS amount FROM pledges_redeem pr
            LEFT JOIN collections c ON c.collection_type = 'pledges' AND c.doc_reference = pr.id
            WHERE c.id IS NULL
        ) t
    ");
    $totalPledges = (float)$stmtPledges->fetchColumn();

    // 4. Total Count
    $stmtCount = $db->query("
        SELECT COUNT(*) FROM (
            SELECT id FROM collections
            UNION ALL
            SELECT pr.id FROM pledges_redeem pr
            LEFT JOIN collections c ON c.collection_type = 'pledges' AND c.doc_reference = pr.id
            WHERE c.id IS NULL
        ) t
    ");
    $totalCount = (int)$stmtCount->fetchColumn();

    echo json_encode([
        'success' => true,
        'data' => [
            'collections' => $collections,
            'start_date' => $startDate,
            'end_date' => $endDate,
            'stats' => [
                'today' => $totalToday,
                'month' => $totalMonth,
                'pledges' => $totalPledges,
                'count' => $totalCount
            ]
        ],
        'message' => 'Collections and stats retrieved successfully'
    ]);

} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage()
    ]);
}
?>
