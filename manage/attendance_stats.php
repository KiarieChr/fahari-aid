<?php
require '../includes/connection.php';

$sql = "
    SELECT m.name, COUNT(a.id) as present_count
    FROM meeting m
    LEFT JOIN attendance a ON a.meeting_id = m.id
    GROUP BY m.name
    ORDER BY m.name ASC;
";

$query = $db->query($sql);
$data = [];

while ($row = $query->fetch(PDO::FETCH_ASSOC)) {
    $data[] = [
        'date' => $row['name'],
        'present' => (int) $row['present_count']
    ];
}

echo json_encode($data);
?>