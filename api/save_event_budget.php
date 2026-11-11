<?php
/**
 * Save Event Budget API
 * POST /api/save_event_budget.php
 * 
 * Actions:
 *  - create_budget: Create a new budget (or new version)
 *  - update_budget: Update budget metadata
 *  - add_item / update_item / delete_item: Manage line items
 *  - submit: Submit budget for approval
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/middleware.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    apiError('Method not allowed', 405);
}

$user = authenticate();
$body = getJsonBody();
$action = trim($body['action'] ?? '');

try {
    switch ($action) {

        // ───── Create Budget ──────────────────────────────────
        case 'create_budget': {
            $eventId = (int)($body['event_id'] ?? 0);
            $budgetName = trim($body['budget_name'] ?? '');
            $notes = trim($body['notes'] ?? '');

            if ($eventId <= 0 || empty($budgetName)) {
                apiError('Event ID and budget name are required', 400);
            }

            $db->beginTransaction();

            // Determine version number
            $stmt = $db->prepare("SELECT COALESCE(MAX(version), 0) + 1 FROM event_budget WHERE event_id = :eid");
            $stmt->execute([':eid' => $eventId]);
            $version = (int)$stmt->fetchColumn();

            // Resolve the active accounting_period_id for the current date
            $periodStmt = $db->prepare("
                SELECT id FROM accounting_period 
                WHERE CURRENT_DATE() BETWEEN start_date AND end_date AND is_closed = 0 
                ORDER BY start_date DESC LIMIT 1
            ");
            $periodStmt->execute();
            $accountingPeriodId = $periodStmt->fetchColumn();
            if (!$accountingPeriodId) {
                // fall back to the most recent open period
                $periodStmt = $db->prepare("
                    SELECT id FROM accounting_period 
                    WHERE is_closed = 0 
                    ORDER BY start_date DESC LIMIT 1
                ");
                $periodStmt->execute();
                $accountingPeriodId = $periodStmt->fetchColumn() ?: null;
            }

            // Insert event_budget record
            $stmt = $db->prepare("
                INSERT INTO event_budget (event_id, version, budget_name, status, notes, created_by)
                VALUES (:event_id, :version, :name, 'draft', :notes, :user_id)
            ");
            $stmt->execute([
                ':event_id' => $eventId,
                ':version' => $version,
                ':name' => $budgetName,
                ':notes' => $notes ?: null,
                ':user_id' => $user->id
            ]);
            $budgetId = (int)$db->lastInsertId();

            // Create corresponding record in the main budget table
            $stmtMainBudget = $db->prepare("
                INSERT INTO budget (budget_name, budget_purpose, is_active, accounting_period_id, reference_doc, created_by, update_by, created_at, updated_at)
                VALUES (:name, 'event', 0, :accounting_period_id, :reference_doc, :user_id, :user_id, NOW(), NOW())
            ");
            $stmtMainBudget->execute([
                ':name' => $budgetName,
                ':accounting_period_id' => $accountingPeriodId,
                ':reference_doc' => $budgetId,
                ':user_id' => $user->id
            ]);
            $mainBudgetId = (int)$db->lastInsertId();

            // Link the budget_id back to event_budget.budget_id
            $db->prepare("UPDATE event_budget SET budget_id = :budget_id WHERE id = :id")->execute([
                ':budget_id' => $mainBudgetId,
                ':id' => $budgetId
            ]);

            // Copy items from previous version if exists
            if ($version > 1) {
                $prevStmt = $db->prepare("
                    SELECT id FROM event_budget WHERE event_id = :eid AND version = :v
                ");
                $prevStmt->execute([':eid' => $eventId, ':v' => $version - 1]);
                $prevBudget = $prevStmt->fetch();
                if ($prevBudget) {
                    // Fetch items from the previous version
                    $oldItemsStmt = $db->prepare("
                        SELECT category, description, estimated_amount, vendor, gl_account_id, notes
                        FROM event_budget_item 
                        WHERE event_budget_id = :old_id AND status != 'cancelled'
                    ");
                    $oldItemsStmt->execute([':old_id' => $prevBudget['id']]);
                    $oldItems = $oldItemsStmt->fetchAll(PDO::FETCH_ASSOC);

                    // Insert into budget_details and event_budget_item
                    $insertMainDetail = $db->prepare("
                        INSERT INTO budget_details (budget_id, description, amount, created_on, created_by, updated_on, category, account_id)
                        VALUES (:budget_id, :description, :amount, NOW(), :user_id, NOW(), 0, :account_id)
                    ");
                    $insertEventItem = $db->prepare("
                        INSERT INTO event_budget_item (event_budget_id, category, description, estimated_amount, vendor, gl_account_id, status, notes, budget_details_id)
                        VALUES (:event_budget_id, :category, :description, :amount, :vendor, :gl_id, 'planned', :notes, :budget_details_id)
                    ");

                    foreach ($oldItems as $item) {
                        // 1. Insert into budget_details
                        $insertMainDetail->execute([
                            ':budget_id' => $mainBudgetId,
                            ':description' => $item['description'],
                            ':amount' => (float)$item['estimated_amount'],
                            ':user_id' => $user->id,
                            ':account_id' => $item['gl_account_id']
                        ]);
                        $budgetDetailsId = (int)$db->lastInsertId();

                        // 2. Insert into event_budget_item
                        $insertEventItem->execute([
                            ':event_budget_id' => $budgetId,
                            ':category' => $item['category'],
                            ':description' => $item['description'],
                            ':amount' => (float)$item['estimated_amount'],
                            ':vendor' => $item['vendor'],
                            ':gl_id' => $item['gl_account_id'],
                            ':notes' => $item['notes'],
                            ':budget_details_id' => $budgetDetailsId
                        ]);
                    }
                }
            }

            // Recalculate total
            recalcTotals($db, $budgetId);

            // Audit
            auditBudget($db, $budgetId, 'created', "Budget v{$version} created" . ($version > 1 ? " (copied from v" . ($version - 1) . ")" : ""), $user->id);

            $db->commit();
            apiSuccess(['id' => $budgetId, 'version' => $version], 'Budget created');
            break;
        }

        // ───── Update Budget metadata ─────────────────────────
        case 'update_budget': {
            $budgetId = (int)($body['budget_id'] ?? 0);
            $budgetName = trim($body['budget_name'] ?? '');
            $notes = trim($body['notes'] ?? '');

            if ($budgetId <= 0) {
                apiError('Budget ID is required', 400);
            }

            $budget = getBudget($db, $budgetId);
            if (!$budget) apiError('Budget not found', 404);
            if (!in_array($budget['status'], ['draft', 'rejected'])) {
                apiError('Only draft or rejected budgets can be edited', 400);
            }

            $updates = [];
            $params = [':id' => $budgetId];
            if (!empty($budgetName)) {
                $updates[] = "budget_name = :name";
                $params[':name'] = $budgetName;
            }
            if ($notes !== '') {
                $updates[] = "notes = :notes";
                $params[':notes'] = $notes;
            }

            if (!empty($updates)) {
                $db->prepare("UPDATE event_budget SET " . implode(', ', $updates) . " WHERE id = :id")->execute($params);
                auditBudget($db, $budgetId, 'updated', "Budget metadata updated", $user->id);
            }

            apiSuccess(null, 'Budget updated');
            break;
        }

        // ───── Add Item ───────────────────────────────────────
        case 'add_item': {
            $budgetId = (int)($body['budget_id'] ?? 0);
            $category = trim($body['category'] ?? 'miscellaneous');
            $description = trim($body['description'] ?? '');
            $estimatedAmount = (float)($body['estimated_amount'] ?? 0);
            $vendor = trim($body['vendor'] ?? '');
            $notes = trim($body['notes'] ?? '');

            if ($budgetId <= 0 || empty($description) || $estimatedAmount <= 0) {
                apiError('Budget ID, description, and estimated amount are required', 400);
            }

            $budget = getBudget($db, $budgetId);
            if (!$budget) apiError('Budget not found', 404);
            if (!in_array($budget['status'], ['draft', 'rejected'])) {
                apiError('Items can only be added to draft or rejected budgets', 400);
            }

            // Resolve GL account for category
            $glAccountId = resolveGlAccount($db, $category);

            $db->beginTransaction();

            $mainBudgetId = $budget['budget_id'];
            if (!$mainBudgetId) {
                // If for some reason it doesn't exist, create it now
                $periodStmt = $db->prepare("
                    SELECT id FROM accounting_period 
                    WHERE CURRENT_DATE() BETWEEN start_date AND end_date AND is_closed = 0 
                    ORDER BY start_date DESC LIMIT 1
                ");
                $periodStmt->execute();
                $accountingPeriodId = $periodStmt->fetchColumn();
                if (!$accountingPeriodId) {
                    $periodStmt = $db->prepare("SELECT id FROM accounting_period WHERE is_closed = 0 ORDER BY start_date DESC LIMIT 1");
                    $periodStmt->execute();
                    $accountingPeriodId = $periodStmt->fetchColumn() ?: null;
                }

                $stmtMainBudget = $db->prepare("
                    INSERT INTO budget (budget_name, budget_purpose, is_active, accounting_period_id, reference_doc, created_by, update_by, created_at, updated_at)
                    VALUES (:name, 'event', 0, :accounting_period_id, :reference_doc, :user_id, :user_id, NOW(), NOW())
                ");
                $stmtMainBudget->execute([
                    ':name' => $budget['budget_name'],
                    ':accounting_period_id' => $accountingPeriodId,
                    ':reference_doc' => $budgetId,
                    ':user_id' => $user->id
                ]);
                $mainBudgetId = (int)$db->lastInsertId();

                $db->prepare("UPDATE event_budget SET budget_id = :budget_id WHERE id = :id")->execute([
                    ':budget_id' => $mainBudgetId,
                    ':id' => $budgetId
                ]);
            }

            // 1. Insert into budget_details
            $insertMainDetail = $db->prepare("
                INSERT INTO budget_details (budget_id, description, amount, created_on, created_by, updated_on, category, account_id)
                VALUES (:budget_id, :description, :amount, NOW(), :user_id, NOW(), 0, :account_id)
            ");
            $insertMainDetail->execute([
                ':budget_id' => $mainBudgetId,
                ':description' => $description,
                ':amount' => $estimatedAmount,
                ':user_id' => $user->id,
                ':account_id' => $glAccountId
            ]);
            $budgetDetailsId = (int)$db->lastInsertId();

            // 2. Insert into event_budget_item
            $stmt = $db->prepare("
                INSERT INTO event_budget_item (event_budget_id, category, description, estimated_amount, vendor, gl_account_id, notes, budget_details_id)
                VALUES (:budget_id, :category, :description, :amount, :vendor, :gl_id, :notes, :budget_details_id)
            ");
            $stmt->execute([
                ':budget_id' => $budgetId,
                ':category' => $category,
                ':description' => $description,
                ':amount' => $estimatedAmount,
                ':vendor' => $vendor ?: null,
                ':gl_id' => $glAccountId,
                ':notes' => $notes ?: null,
                ':budget_details_id' => $budgetDetailsId
            ]);
            $itemId = (int)$db->lastInsertId();

            recalcTotals($db, $budgetId);
            auditBudget($db, $budgetId, 'updated', "Added item: $description (KES " . number_format($estimatedAmount, 2) . ")", $user->id);

            $db->commit();
            apiSuccess(['id' => $itemId], 'Item added');
            break;
        }

        // ───── Update Item ────────────────────────────────────
        case 'update_item': {
            $itemId = (int)($body['item_id'] ?? 0);
            if ($itemId <= 0) apiError('Item ID is required', 400);

            $item = getItem($db, $itemId);
            if (!$item) apiError('Item not found', 404);

            $budget = getBudget($db, $item['event_budget_id']);
            if (!in_array($budget['status'], ['draft', 'rejected'])) {
                apiError('Items can only be edited in draft or rejected budgets', 400);
            }

            $fields = ['category', 'description', 'estimated_amount', 'vendor', 'notes'];
            $updates = [];
            $params = [':id' => $itemId];

            foreach ($fields as $f) {
                if (isset($body[$f])) {
                    $updates[] = "$f = :$f";
                    $params[":$f"] = $body[$f];
                }
            }

            // Update GL account if category changed
            if (isset($body['category'])) {
                $updates[] = "gl_account_id = :gl_id";
                $params[':gl_id'] = resolveGlAccount($db, $body['category']);
            }

            if (!empty($updates)) {
                $db->beginTransaction();
                $db->prepare("UPDATE event_budget_item SET " . implode(', ', $updates) . " WHERE id = :id")->execute($params);

                // Sync to budget_details
                if ($item['budget_details_id']) {
                    $detailsUpdates = [];
                    $detailsParams = [':details_id' => $item['budget_details_id']];
                    
                    if (isset($body['description'])) {
                        $detailsUpdates[] = "description = :desc";
                        $detailsParams[':desc'] = $body['description'];
                    }
                    if (isset($body['estimated_amount'])) {
                        $detailsUpdates[] = "amount = :amount";
                        $detailsParams[':amount'] = (float)$body['estimated_amount'];
                    }
                    if (isset($body['category'])) {
                        $detailsUpdates[] = "account_id = :account_id";
                        $detailsParams[':account_id'] = resolveGlAccount($db, $body['category']);
                    }
                    
                    if (!empty($detailsUpdates)) {
                        $detailsUpdates[] = "updated_on = NOW()";
                        $db->prepare("UPDATE budget_details SET " . implode(', ', $detailsUpdates) . " WHERE id = :details_id")->execute($detailsParams);
                    }
                }

                recalcTotals($db, $item['event_budget_id']);
                auditBudget($db, $item['event_budget_id'], 'updated', "Updated item #{$itemId}", $user->id);
                $db->commit();
            }

            apiSuccess(null, 'Item updated');
            break;
        }

        // ───── Delete Item ────────────────────────────────────
        case 'delete_item': {
            $itemId = (int)($body['item_id'] ?? 0);
            if ($itemId <= 0) apiError('Item ID is required', 400);

            $item = getItem($db, $itemId);
            if (!$item) apiError('Item not found', 404);

            $budget = getBudget($db, $item['event_budget_id']);
            if (!in_array($budget['status'], ['draft', 'rejected'])) {
                apiError('Items can only be deleted from draft or rejected budgets', 400);
            }
            if ($item['status'] === 'paid') {
                apiError('Cannot delete a paid item', 400);
            }

            $db->beginTransaction();
            $db->prepare("DELETE FROM event_budget_item WHERE id = :id")->execute([':id' => $itemId]);

            // Sync to budget_details
            if ($item['budget_details_id']) {
                $db->prepare("DELETE FROM budget_details WHERE id = :details_id")->execute([':details_id' => $item['budget_details_id']]);
            }

            recalcTotals($db, $item['event_budget_id']);
            auditBudget($db, $item['event_budget_id'], 'updated', "Deleted item: {$item['description']}", $user->id);
            $db->commit();

            apiSuccess(null, 'Item deleted');
            break;
        }

        // ───── Submit for Approval ────────────────────────────
        case 'submit': {
            $budgetId = (int)($body['budget_id'] ?? 0);
            if ($budgetId <= 0) apiError('Budget ID is required', 400);

            $budget = getBudget($db, $budgetId);
            if (!$budget) apiError('Budget not found', 404);
            if (!in_array($budget['status'], ['draft', 'rejected'])) {
                apiError('Only draft or rejected budgets can be submitted', 400);
            }

            // Must have at least one item
            $stmt = $db->prepare("SELECT COUNT(*) FROM event_budget_item WHERE event_budget_id = :id AND status != 'cancelled'");
            $stmt->execute([':id' => $budgetId]);
            if ((int)$stmt->fetchColumn() === 0) {
                apiError('Budget must have at least one item before submitting', 400);
            }

            $db->beginTransaction();
            $db->prepare("UPDATE event_budget SET status = 'pending_approval' WHERE id = :id")->execute([':id' => $budgetId]);
            auditBudget($db, $budgetId, 'submitted', "Budget submitted for approval (Total: KES " . number_format($budget['total_estimated'], 2) . ")", $user->id);
            $db->commit();

            apiSuccess(null, 'Budget submitted for approval');
            break;
        }

        default:
            apiError("Unknown action: $action", 400);
    }

} catch (PDOException $e) {
    if ($db->inTransaction()) $db->rollBack();
    error_log("Save event budget error: " . $e->getMessage());
    apiError('Failed to save budget', 500);
}

// ── Helpers ──────────────────────────────────────────────────

function getBudget(PDO $db, int $id): ?array {
    $stmt = $db->prepare("SELECT * FROM event_budget WHERE id = :id");
    $stmt->execute([':id' => $id]);
    return $stmt->fetch() ?: null;
}

function getItem(PDO $db, int $id): ?array {
    $stmt = $db->prepare("SELECT * FROM event_budget_item WHERE id = :id");
    $stmt->execute([':id' => $id]);
    return $stmt->fetch() ?: null;
}

function recalcTotals(PDO $db, int $budgetId): void {
    $db->prepare("
        UPDATE event_budget SET
            total_estimated = COALESCE((SELECT SUM(estimated_amount) FROM event_budget_item WHERE event_budget_id = :id1 AND status != 'cancelled'), 0),
            total_actual = COALESCE((SELECT SUM(COALESCE(actual_amount, 0)) FROM event_budget_item WHERE event_budget_id = :id2 AND status = 'paid'), 0)
        WHERE id = :id3
    ")->execute([':id1' => $budgetId, ':id2' => $budgetId, ':id3' => $budgetId]);
}

function resolveGlAccount(PDO $db, string $category): ?int {
    $map = [
        'venue' => '5031',
        'catering' => '5032',
        'transport' => '5033',
        'sound_av' => '5034',
        'printing' => '5035',
        'decoration' => '5036',
        'speaker_honorarium' => '5037',
        'marketing' => '5038',
        'accommodation' => '5039',
        'miscellaneous' => '50301',
    ];
    $code = $map[$category] ?? '50301';
    $stmt = $db->prepare("SELECT id FROM account WHERE account_code = :code AND is_active = 1");
    $stmt->execute([':code' => $code]);
    $row = $stmt->fetch();
    return $row ? (int)$row['id'] : null;
}

function auditBudget(PDO $db, int $budgetId, string $action, string $details, int $userId): void {
    $db->prepare("
        INSERT INTO event_budget_audit (event_budget_id, action, details, performed_by)
        VALUES (:id, :action, :details, :user_id)
    ")->execute([':id' => $budgetId, ':action' => $action, ':details' => $details, ':user_id' => $userId]);
}
