<?php
/**
 * Quick verification of JournalService and all accounting endpoints
 */
require __DIR__ . '/includes/connection.php';
require __DIR__ . '/api/JournalService.php';

echo "=== Testing JournalService ===\n";

$js = new JournalService($db);

// Test account lookup
try {
    $cashId = $js->getAccountByCode('1000');
    echo "OK: Cash account id = $cashId\n";
    $bankId = $js->getAccountByCode('1010');
    echo "OK: Bank account id = $bankId\n";
    $tithesId = $js->getAccountByCode('4000');
    echo "OK: Tithes account id = $tithesId\n";
    $rentId = $js->getAccountByCode('5010');
    echo "OK: Rent account id = $rentId\n";
} catch (Exception $e) {
    echo "FAIL: " . $e->getMessage() . "\n";
}

// Test creating a journal entry
echo "\n=== Testing Journal Entry Creation ===\n";
try {
    $db->beginTransaction();

    $jeId = $js->createEntry('2026-03-31', 'Test income entry', 'income', null, 1, [
        ['account_id' => $cashId, 'debit' => 1000.00, 'credit' => 0, 'description' => 'Cash received'],
        ['account_id' => $tithesId, 'debit' => 0, 'credit' => 1000.00, 'description' => 'Tithe revenue'],
    ]);
    echo "OK: Journal entry created, id = $jeId\n";

    // Verify lines
    $lines = $db->query("SELECT * FROM journal_entry_line WHERE journal_entry_id = $jeId")->fetchAll(PDO::FETCH_ASSOC);
    echo "OK: " . count($lines) . " lines created\n";

    // Check balance
    $debitSum = array_sum(array_column($lines, 'debit'));
    $creditSum = array_sum(array_column($lines, 'credit'));
    echo "OK: Debit=$debitSum, Credit=$creditSum, Balanced=" . ($debitSum == $creditSum ? 'YES' : 'NO') . "\n";

    // Verify reference number
    $ref = $db->query("SELECT reference_no FROM journal_entry WHERE id = $jeId")->fetchColumn();
    echo "OK: Reference = $ref\n";

    // Test reversal
    $revId = $js->reverseEntry($jeId, 1);
    echo "OK: Reversal entry id = $revId\n";

    // Verify original is marked reversed
    $reversed = $db->query("SELECT is_reversed, reversed_by_id FROM journal_entry WHERE id = $jeId")->fetch(PDO::FETCH_ASSOC);
    echo "OK: Original is_reversed = " . $reversed['is_reversed'] . ", reversed_by = " . $reversed['reversed_by_id'] . "\n";

    $db->rollBack(); // Don't keep test data
    echo "OK: Test data rolled back\n";
} catch (Exception $e) {
    $db->rollBack();
    echo "FAIL: " . $e->getMessage() . "\n";
}

// Test unbalanced entry should fail
echo "\n=== Testing Unbalanced Entry (should fail) ===\n";
try {
    $js->createEntry('2026-03-31', 'Bad entry', 'adjustment', null, 1, [
        ['account_id' => $cashId, 'debit' => 500, 'credit' => 0],
        ['account_id' => $tithesId, 'debit' => 0, 'credit' => 300],
    ]);
    echo "FAIL: Should have thrown exception\n";
} catch (Exception $e) {
    echo "OK: Correctly rejected — " . $e->getMessage() . "\n";
}

// Verify all accounting tables
echo "\n=== Table Verification ===\n";
$tables = ['account', 'journal_entry', 'journal_entry_line', 'audit_log', 'accounting_period', 'payment_account_map', 'payroll_run', 'payroll_item'];
foreach ($tables as $t) {
    try {
        $cnt = $db->query("SELECT COUNT(*) FROM $t")->fetchColumn();
        echo "OK: $t — $cnt rows\n";
    } catch (Exception $e) {
        echo "FAIL: $t — " . $e->getMessage() . "\n";
    }
}

echo "\n=== All Tests Complete ===\n";
