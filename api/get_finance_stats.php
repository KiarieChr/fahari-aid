<?php
/**
 * Get Finance Statistics
 * GET /api/get_finance_stats.php
 */
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/middleware.php';

$user = authenticate();

try {
    $data = [];

    // Total income
    try {
        $stmt = $db->query("SELECT COALESCE(SUM(CAST(amount AS DECIMAL(10,2))), 0) AS total FROM income WHERE delete_status = 0");
        $data['total_income'] = (float)$stmt->fetch()['total'];
    } catch (PDOException $e) {
        $data['total_income'] = 0;
    }

    // Total expenses
    try {
        $stmt = $db->query("SELECT COALESCE(SUM(CAST(amount AS DECIMAL(10,2))), 0) AS total FROM expense WHERE delete_status = 0");
        $data['total_expenses'] = (float)$stmt->fetch()['total'];
    } catch (PDOException $e) {
        $data['total_expenses'] = 0;
    }

    // Total contributions and transactions
    try {
        $stmt = $db->query("SELECT COALESCE(SUM(amount), 0) AS total, COUNT(*) as count FROM contribution WHERE delete_status = 0 OR delete_status = 'Active'");
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        $data['total_contributions'] = (float)$row['total'];
        $data['total_transactions'] = (int)$row['count'];
    } catch (PDOException $e) {
        $data['total_contributions'] = 0;
        $data['total_transactions'] = 0;
    }

    // Contributions by Method
    try {
        $stmt = $db->query("
            SELECT pm.name as method, COALESCE(SUM(c.amount), 0) as amount, COUNT(*) as count 
            FROM contribution c
            LEFT JOIN paymentmethod pm ON c.paymentmethod = pm.id
            WHERE c.delete_status = 0 OR c.delete_status = 'Active'
            GROUP BY pm.name
        ");
        $byMethod = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $data['by_method'] = array_map(function($row) {
            return [
                'method' => $row['method'] ? $row['method'] : 'Unknown',
                'amount' => (float)$row['amount'],
                'count' => (int)$row['count']
            ];
        }, $byMethod);
    } catch (PDOException $e) {
        $data['by_method'] = [];
    }

    // Contributions by Fund
    try {
        $stmt = $db->query("
            SELECT f.name as fund, COALESCE(SUM(c.amount), 0) as amount 
            FROM contribution c
            LEFT JOIN fund f ON c.fund = f.id
            WHERE c.delete_status = 0 OR c.delete_status = 'Active'
            GROUP BY f.name
        ");
        $byFund = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $data['by_fund'] = array_map(function($row) {
            return [
                'fund' => $row['fund'] ? $row['fund'] : 'General',
                'amount' => (float)$row['amount']
            ];
        }, $byFund);
    } catch (PDOException $e) {
        $data['by_fund'] = [];
    }

    // Pledges
    try {
        $stmt = $db->query("SELECT COALESCE(SUM(pledges_amount), 0) AS total FROM pledges");
        $data['total_pledges'] = (float)$stmt->fetch()['total'];

        $stmt = $db->query("SELECT COALESCE(SUM(redeemed_amount), 0) AS total FROM pledges_redeem");
        $data['pledges_redeemed'] = (float)$stmt->fetch()['total'];
    } catch (PDOException $e) {
        $data['total_pledges'] = 0;
        $data['pledges_redeemed'] = 0;
    }

    // Net balance
    $data['net_balance'] = ($data['total_income'] + $data['total_contributions']) - $data['total_expenses'];

    apiSuccess($data, 'Finance stats retrieved');

} catch (PDOException $e) {
    error_log("Finance stats error: " . $e->getMessage());
    apiError('Failed to retrieve finance statistics', 500);
}
