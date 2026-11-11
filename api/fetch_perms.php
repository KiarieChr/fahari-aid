<?php
require_once 'config.php';
$stmt = $db->query("SELECT p.name, c.name as category FROM permissions p LEFT JOIN permission_category c ON p.category = c.id");
$perms = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo json_encode($perms, JSON_PRETTY_PRINT);
?>
