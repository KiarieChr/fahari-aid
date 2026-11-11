<?php
require_once 'config.php';
require_once 'middleware.php';

try {
    global $db;
    $q = isset($_GET['q']) ? trim($_GET['q']) : '';
    $country_id = isset($_GET['country_id']) ? (int)$_GET['country_id'] : 0;
    
    $query = "SELECT c.id, c.name, s.name as state_name, co.name as country_name 
              FROM cities c
              JOIN states s ON c.state_id = s.id
              JOIN countries co ON s.country_id = co.id
              WHERE c.name LIKE :q ";
              
    $params = [':q' => $q . '%'];

    if ($country_id > 0) {
        $query .= " AND co.id = :cid ";
        $params[':cid'] = $country_id;
    }
    
    $query .= " ORDER BY c.name ASC LIMIT 50";
    
    $stmt = $db->prepare($query);
    $stmt->execute($params);
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode(["success" => true, "data" => $data]);
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
