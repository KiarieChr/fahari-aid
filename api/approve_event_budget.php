<?php
/**
 * Approve / Reject Event Budget
 * POST /api/approve_event_budget.php
 * 
 * Body: { budget_id, decision: "approve"|"reject", reason? }
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/middleware.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    apiError('Method not allowed', 405);
}

$user = authenticate();
$body = getJsonBody();

$budgetId = (int)($body['budget_id'] ?? 0);
$decision = trim($body['decision'] ?? '');
$reason = trim($body['reason'] ?? '');

if ($budgetId <= 0) apiError('Budget ID is required', 400);
if (!in_array($decision, ['approve', 'reject'])) {
    apiError('Decision must be "approve" or "reject"', 400);
}
if ($decision === 'reject' && empty($reason)) {
    apiError('Rejection reason is required', 400);
}

try {
    $stmt = $db->prepare("SELECT * FROM event_budget WHERE id = :id");
    $stmt->execute([':id' => $budgetId]);
    $budget = $stmt->fetch();

    if (!$budget) apiError('Budget not found', 404);
    if ($budget['status'] !== 'pending_approval') {
        apiError('Budget is not pending approval', 400);
    }

    $db->beginTransaction();

    if ($decision === 'approve') {
        $db->prepare("
            UPDATE event_budget SET status = 'approved', approved_by = :uid, approved_at = NOW()
            WHERE id = :id
        ")->execute([':uid' => $user->id, ':id' => $budgetId]);

        // Activate the corresponding main budget record
        if ($budget['budget_id']) {
            // Deactivate other budgets for the same event first
            $db->prepare("
                UPDATE budget SET is_active = 0 
                WHERE reference_doc IN (SELECT id FROM event_budget WHERE event_id = :event_id)
            ")->execute([':event_id' => $budget['event_id']]);

            // Activate the approved budget record
            $db->prepare("
                UPDATE budget SET is_active = 1 
                WHERE id = :budget_id
            ")->execute([':budget_id' => $budget['budget_id']]);
        }

        // Audit
        $db->prepare("
            INSERT INTO event_budget_audit (event_budget_id, action, details, performed_by)
            VALUES (:id, 'approved', :details, :uid)
        ")->execute([
            ':id' => $budgetId,
            ':details' => "Budget approved. Estimated total: KES " . number_format($budget['total_estimated'], 2),
            ':uid' => $user->id
        ]);
    } else {
        $db->prepare("
            UPDATE event_budget SET status = 'rejected', rejection_reason = :reason
            WHERE id = :id
        ")->execute([':reason' => $reason, ':id' => $budgetId]);

        $db->prepare("
            INSERT INTO event_budget_audit (event_budget_id, action, details, performed_by)
            VALUES (:id, 'rejected', :details, :uid)
        ")->execute([
            ':id' => $budgetId,
            ':details' => "Budget rejected. Reason: $reason",
            ':uid' => $user->id
        ]);
    }

    $db->commit();
    apiSuccess(null, $decision === 'approve' ? 'Budget approved' : 'Budget rejected');

} catch (PDOException $e) {
    if ($db->inTransaction()) $db->rollBack();
    error_log("Approve budget error: " . $e->getMessage());
    apiError('Failed to process approval', 500);
}
