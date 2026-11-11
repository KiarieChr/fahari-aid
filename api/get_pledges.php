<?php
/**
 * Get Pledges API Endpoint
 * GET /api/get_pledges.php?page=1&limit=20&search=&status=&date_from=&date_to=
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/middleware.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    apiError('Method not allowed', 405);
}

$user = authenticate();

try {
    $page = max(1, (int)($_GET['page'] ?? 1));
    $limit = max(1, min(100, (int)($_GET['limit'] ?? 20)));
    $search = trim($_GET['search'] ?? '');
    $status = trim($_GET['status'] ?? '');
    $date_from = trim($_GET['date_from'] ?? '');
    $date_to = trim($_GET['date_to'] ?? '');
    $offset = ($page - 1) * $limit;

    $where = "WHERE 1=1";
    $params = [];

    if (!empty($search)) {
        $where .= " AND (p.full_name LIKE :search1 OR p.purpose LIKE :search2 OR p.email LIKE :search3)";
        $params[':search1'] = "%$search%";
        $params[':search2'] = "%$search%";
        $params[':search3'] = "%$search%";
    }

    if (!empty($date_from)) {
        $where .= " AND p.date >= :date_from";
        $params[':date_from'] = $date_from;
    }

    if (!empty($date_to)) {
        $where .= " AND p.date <= :date_to";
        $params[':date_to'] = $date_to;
    }

    $redeem_subquery = "COALESCE((SELECT SUM(r.redeemed_amount) FROM pledges_redeem r WHERE r.pledge_id = p.id), 0)";

    if ($status === 'pending') {
        $where .= " AND $redeem_subquery <= 0";
    } elseif ($status === 'partial') {
        $where .= " AND $redeem_subquery > 0 AND $redeem_subquery < p.pledges_amount";
    } elseif ($status === 'fulfilled') {
        $where .= " AND $redeem_subquery >= p.pledges_amount";
    }

    // Get counts and stats for filtered data
    $statsSql = "
        SELECT 
            COUNT(*) AS total_count,
            COALESCE(SUM(p.pledges_amount), 0) AS total_pledged,
            COALESCE(SUM($redeem_subquery), 0) AS total_redeemed
        FROM pledges p 
        $where
    ";
    $statsStmt = $db->prepare($statsSql);
    $statsStmt->execute($params);
    $stats = $statsStmt->fetch(PDO::FETCH_ASSOC);

    $total = (int)$stats['total_count'];
    $total_pledged = (float)$stats['total_pledged'];
    $total_redeemed = (float)$stats['total_redeemed'];
    $total_remaining = max(0, $total_pledged - $total_redeemed);

    $sql = "
        SELECT 
            p.id, p.full_name, p.purpose, p.pledges_amount AS pledged_amount,
            $redeem_subquery AS redeemed_amount,
            DATE_FORMAT(p.date, '%Y-%m-%d') AS date,
            p.phone_no, p.email, p.recurring, p.pledge_type
        FROM pledges p
        $where
        ORDER BY p.date DESC
        LIMIT :limit OFFSET :offset
    ";
    $stmt = $db->prepare($sql);
    foreach ($params as $k => $v) $stmt->bindValue($k, $v);
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    $pledges = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($pledges as &$p) {
        $p['pledged_amount'] = (float)$p['pledged_amount'];
        $p['redeemed_amount'] = (float)$p['redeemed_amount'];
    }

    apiSuccess([
        'pledges' => $pledges,
        'stats' => [
            'total_pledged' => $total_pledged,
            'total_redeemed' => $total_redeemed,
            'total_remaining' => $total_remaining
        ],
        'pagination' => ['total' => $total, 'total_pages' => max(1, ceil($total / $limit)), 'page' => $page, 'limit' => $limit]
    ], 'Pledges retrieved');

} catch (PDOException $e) {
    error_log("Pledges error: " . $e->getMessage());
    apiError('Failed to retrieve pledges', 500);
}
?>