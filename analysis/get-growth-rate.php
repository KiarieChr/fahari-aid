<?php
require '../includes/connection.php';

$today = date('Y-m-d');
    $lastWeek = date('Y-m-d', strtotime('-7 days'));
    $prevWeek = date('Y-m-d', strtotime('-14 days'));

    // Count for last 7 days
    $stmt = $db->prepare("SELECT COUNT(*) FROM member WHERE joined_on BETWEEN :lastWeek AND :today");
    $stmt->execute([':lastWeek' => $lastWeek, ':today' => $today]);
    $growth = $stmt->fetchColumn();

    // Count for the previous 7 days
    $stmt2 = $db->prepare("SELECT COUNT(*) FROM member WHERE joined_on < :lastWeek");
    $stmt2->execute([':lastWeek' => $lastWeek]);
    $previousCount = $stmt2->fetchColumn();

// Calculate growth
if ($previousCount == 0 && $growth > 0) {
    $growthRate = 100; // avoid division by zero
} elseif ($previousCount == 0 && $growth == 0) {
    $growthRate = 0;
} else {
    $growthRate = round((($growth / $previousCount) * 100),2);
}

// Send as JSON
echo json_encode(['growth' => round($growthRate, 1)]);
?>