<?php
// manage/get_chart_of_accounts.php
ob_start();
require_once('../includes/checklogin.php');
ob_clean();
header('Content-Type: application/json; charset=utf-8');

try {
    $type = $_GET['type'] ?? 'all';

    $sql = "SELECT a.id, a.account_code, a.account_name, a.account_type, a.parent_id, 
                   a.fund_id, a.is_active, a.description, a.normal_balance,
                   p.account_code AS parent_code, p.account_name AS parent_name,
                   f.name AS fund_name
            FROM account a
            LEFT JOIN account p ON p.id = a.parent_id
            LEFT JOIN fund f ON f.id = a.fund_id
            WHERE 1=1";

    $params = [];
    if ($type !== 'all') {
        $sql .= " AND a.account_type = :type";
        $params[':type'] = $type;
    }

    $sql .= " ORDER BY a.account_code ASC";

    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $accounts = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Cast numeric fields
    foreach ($accounts as &$a) {
        $a['id'] = (int)$a['id'];
        $a['is_active'] = (bool)$a['is_active'];
        $a['parent_id'] = $a['parent_id'] ? (int)$a['parent_id'] : null;
        $a['fund_id'] = $a['fund_id'] ? (int)$a['fund_id'] : null;
    }

    // Summary counts
    $countStmt = $db->query("SELECT account_type, COUNT(*) as cnt FROM account GROUP BY account_type ORDER BY account_type");
    $summary = [];
    while ($row = $countStmt->fetch(PDO::FETCH_ASSOC)) {
        $summary[$row['account_type']] = (int)$row['cnt'];
    }

    echo json_encode([
        'success' => true,
        'data' => [
            'accounts' => $accounts,
            'summary' => $summary,
            'total' => count($accounts)
        ],
        'message' => 'Chart of accounts retrieved'
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage()
    ]);
}
?>
