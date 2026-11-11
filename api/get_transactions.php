<?php
/**
 * Get Transactions (unified income + expenses + contributions)
 * GET /api/get_transactions.php?type=all|income|expense|contribution&page=1&limit=20&search=
 */
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/middleware.php';

$user = authenticate();

try {
    $type = $_GET['type'] ?? 'all';
    $page = max(1, (int)($_GET['page'] ?? 1));
    $limit = max(1, min(100, (int)($_GET['limit'] ?? 20)));
    $search = trim($_GET['search'] ?? '');
    $offset = ($page - 1) * $limit;

    $unions = [];
    $searchCond = '';
    $searchParams = [];

    if (!empty($search)) {
        $searchCond = " AND description LIKE :search";
        $searchParams[':search'] = "%$search%";
    }

    if ($type === 'all' || $type === 'income') {
        $unions[] = "SELECT id, 'income' AS type, incometype AS category, CAST(amount AS DECIMAL(10,2)) AS amount, description, '' AS method, DATE_FORMAT(date, '%Y-%m-%d') AS date FROM income WHERE delete_status = 0" . str_replace('description', 'description', $searchCond);
    }
    if ($type === 'all' || $type === 'expense') {
        $unions[] = "SELECT id, 'expense' AS type, expensetype AS category, CAST(amount AS DECIMAL(10,2)) AS amount, description, '' AS method, DATE_FORMAT(date, '%Y-%m-%d') AS date FROM expense WHERE delete_status = 0" . str_replace('description', 'description', $searchCond);
    }
    if ($type === 'all' || $type === 'contribution') {
        $searchCondContri = !empty($search) ? " AND (c.member LIKE :search OR c.contritype LIKE :search)" : '';
        $unions[] = "SELECT c.id, 'contribution' AS type, c.contritype AS category, c.amount, c.member AS description, c.paymentmethod AS method, DATE_FORMAT(c.date, '%Y-%m-%d') AS date FROM contribution c WHERE c.delete_status = 0" . $searchCondContri;
    }

    if (empty($unions)) {
        apiSuccess(['transactions' => [], 'pagination' => ['total' => 0, 'total_pages' => 0, 'page' => $page, 'limit' => $limit]], 'No data');
        exit;
    }

    $unionSql = implode(" UNION ALL ", $unions);

    // Count
    $countSql = "SELECT COUNT(*) AS total FROM ($unionSql) AS combined";
    $countStmt = $db->prepare($countSql);
    if (!empty($search)) {
        $countStmt->bindValue(':search', "%$search%");
    }
    $countStmt->execute();
    $total = (int)$countStmt->fetch()['total'];

    // Fetch
    $sql = "$unionSql ORDER BY date DESC LIMIT :limit OFFSET :offset";
    $stmt = $db->prepare($sql);
    if (!empty($search)) {
        $stmt->bindValue(':search', "%$search%");
    }
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    $transactions = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Cast amounts to numbers
    foreach ($transactions as &$tx) {
        $tx['amount'] = (float)$tx['amount'];
    }

    apiSuccess([
        'transactions' => $transactions,
        'pagination' => [
            'total' => $total,
            'total_pages' => max(1, ceil($total / $limit)),
            'page' => $page,
            'limit' => $limit
        ]
    ], 'Transactions retrieved');

} catch (PDOException $e) {
    error_log("Transactions error: " . $e->getMessage());
    apiError('Failed to retrieve transactions', 500);
}
