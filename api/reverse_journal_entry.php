<?php
/**
 * Reverse a Journal Entry
 * POST /api/reverse_journal_entry.php
 * Body: { journal_entry_id }
 */
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/middleware.php';
require_once __DIR__ . '/JournalService.php';

$user = authenticate();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    apiError('Method not allowed', 405);
}

$body = getJsonBody();
$jeId = (int)($body['journal_entry_id'] ?? 0);

if ($jeId <= 0) {
    apiError('journal_entry_id is required', 400);
}

try {
    $db->beginTransaction();

    $js = new JournalService($db);
    $reversalId = $js->reverseEntry($jeId, $user->id);
    $js->audit('journal_entry', $jeId, 'reverse', null, ['reversed_by_id' => $reversalId], $user->id);

    $db->commit();
    apiSuccess(['original_id' => $jeId, 'reversal_id' => $reversalId], 'Journal entry reversed successfully');

} catch (Exception $e) {
    $db->rollBack();
    error_log("Reverse journal error: " . $e->getMessage());
    apiError($e->getMessage(), 500);
}
