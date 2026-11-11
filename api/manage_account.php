<?php
/**
 * Manage Chart of Accounts
 * POST /api/manage_account.php
 * Body: { action: 'create'|'update'|'toggle', ...fields }
 */
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/middleware.php';
require_once __DIR__ . '/JournalService.php';

$user = authenticate();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    apiError('Method not allowed', 405);
}

$body = getJsonBody();
$action = $body['action'] ?? '';

try {
    $js = new JournalService($db);

    switch ($action) {
        case 'create':
            $code = trim($body['account_code'] ?? '');
            $name = trim($body['account_name'] ?? '');
            $type = $body['account_type'] ?? '';
            $parentId = !empty($body['parent_id']) ? (int)$body['parent_id'] : null;
            $fundId = !empty($body['fund_id']) ? (int)$body['fund_id'] : null;
            $description = trim($body['description'] ?? '');

            if (empty($code) || empty($name) || empty($type)) {
                apiError('account_code, account_name, and account_type are required', 400);
            }

            $validTypes = ['Asset', 'Liability', 'Equity', 'Revenue', 'Expense'];
            if (!in_array($type, $validTypes)) {
                apiError('Invalid account_type. Must be one of: ' . implode(', ', $validTypes), 400);
            }

            // Determine normal balance
            $normalBalance = in_array($type, ['Asset', 'Expense']) ? 'Debit' : 'Credit';

            // Check uniqueness
            $chk = $db->prepare("SELECT id FROM account WHERE account_code = :code");
            $chk->execute([':code' => $code]);
            if ($chk->fetch()) {
                apiError("Account code '$code' already exists", 400);
            }

            $stmt = $db->prepare("
                INSERT INTO account (account_code, account_name, account_type, parent_id, fund_id, is_active, description, normal_balance)
                VALUES (:code, :name, :type, :parent, :fund, 1, :desc, :normal)
            ");
            $stmt->execute([
                ':code' => $code,
                ':name' => $name,
                ':type' => $type,
                ':parent' => $parentId,
                ':fund' => $fundId,
                ':desc' => $description,
                ':normal' => $normalBalance,
            ]);
            $id = (int)$db->lastInsertId();

            // Auto-add to incometype/expensetype table when creating Revenue/Expense accounts
            if ($type === 'Revenue') {
                $db->prepare("INSERT INTO incometype (name, gl_account_id, delete_status) VALUES (:name, :aid, 0)")
                    ->execute([':name' => $name, ':aid' => $id]);
            } elseif ($type === 'Expense') {
                $db->prepare("INSERT INTO expensetype (name, gl_account_id, delete_status) VALUES (:name, :aid, 0)")
                    ->execute([':name' => $name, ':aid' => $id]);
            }

            $js->audit('account', $id, 'create', null, ['account_code' => $code, 'account_name' => $name, 'account_type' => $type], $user->id);

            apiSuccess(['id' => $id], 'Account created successfully');
            break;

        case 'update':
            $id = (int)($body['id'] ?? 0);
            if ($id <= 0) apiError('id is required', 400);

            $existing = $db->prepare("SELECT * FROM account WHERE id = :id");
            $existing->execute([':id' => $id]);
            $old = $existing->fetch(PDO::FETCH_ASSOC);
            if (!$old) apiError('Account not found', 404);

            $name = trim($body['account_name'] ?? $old['account_name']);
            $description = trim($body['description'] ?? $old['description']);
            $parentId = array_key_exists('parent_id', $body) ? ($body['parent_id'] ? (int)$body['parent_id'] : null) : $old['parent_id'];
            $fundId = array_key_exists('fund_id', $body) ? ($body['fund_id'] ? (int)$body['fund_id'] : null) : $old['fund_id'];

            $stmt = $db->prepare("UPDATE account SET account_name = :name, description = :desc, parent_id = :parent, fund_id = :fund WHERE id = :id");
            $stmt->execute([':name' => $name, ':desc' => $description, ':parent' => $parentId, ':fund' => $fundId, ':id' => $id]);

            $js->audit('account', $id, 'update', $old, ['account_name' => $name, 'description' => $description], $user->id);

            apiSuccess(['id' => $id], 'Account updated successfully');
            break;

        case 'toggle':
            $id = (int)($body['id'] ?? 0);
            if ($id <= 0) apiError('id is required', 400);

            $stmt = $db->prepare("UPDATE account SET is_active = NOT is_active WHERE id = :id");
            $stmt->execute([':id' => $id]);

            apiSuccess(['id' => $id], 'Account toggled successfully');
            break;

        default:
            apiError('Invalid action. Must be create, update, or toggle', 400);
    }

} catch (PDOException $e) {
    error_log("Manage account error: " . $e->getMessage());
    apiError('Failed to manage account', 500);
}
