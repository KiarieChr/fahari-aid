<?php
/**
 * Get Payment Transactions
 * GET /api/get_payment_transactions.php
 *
 * Query params (all optional):
 *   pledge_id   – filter by a specific pledge
 *   method      – 'mpesa' | 'paystack' | 'cash' | 'bank'
 *   date_from   – YYYY-MM-DD
 *   date_to     – YYYY-MM-DD
 *   search      – text search on name / reference / code
 *   page, limit
 *
 * Returns transactions from pledges_redeem (which stores ALL methods)
 * plus a per-method summary.
 *
 * Requires authentication.
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/middleware.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    apiError('Method not allowed', 405);
}

$user = authenticate();

try {
    $page      = max(1, (int)($_GET['page']      ?? 1));
    $limit     = max(1, min(200, (int)($_GET['limit']     ?? 50)));
    $offset    = ($page - 1) * $limit;
    $pledgeId  = (int)($_GET['pledge_id']  ?? 0);
    $method    = strtolower(trim($_GET['method']    ?? ''));
    $dateFrom  = trim($_GET['date_from']  ?? '');
    $dateTo    = trim($_GET['date_to']    ?? '');
    $search    = trim($_GET['search']     ?? '');

    // ── Build WHERE ───────────────────────────────────────────────────────────
    $where  = "WHERE 1=1";
    $params = [];

    if ($pledgeId > 0) {
        $where .= " AND r.pledge_id = :pledge_id";
        $params[':pledge_id'] = $pledgeId;
    }

    // Method detection uses the mpesa_code column:
    //   - starts with a Safaricom receipt pattern (letters+digits, 10 chars) => M-Pesa
    //   - starts with 'JEN-' => Paystack reference
    //   - blank or 'cash' => Cash / Bank
    if ($method === 'mpesa') {
        $where .= " AND r.mpesa_code REGEXP '^[A-Z0-9]{10}$'";
    } elseif ($method === 'paystack') {
        $where .= " AND (r.mpesa_code LIKE 'JEN-%' OR r.mpesa_code LIKE '%-ps-%')";
    } elseif ($method === 'cash' || $method === 'bank') {
        $where .= " AND (r.mpesa_code IS NULL OR r.mpesa_code = '')";
    }

    if (!empty($dateFrom)) {
        $where .= " AND DATE(r.date_redeemed) >= :date_from";
        $params[':date_from'] = $dateFrom;
    }
    if (!empty($dateTo)) {
        $where .= " AND DATE(r.date_redeemed) <= :date_to";
        $params[':date_to'] = $dateTo;
    }
    if (!empty($search)) {
        $where .= " AND (p.full_name LIKE :s1 OR r.mpesa_code LIKE :s2 OR p.email LIKE :s3 OR p.phone_no LIKE :s4)";
        $params[':s1'] = "%$search%";
        $params[':s2'] = "%$search%";
        $params[':s3'] = "%$search%";
        $params[':s4'] = "%$search%";
    }

    // ── Count ────────────────────────────────────────────────────────────────
    $countStmt = $db->prepare("SELECT COUNT(*) FROM pledges_redeem r LEFT JOIN pledges p ON r.pledge_id = p.id $where");
    $countStmt->execute($params);
    $total = (int)$countStmt->fetchColumn();

    // ── Summary (per method) ─────────────────────────────────────────────────
    $summaryStmt = $db->prepare("
        SELECT
            SUM(r.redeemed_amount)                                                       AS total_amount,
            SUM(CASE WHEN r.mpesa_code REGEXP '^[A-Z0-9]{10}$' THEN r.redeemed_amount ELSE 0 END) AS mpesa_total,
            SUM(CASE WHEN r.mpesa_code LIKE 'JEN-%' OR r.mpesa_code LIKE '%-ps-%' THEN r.redeemed_amount ELSE 0 END) AS paystack_total,
            SUM(CASE WHEN (r.mpesa_code IS NULL OR r.mpesa_code = '') THEN r.redeemed_amount ELSE 0 END)              AS cash_total,
            COUNT(*)                                                                     AS transaction_count
        FROM pledges_redeem r
        LEFT JOIN pledges p ON r.pledge_id = p.id
        $where
    ");
    $summaryStmt->execute($params);
    $summary = $summaryStmt->fetch(PDO::FETCH_ASSOC);

    // ── Rows ─────────────────────────────────────────────────────────────────
    $sql = "
        SELECT
            r.id,
            r.pledge_id,
            r.redeemed_amount                                               AS amount,
            r.mpesa_code                                                    AS reference,
            r.email,
            r.phone_no                                                      AS phone,
            DATE_FORMAT(r.date_redeemed, '%Y-%m-%d %H:%i')                 AS date,
            p.full_name                                                     AS pledger_name,
            p.purpose                                                       AS pledge_purpose,
            CASE
                WHEN r.mpesa_code REGEXP '^[A-Z0-9]{10}$' THEN 'M-Pesa'
                WHEN r.mpesa_code LIKE 'JEN-%' OR r.mpesa_code LIKE '%-ps-%' THEN 'Paystack'
                ELSE 'Cash / Bank'
            END AS payment_method,
            r.journal_entry_id
        FROM pledges_redeem r
        LEFT JOIN pledges p ON r.pledge_id = p.id
        $where
        ORDER BY r.date_redeemed DESC
        LIMIT :limit OFFSET :offset
    ";

    $stmt = $db->prepare($sql);
    foreach ($params as $k => $v) $stmt->bindValue($k, $v);
    $stmt->bindValue(':limit',  $limit,  PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    $transactions = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($transactions as &$t) {
        $t['amount'] = (float)$t['amount'];
    }

    apiSuccess([
        'transactions' => $transactions,
        'summary'      => [
            'total_amount'        => (float)($summary['total_amount'] ?? 0),
            'mpesa_total'         => (float)($summary['mpesa_total']  ?? 0),
            'paystack_total'      => (float)($summary['paystack_total'] ?? 0),
            'cash_total'          => (float)($summary['cash_total']   ?? 0),
            'transaction_count'   => (int)($summary['transaction_count'] ?? 0),
        ],
        'pagination'   => [
            'total'       => $total,
            'total_pages' => max(1, (int)ceil($total / $limit)),
            'page'        => $page,
            'limit'       => $limit,
            'has_more'    => ($page * $limit) < $total,
        ],
    ], 'Transactions retrieved');

} catch (PDOException $e) {
    error_log("get_payment_transactions error: " . $e->getMessage());
    apiError('Failed to retrieve transactions', 500);
}
