<?php
require __DIR__ . '/includes/connection.php';
$db->exec("DELETE FROM accounting_period WHERE id IN (3,4)");
$db->exec("DELETE FROM payment_account_map WHERE id IN (3,4)");
echo "Periods: " . $db->query("SELECT COUNT(*) FROM accounting_period")->fetchColumn() . "\n";
echo "Maps: " . $db->query("SELECT COUNT(*) FROM payment_account_map")->fetchColumn() . "\n";
echo "Done\n";
