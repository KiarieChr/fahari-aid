<?php
// manage/get_bills.php
ob_start();
require_once('../includes/checklogin.php');
ob_clean();
header('Content-Type: application/json; charset=utf-8');

try {
    // Find current active accounting period to set default dates
    $activePeriodStmt = $db->query("SELECT start_date, end_date FROM accounting_period WHERE is_closed = 0 ORDER BY start_date DESC LIMIT 1");
    $activePeriod = $activePeriodStmt->fetch(PDO::FETCH_ASSOC);
    $defaultStart = $activePeriod ? $activePeriod['start_date'] : date('Y-01-01');
    $defaultEnd = $activePeriod ? $activePeriod['end_date'] : date('Y-12-31');

    $startDate = !empty($_GET['start_date']) ? $_GET['start_date'] : $defaultStart;
    $endDate = !empty($_GET['end_date']) ? $_GET['end_date'] : $defaultEnd;
    $status = !empty($_GET['status']) ? $_GET['status'] : '';
    $eventId = !empty($_GET['event_id']) ? (int)$_GET['event_id'] : 0;

    $sql = "
        SELECT 
            b.*, 
            a.account_name, 
            a.account_code, 
            e.ename AS event_title, 
            ebi.description AS event_budget_item_description,
            CONCAT(m.first_name, ' ', m.last_name) AS recorded_by_name
        FROM bills b
        JOIN account a ON b.gl_account_id = a.id
        LEFT JOIN event e ON b.event_id = e.id
        LEFT JOIN event_budget_item ebi ON b.event_budget_item_id = ebi.id
        LEFT JOIN users u ON b.recorded_by = u.id
        LEFT JOIN member m ON u.member_id = m.id
        WHERE b.delete_status = 0
    ";

    $params = [];

    if ($startDate) {
        $sql .= " AND b.bill_date >= :start_date";
        $params[':start_date'] = $startDate;
    }
    if ($endDate) {
        $sql .= " AND b.bill_date <= :end_date";
        $params[':end_date'] = $endDate;
    }
    if ($status) {
        $sql .= " AND b.status = :status";
        $params[':status'] = $status;
    }
    if ($eventId > 0) {
        $sql .= " AND b.event_id = :event_id";
        $params[':event_id'] = $eventId;
    }

    $sql .= " ORDER BY b.bill_date DESC, b.id DESC";

    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $bills = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Format fields
    foreach ($bills as &$bill) {
        $bill['amount'] = (float)$bill['amount'];
        $bill['balance_due'] = (float)$bill['balance_due'];
    }

    // Statistics
    // 1. Total Unpaid Liability (sum of balance_due where delete_status = 0 and status != 'paid')
    $unpaidStmt = $db->query("SELECT COALESCE(SUM(balance_due), 0) FROM bills WHERE delete_status = 0 AND status != 'paid'");
    $totalUnpaid = (float)$unpaidStmt->fetchColumn();

    // 2. Total Paid this Month (sum of bill_payments amount within current month)
    $monthPaidStmt = $db->query("
        SELECT COALESCE(SUM(amount), 0) 
        FROM bill_payments 
        WHERE delete_status = 0 
          AND YEAR(payment_date) = YEAR(CURDATE()) 
          AND MONTH(payment_date) = MONTH(CURDATE())
    ");
    $totalPaidThisMonth = (float)$monthPaidStmt->fetchColumn();

    // 3. Event linked count (count of active bills linked to events)
    $eventLinkedStmt = $db->query("SELECT COUNT(*) FROM bills WHERE delete_status = 0 AND event_id IS NOT NULL");
    $eventLinkedCount = (int)$eventLinkedStmt->fetchColumn();

    // 4. Pending count (count of bills where status = 'unpaid' and not deleted)
    $pendingStmt = $db->query("SELECT COUNT(*) FROM bills WHERE delete_status = 0 AND status = 'unpaid'");
    $pendingCount = (int)$pendingStmt->fetchColumn();

    // Fetch payments matching date bounds
    $pSql = "
        SELECT 
            bp.*, 
            b.vendor_name, 
            b.bill_number,
            CONCAT(m.first_name, ' ', m.last_name) AS recorded_by_name
        FROM bill_payments bp
        JOIN bills b ON bp.bill_id = b.id
        LEFT JOIN users u ON bp.recorded_by = u.id
        LEFT JOIN member m ON u.member_id = m.id
        WHERE bp.delete_status = 0
    ";
    $pParams = [];
    if ($startDate) {
        $pSql .= " AND bp.payment_date >= :start_date";
        $pParams[':start_date'] = $startDate;
    }
    if ($endDate) {
        $pSql .= " AND bp.payment_date <= :end_date";
        $pParams[':end_date'] = $endDate;
    }
    $pSql .= " ORDER BY bp.payment_date DESC, bp.id DESC";
    $pStmt = $db->prepare($pSql);
    $pStmt->execute($pParams);
    $payments = $pStmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($payments as &$payment) {
        $payment['amount'] = (float)$payment['amount'];
    }

    echo json_encode([
        'success' => true,
        'bills' => $bills,
        'payments' => $payments,
        'stats' => [
            'total_unpaid' => $totalUnpaid,
            'total_paid_this_month' => $totalPaidThisMonth,
            'event_linked_count' => $eventLinkedCount,
            'pending_count' => $pendingCount
        ],
        'date_bounds' => [
            'start_date' => $startDate,
            'end_date' => $endDate
        ]
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
