<?php
/**
 * Chart of Accounts API
 * /api/finance/accounts.php
 */

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../middleware.php';

$user = authenticate();
$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        $stmt = $db->query("
            SELECT id, account_code, account_name, account_type, 
                   description, normal_balance, is_active, parent_id
            FROM account
            ORDER BY account_type, account_code
        ");
        $accounts = $stmt->fetchAll(PDO::FETCH_ASSOC);
        apiSuccess($accounts, 'Accounts retrieved successfully');
    } 
    
    elseif ($method === 'POST') {
        $data = getJsonBody();
        $stmt = $db->prepare("
            INSERT INTO account (account_code, account_name, account_type, description, normal_balance) 
            VALUES (:code, :name, :type, :desc, :bal)
        ");
        $stmt->execute([
            ':code' => $data['account_code'],
            ':name' => $data['account_name'],
            ':type' => $data['account_type'],
            ':desc' => $data['description'] ?? null,
            ':bal' => $data['normal_balance'] ?? ($data['account_type'] == 'Asset' || $data['account_type'] == 'Expense' ? 'Debit' : 'Credit')
        ]);
        apiSuccess(['id' => $db->lastInsertId()], 'Account created successfully');
    }
    
    elseif ($method === 'PUT') {
        $data = getJsonBody();
        $stmt = $db->prepare("
            UPDATE account 
            SET account_code = :code, 
                account_name = :name, 
                account_type = :type, 
                description = :desc, 
                is_active = :active
            WHERE id = :id
        ");
        $stmt->execute([
            ':id' => $data['id'],
            ':code' => $data['account_code'],
            ':name' => $data['account_name'],
            ':type' => $data['account_type'],
            ':desc' => $data['description'] ?? null,
            ':active' => isset($data['is_active']) ? (int)$data['is_active'] : 1
        ]);
        apiSuccess([], 'Account updated successfully');
    }
    
    elseif ($method === 'DELETE') {
        $id = $_GET['id'] ?? null;
        if (!$id) apiError('Account ID is required');
        
        // Ensure no journal entries use this account
        $check = $db->prepare("SELECT COUNT(*) FROM journal_entry_line WHERE account_id = :id");
        $check->execute([':id' => $id]);
        if ($check->fetchColumn() > 0) {
            apiError('Cannot delete account: it has associated journal entries.');
        }
        
        $stmt = $db->prepare("DELETE FROM account WHERE id = :id");
        $stmt->execute([':id' => $id]);
        apiSuccess([], 'Account deleted successfully');
    }
    
} catch (PDOException $e) {
    error_log("Accounts API error: " . $e->getMessage());
    apiError('Database error: ' . $e->getMessage(), 500);
}
