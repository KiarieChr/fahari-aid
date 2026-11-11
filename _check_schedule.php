<?php
$db = new PDO('mysql:host=localhost;dbname=jen', 'root', 'Admin@2025');
$r = $db->query("DESCRIBE event_schedule");
foreach ($r as $row) {
    echo $row['Field'] . ' | ' . $row['Type'] . "\n";
}
