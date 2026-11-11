<?php
require_once('includes/connection.php');
echo "trn_tracks schema:\n";
foreach($db->query("DESCRIBE trn_tracks")->fetchAll(PDO::FETCH_ASSOC) as $row) {
    echo $row['Field'] . " - " . $row['Type'] . "\n";
}
?>
