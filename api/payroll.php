<?php
/**
 * Payroll Management
 * GET  /api/payroll.php — List payroll runs
 * POST /api/payroll.php — Create, approve, or pay a payroll run
 */
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/middleware.php';
require_once __DIR__ . '/JournalService.php';

$user = authenticate();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // List payroll runs
    try {
        $page = max(1, (int)($_GET['page'] ?? 1));
        $limit = max(1, min(50, (int)($_GET['limit'] ?? 20)));
        $offset = ($page - 1) * $limit;
        $status = $_GET['status'] ?? '';

        $where = "WHERE 1=1";
        $params = [];
        if (!empty($status)) {
            $where .= " AND pr.status = :status";
            $params[':status'] = $status;
        }

        $countStmt = $db->prepare("SELECT COUNT(*) FROM payroll_run pr $where");
        $countStmt->execute($params);
        $total = (int)$countStmt->fetchColumn();

        $sql = "SELECT pr.*, 
                       (SELECT COUNT(*) FROM payroll_item pi WHERE pi.payroll_run_id = pr.id) AS employee_count
                FROM payroll_run pr
                $where
                ORDER BY pr.created_at DESC
                LIMIT :limit OFFSET :offset";
        $stmt = $db->prepare($sql);
        foreach ($params as $k => $v) $stmt->bindValue($k, $v);
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        $runs = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Get items for each run
        $itemStmt = $db->prepare("SELECT * FROM payroll_item WHERE payroll_run_id = :run_id ORDER BY employee_name");
        foreach ($runs as &$run) {
            $run['id'] = (int)$run['id'];
            $run['total_gross'] = (float)$run['total_gross'];
            $run['total_deductions'] = (float)$run['total_deductions'];
            $run['total_net'] = (float)$run['total_net'];
            $run['employee_count'] = (int)$run['employee_count'];

            $itemStmt->execute([':run_id' => $run['id']]);
            $items = $itemStmt->fetchAll(PDO::FETCH_ASSOC);
            foreach ($items as &$item) {
                $item['basic_salary'] = (float)$item['basic_salary'];
                $item['allowances'] = (float)$item['allowances'];
                $item['deductions'] = (float)$item['deductions'];
                $item['net_pay'] = (float)$item['net_pay'];
            }
            $run['items'] = $items;
        }

        apiSuccess([
            'runs' => $runs,
            'pagination' => [
                'total' => $total,
                'total_pages' => max(1, ceil($total / $limit)),
                'page' => $page,
                'limit' => $limit,
            ]
        ], 'Payroll runs retrieved');

    } catch (PDOException $e) {
        error_log("Payroll list error: " . $e->getMessage());
        apiError('Failed to retrieve payroll runs', 500);
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $body = getJsonBody();
    $action = $body['action'] ?? 'create';

    try {
        $js = new JournalService($db);

        switch ($action) {
            case 'create':
                $periodStart = trim($body['pay_period_start'] ?? '');
                $periodEnd = trim($body['pay_period_end'] ?? '');
                $description = trim($body['description'] ?? '');
                $items = $body['items'] ?? [];

                if (empty($periodStart) || empty($periodEnd) || empty($items)) {
                    apiError('pay_period_start, pay_period_end, and items are required', 400);
                }

                $db->beginTransaction();

                $totalGross = 0;
                $totalDeductions = 0;
                $totalNet = 0;

                // Calculate totals
                foreach ($items as $item) {
                    $basic = (float)($item['basic_salary'] ?? 0);
                    $allow = (float)($item['allowances'] ?? 0);
                    $deduct = (float)($item['deductions'] ?? 0);
                    $net = $basic + $allow - $deduct;
                    $totalGross += $basic + $allow;
                    $totalDeductions += $deduct;
                    $totalNet += $net;
                }

                $stmt = $db->prepare("
                    INSERT INTO payroll_run (pay_period_start, pay_period_end, description, status, total_gross, total_deductions, total_net, created_by)
                    VALUES (:start, :end, :desc, 'draft', :gross, :deductions, :net, :user)
                ");
                $stmt->execute([
                    ':start' => $periodStart,
                    ':end' => $periodEnd,
                    ':desc' => $description,
                    ':gross' => $totalGross,
                    ':deductions' => $totalDeductions,
                    ':net' => $totalNet,
                    ':user' => $user->id,
                ]);
                $runId = (int)$db->lastInsertId();

                $itemStmt = $db->prepare("
                    INSERT INTO payroll_item (payroll_run_id, member_id, employee_name, basic_salary, allowances, deductions, net_pay, payment_method, bank_name, account_number, notes)
                    VALUES (:run, :member, :name, :basic, :allow, :deduct, :net, :method, :bank, :acct, :notes)
                ");
                foreach ($items as $item) {
                    $basic = (float)($item['basic_salary'] ?? 0);
                    $allow = (float)($item['allowances'] ?? 0);
                    $deduct = (float)($item['deductions'] ?? 0);
                    $itemStmt->execute([
                        ':run' => $runId,
                        ':member' => (int)($item['member_id'] ?? 0),
                        ':name' => trim($item['employee_name'] ?? ''),
                        ':basic' => $basic,
                        ':allow' => $allow,
                        ':deduct' => $deduct,
                        ':net' => $basic + $allow - $deduct,
                        ':method' => $item['payment_method'] ?? null,
                        ':bank' => $item['bank_name'] ?? null,
                        ':acct' => $item['account_number'] ?? null,
                        ':notes' => $item['notes'] ?? null,
                    ]);
                }

                $js->audit('payroll_run', $runId, 'create', null, ['description' => $description, 'total_net' => $totalNet, 'employees' => count($items)], $user->id);

                $db->commit();
                apiSuccess(['id' => $runId], 'Payroll run created');
                break;

            case 'approve':
                $runId = (int)($body['run_id'] ?? 0);
                if ($runId <= 0) apiError('run_id is required', 400);

                $stmt = $db->prepare("SELECT * FROM payroll_run WHERE id = :id AND status = 'draft'");
                $stmt->execute([':id' => $runId]);
                $run = $stmt->fetch(PDO::FETCH_ASSOC);
                if (!$run) apiError('Payroll run not found or not in draft status', 404);

                $db->prepare("UPDATE payroll_run SET status = 'approved', approved_by = :user, approved_at = NOW() WHERE id = :id")
                    ->execute([':user' => $user->id, ':id' => $runId]);

                $js->audit('payroll_run', $runId, 'update', ['status' => 'draft'], ['status' => 'approved'], $user->id);

                apiSuccess(['id' => $runId], 'Payroll approved');
                break;

            case 'pay':
                $runId = (int)($body['run_id'] ?? 0);
                if ($runId <= 0) apiError('run_id is required', 400);

                $stmt = $db->prepare("SELECT * FROM payroll_run WHERE id = :id AND status = 'approved'");
                $stmt->execute([':id' => $runId]);
                $run = $stmt->fetch(PDO::FETCH_ASSOC);
                if (!$run) apiError('Payroll run not found or not approved', 404);

                $db->beginTransaction();

                // Create journal entry
                $jeId = $js->recordPayroll(
                    $run['pay_period_end'],
                    (float)$run['total_net'],
                    "Payroll: " . $run['description'] . " ({$run['pay_period_start']} to {$run['pay_period_end']})",
                    $user->id,
                    $runId
                );

                $db->prepare("UPDATE payroll_run SET status = 'paid', journal_entry_id = :je WHERE id = :id")
                    ->execute([':je' => $jeId, ':id' => $runId]);

                $js->audit('payroll_run', $runId, 'update', ['status' => 'approved'], ['status' => 'paid', 'journal_entry_id' => $jeId], $user->id);

                $db->commit();
                apiSuccess(['id' => $runId, 'journal_entry_id' => $jeId], 'Payroll paid and journal entry created');
                break;

            default:
                apiError('Invalid action. Must be create, approve, or pay', 400);
        }

    } catch (Exception $e) {
        if ($db->inTransaction()) $db->rollBack();
        error_log("Payroll error: " . $e->getMessage());
        apiError('Payroll operation failed: ' . $e->getMessage(), 500);
    }
}
