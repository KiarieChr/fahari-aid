<?php
require '../includes/connection.php';

$department_id = intval($_GET['department_id'] ?? 0);

$stmt = $db->prepare("SELECT id, name FROM sub_departments WHERE department = ? ORDER BY name ASC");
$stmt->execute([$department_id]);
$sub_depts = $stmt->fetchAll(PDO::FETCH_ASSOC);

header('Content-Type: application/json');
echo json_encode($sub_depts);
?>
