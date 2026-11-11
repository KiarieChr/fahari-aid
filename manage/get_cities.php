<?php

require '../includes/connection.php';

$country_id = $_GET['country_id'] ?? 0;


$stmst = $db->prepare("SELECT id, name from cities where country_id =?");

$stmst->execute([$country_id]);

$cities =$stmst->fetchAll(PDO::FETCH_ASSOC);

header('Content-Type: application/json');
echo json_encode($cities);

?>
