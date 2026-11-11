<?php
header('Content-Type: application/json');
include('../includes/connection.php');

// try to fethc the data from the talas event_registratin, event, and the invitee
try{
    $stmt = $db->query('SELECT e.ename, e.target_attendees, COUNT(DISTINCT r.id) AS total_registrations, COUNT(DISTINCT i.id) AS total_invitees FROM event e LEFT JOIN event_registration r ON e.id = r.event_id LEFT JOIN invitees i ON e.id = i.event_id WHERE e.start_date >= CURDATE() GROUP BY e.id, e.ename, e.target_attendees ORDER BY e.start_date ASC;');
    
    $events = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success'=>true,
        'events'=>$events
    ]);
}
catch (Exception $e){
    echo json_encode([
        'success'=>false,
        'message'=>$e->getMessage()
    ]);
}