<?php
// manage/get_pledges.php
// Returns pledges list with per-pledge redemption aggregates, KPI stats,
// and accounting period data for the filter UI.

ob_start();
require_once('../includes/checklogin.php');
ob_clean();
header('Content-Type: application/json; charset=utf-8');

try {
    // ------------------------------------------------------------------
    // 1. Load all accounting periods for the period-selector dropdown
    // ------------------------------------------------------------------
    $periodsStmt = $db->query("
        SELECT id, 
               CONCAT(YEAR(start_date), ' / ', YEAR(end_date), ' (Period #', id, ')') AS label,
               start_date, end_date, is_closed
        FROM accounting_period
        ORDER BY start_date DESC
    ");
    $periods = $periodsStmt->fetchAll(PDO::FETCH_ASSOC);

    // ------------------------------------------------------------------
    // 2. Determine active period (default when no dates supplied)
    // ------------------------------------------------------------------
    $activeStmt = $db->query("
        SELECT start_date, end_date, id
        FROM accounting_period
        WHERE is_closed = 0
        ORDER BY start_date DESC
        LIMIT 1
    ");
    $activePeriod = $activeStmt->fetch(PDO::FETCH_ASSOC);

    $defaultStart = $activePeriod ? $activePeriod['start_date'] : date('Y-01-01');
    $defaultEnd   = $activePeriod ? $activePeriod['end_date']   : date('Y-12-31');
    $activePeriodId = $activePeriod ? (int)$activePeriod['id'] : null;

    // ------------------------------------------------------------------
    // 3. Resolve filter params
    // ------------------------------------------------------------------
    $startDate  = !empty($_GET['start_date']) ? $_GET['start_date'] : $defaultStart;
    $endDate    = !empty($_GET['end_date'])   ? $_GET['end_date']   : $defaultEnd;
    $search     = trim($_GET['search'] ?? '');
    $statusFilter = trim($_GET['status'] ?? 'all'); // all | pending | redeemed | partial

    // ------------------------------------------------------------------
    // 4. Fetch pledges with aggregated redemption data
    // ------------------------------------------------------------------
    $sql = "
        SELECT
            p.id,
            p.full_name,
            p.email,
            p.phone_no,
            p.purpose,
            p.pledge_type,
            p.pledges_amount,
            p.date,
            p.recurring,
            p.notes,
            p.status,
            p.attendees_sponsored,
            p.member_id,
            COALESCE(SUM(pr.redeemed_amount), 0)  AS total_redeemed,
            COUNT(pr.id)                            AS redemption_count,
            (p.pledges_amount - COALESCE(SUM(pr.redeemed_amount), 0)) AS balance
        FROM pledges p
        LEFT JOIN pledges_redeem pr ON pr.pledge_id = p.id
        WHERE DATE(p.date) >= :start_date
          AND DATE(p.date) <= :end_date
    ";

    $params = [
        ':start_date' => $startDate,
        ':end_date'   => $endDate,
    ];

    if ($search !== '') {
        $sql .= " AND (p.full_name LIKE :search OR p.email LIKE :search OR p.phone_no LIKE :search)";
        $params[':search'] = '%' . $search . '%';
    }

    $sql .= " GROUP BY p.id ORDER BY p.date DESC";

    // Apply status filter in PHP after aggregation (simpler than HAVING clause with aliases)
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $pledges = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Compute derived fields and apply status filter
    $filteredPledges = [];
    foreach ($pledges as &$p) {
        $p['pledges_amount']  = (float)$p['pledges_amount'];
        $p['total_redeemed']  = (float)$p['total_redeemed'];
        $p['balance']         = (float)$p['balance'];
        $p['redemption_count']= (int)$p['redemption_count'];

        if ($p['pledges_amount'] <= 0) {
            $p['redemption_pct'] = 0;
            $p['redemption_status'] = 'pending';
        } elseif ($p['total_redeemed'] >= $p['pledges_amount']) {
            $p['redemption_pct'] = 100;
            $p['redemption_status'] = 'redeemed';
        } elseif ($p['total_redeemed'] > 0) {
            $p['redemption_pct'] = min(100, round(($p['total_redeemed'] / $p['pledges_amount']) * 100, 1));
            $p['redemption_status'] = 'partial';
        } else {
            $p['redemption_pct'] = 0;
            $p['redemption_status'] = 'pending';
        }

        // Status filter
        if ($statusFilter !== 'all' && $p['redemption_status'] !== $statusFilter) {
            continue;
        }
        $filteredPledges[] = $p;
    }
    unset($p);

    // ------------------------------------------------------------------
    // 5. KPI stats — scoped to the selected date range
    // ------------------------------------------------------------------
    $kpiStmt = $db->prepare("
        SELECT
            COALESCE(SUM(p.pledges_amount), 0) AS total_pledged,
            COUNT(p.id)                         AS total_count
        FROM pledges p
        WHERE DATE(p.date) >= :start_date
          AND DATE(p.date) <= :end_date
    ");
    $kpiStmt->execute([':start_date' => $startDate, ':end_date' => $endDate]);
    $kpiRow = $kpiStmt->fetch(PDO::FETCH_ASSOC);

    $kpiRedStmt = $db->prepare("
        SELECT COALESCE(SUM(pr.redeemed_amount), 0) AS total_redeemed
        FROM pledges_redeem pr
        JOIN pledges p ON p.id = pr.pledge_id
        WHERE DATE(p.date) >= :start_date
          AND DATE(p.date) <= :end_date
    ");
    $kpiRedStmt->execute([':start_date' => $startDate, ':end_date' => $endDate]);
    $kpiRedRow = $kpiRedStmt->fetch(PDO::FETCH_ASSOC);

    $totalPledged  = (float)$kpiRow['total_pledged'];
    $totalRedeemed = (float)$kpiRedRow['total_redeemed'];
    $outstanding   = max(0, $totalPledged - $totalRedeemed);

    echo json_encode([
        'success' => true,
        'data' => [
            'pledges'         => $filteredPledges,
            'start_date'      => $startDate,
            'end_date'        => $endDate,
            'active_period_id'=> $activePeriodId,
            'periods'         => $periods,
            'stats' => [
                'total_pledged'  => $totalPledged,
                'total_redeemed' => $totalRedeemed,
                'outstanding'    => $outstanding,
                'count'          => (int)$kpiRow['total_count'],
            ]
        ],
        'message' => 'Pledges retrieved successfully'
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
}
?>
