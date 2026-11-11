<?php

require '../includes/connection.php';
header('Content-Type: application/json');

$user_id = $_GET['user_id'] ?? null;

if (!$user_id) {
    echo json_encode([]);
    exit;
}
$stmt = $db->prepare("SELECT id,title, message, created_at FROM notifications WHERE (user_id = :uid or user_id is null) AND is_read = 0  ORDER BY created_at DESC");
$stmt->bindParam(':uid', $user_id, PDO::PARAM_INT);
$stmt->execute();

echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
?>
