<?php
require '../includes/connection.php';
// Check if the user is logged in via cookies


    $member_id = $_GET['member_id'];

$current_year = date('Y');



$sql = "
    SELECT 
        MONTH(m.start_time) AS month,
        COUNT(a.id) AS present
    FROM meeting m
    LEFT JOIN attendance a ON a.meeting_id = m.id AND a.member_id = :member_id
    WHERE YEAR(m.start_time) = :year
    GROUP BY MONTH(m.start_time)
    ORDER BY MONTH(m.start_time)
";

$stmt = $db->prepare($sql);
$stmt->execute([
    ':member_id' => $member_id,
    ':year' => $current_year
]);

$rawData = $stmt->fetchAll(PDO::FETCH_KEY_PAIR); // [month => count]

// Fill in all 12 months
$data = [];
for ($i = 1; $i <= 12; $i++) {
    $data[] = (int) ($rawData[$i] ?? 0);
}

echo json_encode($data);
?>
