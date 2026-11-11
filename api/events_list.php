<?php 

// fetch events called via ajax
ob_start();
header("Content-Type: application/json");
//include connection for the MySQL database
include("../includes/connection.php");

//query for events in the events table

try{
    $sql = 'SELECT id AS value, ename AS label FROM event WHERE start_date >= :today ORDER BY start_date';
    $today = date('Y-m-d');

    $stmt= $db->prepare($sql);
    
    $stmt->execute(['today'=> $today]);

    $events = $stmt->fetchAll(PDO::FETCH_ASSOC);

    //enchode to json
    echo json_encode($events);


}
catch(Exception $e){
    http_response_code(500);
    echo json_encode(['error'=> $e->getMessage()]);
}
?>