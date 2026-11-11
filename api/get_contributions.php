<?php
/**
 * Get Contributions API
 * Returns contributions with member info, type, fund, payment method
 * Supports pagination and search
 */
require_once 'config.php';
require_once 'middleware.php';

$user = authenticate();

try {
    $page = max(1, intval($_GET['page'] ?? 1));
    $limit = max(1, min(100, intval($_GET['limit'] ?? 15)));
    $search = trim($_GET['search'] ?? '');
    $offset = ($page - 1) * $limit;

    $where = "c.delete_status = 'Active'";
    $params = [];

    if ($search !== '') {
        $where .= " AND (m.first_name LIKE :search OR m.last_name LIKE :search OR ct.name LIKE :search OR f.name LIKE :search)";
        $params[':search'] = "%$search%";
    }

    // Count total
    $countSql = "SELECT COUNT(*) FROM contribution c
        LEFT JOIN member m ON m.id = c.member
        LEFT JOIN contritype ct ON ct.id = c.contritype
        LEFT JOIN fund f ON f.id = c.fund
        WHERE $where";
    $countStmt = $db->prepare($countSql);
    $countStmt->execute($params);
    $total = $countStmt->fetchColumn();

    // Fetch page
    $sql = "SELECT c.id, c.amount, c.date as contribution_date,
            CONCAT(COALESCE(m.first_name,''), ' ', COALESCE(m.last_name,'')) as member_name,
            m.email as member_email,
            ct.name as contribution_type,
            f.name as fund_name,
            pm.name as payment_method,
            c.journal_entry_id
        FROM contribution c
        LEFT JOIN member m ON m.id = c.member
        LEFT JOIN contritype ct ON ct.id = c.contritype
        LEFT JOIN fund f ON f.id = c.fund
        LEFT JOIN paymentmethod pm ON pm.id = c.paymentmethod
        WHERE $where
        ORDER BY c.date DESC, c.id DESC
        LIMIT :limit OFFSET :offset";

    $stmt = $db->prepare($sql);
    foreach ($params as $k => $v) {
        $stmt->bindValue($k, $v);
    }
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    $contributions = $stmt->fetchAll(PDO::FETCH_ASSOC);

    apiSuccess([
        'contributions' => $contributions,
        'pagination' => [
            'total' => (int)$total,
            'page' => $page,
            'limit' => $limit,
            'total_pages' => ceil($total / $limit)
        ]
    ]);

} catch (Exception $e) {
    apiError('Failed to fetch contributions: ' . $e->getMessage(), 500);
}