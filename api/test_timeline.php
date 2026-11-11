<?php
require 'config.php';
global $db;
$stmt = $db->query("DESCRIBE user_timeline");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
$stmt2 = $db->query("DESCRIBE users");
print_r($stmt2->fetchAll(PDO::FETCH_ASSOC));
$stmt3 = $db->query("DESCRIBE member");
print_r($stmt3->fetchAll(PDO::FETCH_ASSOC));
?>
