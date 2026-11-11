<?php
// get the collections requested via ajax
// return json data
header('Content-Type: application/json');
include('../includes/connection.php');

try {
    // get the start and end date passed via GET
    $startDate = isset($_GET['start_date']) ? $_GET['start_date'] : null;
    $endDate = isset($_GET['end_date']) ? $_GET['end_date'] : null;

    $collections = [];
    $sql = "SELECT * FROM collections WHERE 1=1";

    if ($startDate) {
        $sql .= " AND recorded_on >= :start_date";
    }
    if ($endDate) {
        $sql .= " AND recorded_on <= :end_date";
    }
    $sql .= " ORDER BY recorded_on DESC";

    $stmt = $db->prepare($sql);
    if ($startDate) {
        $stmt->bindParam(':start_date', $startDate);
    }
    if ($endDate) {
        $stmt->bindParam(':end_date', $endDate);
    }
    $stmt->execute();
    $collections = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode($collections);
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error']);
}

// No need to explicitly close PDO connection
?>