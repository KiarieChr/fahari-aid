<?php
require 'api/config.php';
$stmt = $db->query('SHOW TABLES');
$tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
print_r($tables);
