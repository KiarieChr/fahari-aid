<?php
// manage/get_events_for_dropdown.php
ob_start();
require_once('../includes/checklogin.php');
ob_clean();
header('Content-Type: application/json; charset=utf-8');

try {
    // Fetch active events
    $eventsStmt = $db->query("SELECT id, ename FROM event WHERE delete_status = 0 ORDER BY ename ASC");
    $events = $eventsStmt->fetchAll(PDO::FETCH_ASSOC);

    // Fetch approved budget items
    $itemsStmt = $db->query("
        SELECT 
            ebi.id AS item_id,
            eb.event_id,
            eb.budget_name,
            ebi.category,
            ebi.description,
            ebi.estimated_amount,
            ebi.actual_amount,
            (ebi.estimated_amount - COALESCE(ebi.actual_amount, 0)) AS remaining_balance,
            ebi.gl_account_id,
            a.account_code,
            a.account_name
           FROM event_budget_item ebi
           JOIN event_budget eb ON ebi.event_budget_id = eb.id
           JOIN account a ON ebi.gl_account_id = a.id
           WHERE eb.status = 'approved'
             AND ebi.status != 'cancelled'
           ORDER BY ebi.description ASC
    ");
    $budgetItems = $itemsStmt->fetchAll(PDO::FETCH_ASSOC);

    // Format numbers
    foreach ($budgetItems as &$item) {
        $item['estimated_amount'] = (float)$item['estimated_amount'];
        $item['actual_amount'] = (float)$item['actual_amount'];
        $item['remaining_balance'] = (float)$item['remaining_balance'];
    }

    // Fetch active expense accounts (account_code starts with '5' or is classified as expense)
    $accountsStmt = $db->query("
        SELECT id, account_name, account_code 
        FROM account 
        WHERE is_active = 1 AND (account_code LIKE '5%' OR account_code = '50301')
        ORDER BY account_code ASC
    ");
    $expenseAccounts = $accountsStmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'events' => $events,
        'budget_items' => $budgetItems,
        'expense_accounts' => $expenseAccounts
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
