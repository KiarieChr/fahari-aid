<?php
/**
 * Add Manual Journal Entry
 * POST /api/add_journal_entry.php
 * Body: { entry_date, description, lines: [{ account_id, debit, credit, description, fund_id }] }
 */
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/middleware.php';
require_once __DIR__ . '/JournalService.php';

$user = authenticate();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    apiError('Method not allowed', 405);
}

$body = getJsonBody();

$entryDate = trim($body['entry_date'] ?? '');
$description = trim($body['description'] ?? '');
$lines = $body['lines'] ?? [];

if (empty($entryDate) || empty($description)) {
    apiError('Entry date and description are required', 400);
}

if (count($lines) < 2) {
    apiError('At least two lines (debit and credit) are required', 400);
}

// Validate lines
$totalDebit = 0;
$totalCredit = 0;
foreach ($lines as $i => $line) {
    if (empty($line['account_id'])) {
        apiError("Line " . ($i + 1) . ": account_id is required", 400);
    }
    $d = (float)($line['debit'] ?? 0);
    $c = (float)($line['credit'] ?? 0);
    if ($d == 0 && $c == 0) {
        apiError("Line " . ($i + 1) . ": debit or credit must be non-zero", 400);
    }
    if ($d > 0 && $c > 0) {
        apiError("Line " . ($i + 1) . ": cannot have both debit and credit", 400);
    }
    $totalDebit += $d;
    $totalCredit += $c;
}

if (abs($totalDebit - $totalCredit) > 0.01) {
    apiError("Entry is unbalanced: Total Debit = $totalDebit, Total Credit = $totalCredit", 400);
}

try {
    $db->beginTransaction();

    $js = new JournalService($db);

    $formattedLines = [];
    foreach ($lines as $line) {
        $formattedLines[] = [
            'account_id' => (int)$line['account_id'],
            'debit' => round((float)($line['debit'] ?? 0), 2),
            'credit' => round((float)($line['credit'] ?? 0), 2),
            'description' => $line['description'] ?? null,
            'fund_id' => !empty($line['fund_id']) ? (int)$line['fund_id'] : null,
        ];
    }

    $jeId = $js->createEntry($entryDate, $description, 'adjustment', null, $user->id, $formattedLines);
    $js->audit('journal_entry', $jeId, 'create', null, ['description' => $description, 'lines' => count($lines)], $user->id);

    $db->commit();
    apiSuccess(['id' => $jeId], 'Journal entry created successfully');

} catch (Exception $e) {
    $db->rollBack();
    error_log("Add journal entry error: " . $e->getMessage());
    apiError($e->getMessage(), 500);
}
