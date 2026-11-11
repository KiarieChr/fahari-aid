<?php
require '../includes/connection.php';

$year = isset($_GET['year']) ? (int)$_GET['year'] : (int)date('Y');

$sql = "
    SELECT 
        MONTH(m.start_time) AS month,
        COUNT(a.id) / COUNT(DISTINCT DATE(m.start_time)) AS avg_present_per_tuesday
    FROM meeting m
    LEFT JOIN attendance a ON a.meeting_id = m.id
    WHERE DAYOFWEEK(m.start_time) = 3   -- Only Tuesdays
      AND YEAR(m.start_time) = :year
    GROUP BY MONTH(m.start_time)
    ORDER BY MONTH(m.start_time);
";

$stmt = $db->prepare($sql);
$stmt->execute([':year' => $year]);

// Initialize all months to 0
$data = array_fill(1, 12, 0);

while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $month = (int) $row['month'];
    $data[$month] = (int) $row['avg_present_per_tuesday'];
}

// Convert to an indexed array (Jan to Dec)
echo json_encode(array_values($data));