<?php
require '../includes/connection.php';
header('Content-Type: application/json');

$user_id = $_GET['user_id'] ?? null;

if (!$user_id) {
    echo json_encode([]);
    exit;
}
$stmt = $db->prepare("SELECT id,title, detail, created_at FROM user_timeline WHERE user_id = :uid ORDER BY created_at DESC ");
$stmt->bindParam(':uid', $user_id, PDO::PARAM_INT);
$stmt->execute();

echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
?>
