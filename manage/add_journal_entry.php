<?php
// manage/add_journal_entry.php
ob_start();
require_once('../includes/checklogin.php');
ob_clean();
header('Content-Type: application/json; charset=utf-8');
require_once('../api/JournalService.php');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit();
}

// Get request body (JSON or form data)
$json = file_get_contents('php://input');
$body = json_decode($json, true);
if (json_last_error() !== JSON_ERROR_NONE || empty($body)) {
    $body = $_POST;
}

$entryDate = trim($body['entry_date'] ?? '');
$description = trim($body['description'] ?? '');
$lines = $body['lines'] ?? [];

if (empty($entryDate) || empty($description)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Entry date and description are required']);
    exit();
}

if (count($lines) < 2) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'At least two lines (debit and credit) are required']);
    exit();
}

// Validate lines
$totalDebit = 0;
$totalCredit = 0;
foreach ($lines as $i => $line) {
    if (empty($line['account_id'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => "Line " . ($i + 1) . ": account_id is required"]);
        exit();
    }
    $d = (float)($line['debit'] ?? 0);
    $c = (float)($line['credit'] ?? 0);
    if ($d == 0 && $c == 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => "Line " . ($i + 1) . ": debit or credit must be non-zero"]);
        exit();
    }
    if ($d > 0 && $c > 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => "Line " . ($i + 1) . ": cannot have both debit and credit"]);
        exit();
    }
    $totalDebit += $d;
    $totalCredit += $c;
}

if (abs($totalDebit - $totalCredit) > 0.01) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => "Entry is unbalanced: Total Debit = $totalDebit, Total Credit = $totalCredit"]);
    exit();
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

    // $user_id is set by checklogin.php
    $jeId = $js->createEntry($entryDate, $description, 'adjustment', null, $user_id, $formattedLines);
    $js->audit('journal_entry', $jeId, 'create', null, ['description' => $description, 'lines' => count($lines)], $user_id);

    $db->commit();
    echo json_encode([
        'success' => true,
        'data' => ['id' => $jeId],
        'message' => 'Journal entry created successfully'
    ]);

} catch (Exception $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to create journal entry: ' . $e->getMessage()
    ]);
}
?>
