<?php
/**
 * Finance Settings API
 * GET  /api/finance_settings.php              — Get all settings data
 * POST /api/finance_settings.php              — Manage settings
 * Body: { section: 'payment_methods'|'contribution_types'|'funds'|'income_types'|'expense_types'|'accounting_periods',
 *         action: 'create'|'update'|'delete'|'close_period',
 *         ...fields }
 */
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/middleware.php';

$user = authenticate();

// ─── GET: Return all settings data ───
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $section = $_GET['section'] ?? 'all';

        $data = [];

        if ($section === 'all' || $section === 'payment_methods') {
            $stmt = $db->query("SELECT id, name, delete_status FROM paymentmethod ORDER BY name");
            $data['payment_methods'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
        }

        if ($section === 'all' || $section === 'contribution_types') {
            $stmt = $db->query("SELECT id, name, delete_status FROM contritype ORDER BY name");
            $data['contribution_types'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
        }

        if ($section === 'all' || $section === 'funds') {
            $stmt = $db->query("SELECT id, name, delete_status FROM fund ORDER BY name");
            $data['funds'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
        }

        if ($section === 'all' || $section === 'income_types') {
            $stmt = $db->query("
                SELECT it.id, it.name, it.gl_account_id, it.delete_status,
                       a.account_code, a.account_name
                FROM incometype it
                LEFT JOIN account a ON it.gl_account_id = a.id
                ORDER BY a.account_code, it.name
            ");
            $data['income_types'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
        }

        if ($section === 'all' || $section === 'expense_types') {
            $stmt = $db->query("
                SELECT et.id, et.name, et.gl_account_id, et.delete_status,
                       a.account_code, a.account_name
                FROM expensetype et
                LEFT JOIN account a ON et.gl_account_id = a.id
                ORDER BY a.account_code, et.name
            ");
            $data['expense_types'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
        }

        if ($section === 'all' || $section === 'accounting_periods') {
            $stmt = $db->query("
                SELECT ap.*,
                    (SELECT COUNT(*) FROM journal_entry je WHERE je.accounting_period_id = ap.id) AS entry_count
                FROM accounting_period ap
                ORDER BY ap.start_date DESC
            ");
            $data['accounting_periods'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
        }

        if ($section === 'all' || $section === 'gl_accounts') {
            $stmt = $db->query("SELECT id, account_code, account_name, account_type FROM account WHERE is_active = 1 ORDER BY account_code");
            $data['gl_accounts'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
        }

        apiSuccess($data, 'Settings retrieved');
    } catch (PDOException $e) {
        error_log("Finance settings GET error: " . $e->getMessage());
        apiError('Failed to retrieve settings', 500);
    }
    exit;
}

// ─── POST: Manage settings ───
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    apiError('Method not allowed', 405);
}

$body = getJsonBody();
$section = $body['section'] ?? '';
$action = $body['action'] ?? '';

if (empty($section) || empty($action)) {
    apiError('section and action are required', 400);
}

try {
    switch ($section) {

        // ─── Payment Methods ───
        case 'payment_methods':
            $name = trim($body['name'] ?? '');
            $id = (int)($body['id'] ?? 0);

            if ($action === 'create') {
                if (empty($name)) apiError('Name is required', 400);
                $db->prepare("INSERT INTO paymentmethod (name, delete_status) VALUES (:n, 0)")->execute([':n' => $name]);
                apiSuccess(['id' => (int)$db->lastInsertId()], 'Payment method created');
            } elseif ($action === 'update') {
                if ($id <= 0 || empty($name)) apiError('ID and name are required', 400);
                $db->prepare("UPDATE paymentmethod SET name = :n WHERE id = :id")->execute([':n' => $name, ':id' => $id]);
                apiSuccess(['id' => $id], 'Payment method updated');
            } elseif ($action === 'toggle') {
                if ($id <= 0) apiError('ID is required', 400);
                $db->prepare("UPDATE paymentmethod SET delete_status = IF(delete_status = 0, 1, 0) WHERE id = :id")->execute([':id' => $id]);
                apiSuccess(['id' => $id], 'Payment method toggled');
            } else {
                apiError('Invalid action', 400);
            }
            break;

        // ─── Contribution Types ───
        case 'contribution_types':
            $name = trim($body['name'] ?? '');
            $id = (int)($body['id'] ?? 0);

            if ($action === 'create') {
                if (empty($name)) apiError('Name is required', 400);
                $db->prepare("INSERT INTO contritype (name, delete_status) VALUES (:n, 0)")->execute([':n' => $name]);
                apiSuccess(['id' => (int)$db->lastInsertId()], 'Contribution type created');
            } elseif ($action === 'update') {
                if ($id <= 0 || empty($name)) apiError('ID and name are required', 400);
                $db->prepare("UPDATE contritype SET name = :n WHERE id = :id")->execute([':n' => $name, ':id' => $id]);
                apiSuccess(['id' => $id], 'Contribution type updated');
            } elseif ($action === 'toggle') {
                if ($id <= 0) apiError('ID is required', 400);
                $db->prepare("UPDATE contritype SET delete_status = IF(delete_status = 0, 1, 0) WHERE id = :id")->execute([':id' => $id]);
                apiSuccess(['id' => $id], 'Contribution type toggled');
            } else {
                apiError('Invalid action', 400);
            }
            break;

        // ─── Funds ───
        case 'funds':
            $name = trim($body['name'] ?? '');
            $id = (int)($body['id'] ?? 0);

            if ($action === 'create') {
                if (empty($name)) apiError('Name is required', 400);
                $db->prepare("INSERT INTO fund (name, delete_status) VALUES (:n, 0)")->execute([':n' => $name]);
                apiSuccess(['id' => (int)$db->lastInsertId()], 'Fund created');
            } elseif ($action === 'update') {
                if ($id <= 0 || empty($name)) apiError('ID and name are required', 400);
                $db->prepare("UPDATE fund SET name = :n WHERE id = :id")->execute([':n' => $name, ':id' => $id]);
                apiSuccess(['id' => $id], 'Fund updated');
            } elseif ($action === 'toggle') {
                if ($id <= 0) apiError('ID is required', 400);
                $db->prepare("UPDATE fund SET delete_status = IF(delete_status = 0, 1, 0) WHERE id = :id")->execute([':id' => $id]);
                apiSuccess(['id' => $id], 'Fund toggled');
            } else {
                apiError('Invalid action', 400);
            }
            break;

        // ─── Income Types ───
        case 'income_types':
            $name = trim($body['name'] ?? '');
            $id = (int)($body['id'] ?? 0);
            $gl_account_id = !empty($body['gl_account_id']) ? (int)$body['gl_account_id'] : null;

            if ($action === 'create') {
                if (empty($name)) apiError('Name is required', 400);
                $db->prepare("INSERT INTO incometype (name, gl_account_id, delete_status) VALUES (:n, :gl, 0)")
                    ->execute([':n' => $name, ':gl' => $gl_account_id]);
                apiSuccess(['id' => (int)$db->lastInsertId()], 'Income type created');
            } elseif ($action === 'update') {
                if ($id <= 0 || empty($name)) apiError('ID and name are required', 400);
                $db->prepare("UPDATE incometype SET name = :n, gl_account_id = :gl WHERE id = :id")
                    ->execute([':n' => $name, ':gl' => $gl_account_id, ':id' => $id]);
                apiSuccess(['id' => $id], 'Income type updated');
            } elseif ($action === 'toggle') {
                if ($id <= 0) apiError('ID is required', 400);
                $db->prepare("UPDATE incometype SET delete_status = IF(delete_status = 0, 1, 0) WHERE id = :id")->execute([':id' => $id]);
                apiSuccess(['id' => $id], 'Income type toggled');
            } else {
                apiError('Invalid action', 400);
            }
            break;

        // ─── Expense Types ───
        case 'expense_types':
            $name = trim($body['name'] ?? '');
            $id = (int)($body['id'] ?? 0);
            $gl_account_id = !empty($body['gl_account_id']) ? (int)$body['gl_account_id'] : null;

            if ($action === 'create') {
                if (empty($name)) apiError('Name is required', 400);
                $db->prepare("INSERT INTO expensetype (name, gl_account_id, delete_status) VALUES (:n, :gl, 0)")
                    ->execute([':n' => $name, ':gl' => $gl_account_id]);
                apiSuccess(['id' => (int)$db->lastInsertId()], 'Expense type created');
            } elseif ($action === 'update') {
                if ($id <= 0 || empty($name)) apiError('ID and name are required', 400);
                $db->prepare("UPDATE expensetype SET name = :n, gl_account_id = :gl WHERE id = :id")
                    ->execute([':n' => $name, ':gl' => $gl_account_id, ':id' => $id]);
                apiSuccess(['id' => $id], 'Expense type updated');
            } elseif ($action === 'toggle') {
                if ($id <= 0) apiError('ID is required', 400);
                $db->prepare("UPDATE expensetype SET delete_status = IF(delete_status = 0, 1, 0) WHERE id = :id")->execute([':id' => $id]);
                apiSuccess(['id' => $id], 'Expense type toggled');
            } else {
                apiError('Invalid action', 400);
            }
            break;

        // ─── Accounting Periods ───
        case 'accounting_periods':
            $name = trim($body['name'] ?? '');
            $id = (int)($body['id'] ?? 0);
            $start_date = trim($body['start_date'] ?? '');
            $end_date = trim($body['end_date'] ?? '');

            if ($action === 'create') {
                if (empty($name) || empty($start_date) || empty($end_date)) apiError('Name, start date, and end date are required', 400);
                if ($start_date >= $end_date) apiError('Start date must be before end date', 400);
                $db->prepare("INSERT INTO accounting_period (name, start_date, end_date) VALUES (:n, :s, :e)")
                    ->execute([':n' => $name, ':s' => $start_date, ':e' => $end_date]);
                apiSuccess(['id' => (int)$db->lastInsertId()], 'Accounting period created');
            } elseif ($action === 'update') {
                if ($id <= 0) apiError('ID is required', 400);
                $existing = $db->prepare("SELECT * FROM accounting_period WHERE id = :id");
                $existing->execute([':id' => $id]);
                $period = $existing->fetch(PDO::FETCH_ASSOC);
                if (!$period) apiError('Period not found', 404);
                if ($period['is_closed']) apiError('Cannot edit a closed period', 400);
                $name = $name ?: $period['name'];
                $start_date = $start_date ?: $period['start_date'];
                $end_date = $end_date ?: $period['end_date'];
                $db->prepare("UPDATE accounting_period SET name = :n, start_date = :s, end_date = :e WHERE id = :id")
                    ->execute([':n' => $name, ':s' => $start_date, ':e' => $end_date, ':id' => $id]);
                apiSuccess(['id' => $id], 'Accounting period updated');
            } elseif ($action === 'close_period') {
                if ($id <= 0) apiError('ID is required', 400);
                $db->prepare("UPDATE accounting_period SET is_closed = 1, closed_by = :uid, closed_at = NOW() WHERE id = :id AND is_closed = 0")
                    ->execute([':uid' => $user->id, ':id' => $id]);
                apiSuccess(['id' => $id], 'Period closed');
            } else {
                apiError('Invalid action', 400);
            }
            break;

        default:
            apiError('Invalid section', 400);
    }

} catch (PDOException $e) {
    error_log("Finance settings POST error: " . $e->getMessage());
    apiError('Failed to update settings', 500);
}
